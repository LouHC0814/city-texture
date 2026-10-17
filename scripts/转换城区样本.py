"""将本地 Overpass JSON / JSON.gz 转为城市纹理样本包；不联网，不修改原始文件。"""
from __future__ import annotations

import argparse
import gzip
import hashlib
import json
import math
import os
from pathlib import Path
import re
import shutil
import subprocess
import tempfile

from 获取建筑数据 import convert as convert_buildings
from 获取城市数据 import ROAD_TYPES, ROOT

MAX_RAW_BYTES = 40 * 1024 * 1024
MAX_CONFIG_BYTES = 128 * 1024
MAX_SAMPLE_BYTES = 8 * 1024 * 1024
MAX_SAFE_INTEGER = 2**53 - 1
SUPPORTED_ROADS = set(ROAD_TYPES.split('|')) | {'pedestrian', 'footway', 'path', 'cycleway', 'steps'}
NUMBER = r'-?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?'
BOX_PATTERN = re.compile(r'(?:\(|\[bbox:)\s*(' + NUMBER + r')\s*,\s*(' + NUMBER + r')\s*,\s*(' + NUMBER + r')\s*,\s*(' + NUMBER + r')\s*(?:\)|\])')


def strict_json(raw: bytes, label: str):
    def constant(value):
        raise ValueError(f'{label} 包含非 JSON 数值 {value}')
    def unique(pairs):
        result = {}
        for key, value in pairs:
            if key in result:
                raise ValueError(f'{label} 包含重复 JSON 字段')
            result[key] = value
        return result
    try:
        return json.loads(raw.decode('utf-8-sig'), parse_constant=constant, object_pairs_hook=unique)
    except (UnicodeError, json.JSONDecodeError, RecursionError) as error:
        raise ValueError(f'{label} 不是有效 UTF-8 JSON：{error}') from error


def read_limited(path: Path, limit: int, compressed: bool = False) -> bytes:
    try:
        opener = gzip.open if compressed else open
        with opener(path, 'rb') as stream:
            raw = stream.read(limit + 1)
    except (OSError, EOFError) as error:
        raise ValueError(f'不能读取 {path.name}：{error}') from error
    if len(raw) > limit:
        raise ValueError(f'{path.name} 解压后的内容超过 {limit} 字节上限')
    return raw


def safe_id(value):
    return type(value) is int and 0 < value <= MAX_SAFE_INTEGER


def raw_document(raw: bytes, label: str) -> dict:
    doc = strict_json(raw, label)
    if not isinstance(doc, dict) or not isinstance(doc.get('elements'), list):
        raise ValueError(f'{label} 缺少 elements 数组')
    if doc.get('remark'):
        raise ValueError(f'{label} 含 Overpass 错误提示，拒绝部分响应')
    if len(doc['elements']) > 50000:
        raise ValueError(f'{label} 超过 50,000 个原始要素')
    seen, point_count = set(), 0
    for element in doc['elements']:
        if not isinstance(element, dict) or element.get('type') not in ('node', 'way', 'relation') or not safe_id(element.get('id')):
            raise ValueError(f'{label} 的 OSM 要素类型或 ID 无效')
        key = (element['type'], element['id'])
        if key in seen:
            raise ValueError(f'{label} 出现重复 OSM 要素 {key}')
        seen.add(key)
        tags = element.get('tags', {})
        if not isinstance(tags, dict) or not all(isinstance(k, str) and isinstance(v, str) for k, v in tags.items()):
            raise ValueError(f'{label} 的 tags 必须为文本键值对象')
        geometries = [element.get('geometry')]
        if element['type'] == 'relation':
            members = element.get('members', [])
            if not isinstance(members, list) or len(members) > 1024:
                raise ValueError(f'{label} 的关系成员无效或超过 1,024 个')
            for member in members:
                if not isinstance(member, dict) or member.get('type') not in ('node', 'way', 'relation') or not safe_id(member.get('ref')) or not isinstance(member.get('role', ''), str):
                    raise ValueError(f'{label} 的关系成员格式无效')
                geometries.append(member.get('geometry'))
        for geometry in geometries:
            if geometry is None:
                continue  # 缺失的建筑成员几何由既有转换器记录为 skipped。
            if not isinstance(geometry, list) or len(geometry) > 4096:
                raise ValueError(f'{label} 的单段几何无效或超过 4,096 点')
            point_count += len(geometry)
            if point_count > 1000000:
                raise ValueError(f'{label} 的原始几何超过 1,000,000 点')
            for point in geometry:
                if point is None:
                    continue
                if not isinstance(point, dict) or any(type(point.get(k)) not in (int, float) or not math.isfinite(point[k]) or abs(point[k]) > bound for k, bound in (('lon', 180), ('lat', 85))):
                    raise ValueError(f'{label} 包含无效经纬度')
    return doc


def dataset(config: dict, base: Path, label: str):
    if not isinstance(config, dict) or not isinstance(config.get('file'), str) or not config['file'].strip():
        raise ValueError(f'{label} 需要本地 file 路径')
    path = (base / config['file']).resolve()
    bbox = config.get('bbox')
    if not isinstance(bbox, list) or len(bbox) != 4 or any(type(v) not in (int, float) or not math.isfinite(v) for v in bbox):
        raise ValueError(f'{label} 需要四个有限数字的 bbox')
    source = config.get('source')
    if not isinstance(source, dict) or not isinstance(source.get('query'), str):
        raise ValueError(f'{label} 缺少 source.query 来源记录')
    # 只检查显式数字框的一致性，不把查询文本当成已执行或完整性的证明。
    boxes = BOX_PATTERN.findall(source['query'])
    if not boxes or any(any(abs(float(v) - expected) > 1.00001e-7 for v, expected in zip(box, bbox)) for box in boxes):
        raise ValueError(f'{label} 的 bbox 与查询中的显式数字下载框不一致；不支持只用 area/around/poly 定义范围的查询')
    raw = read_limited(path, MAX_RAW_BYTES, path.suffix.lower() == '.gz')
    doc = raw_document(raw, label)
    digest = hashlib.sha256(raw).hexdigest()
    declared = source.get('rawSha256')
    if declared is not None and (not isinstance(declared, str) or not re.fullmatch(r'[0-9a-fA-F]{64}', declared) or declared.lower() != digest):
        raise ValueError(f'{label} 的原始数据 SHA-256 不匹配')
    osm3s = doc.get('osm3s', {})
    if not isinstance(osm3s, dict):
        raise ValueError(f'{label} 的 osm3s 格式无效')
    token = osm3s.get('timestamp_osm_base')
    if token is not None:
        if type(token) not in (str, int) or isinstance(token, bool):
            raise ValueError(f'{label} 的接口快照标识无效')
        token = str(token)
        if source.get('snapshotToken') is not None and source['snapshotToken'] != token:
            raise ValueError(f'{label} 的接口快照标识与响应不一致')
    else:
        token = source.get('snapshotToken')
    if not isinstance(token, str) or not token.strip():
        raise ValueError(f'{label} 未提供接口快照标识，请在 source.snapshotToken 中如实记录')
    normalized_source = dict(name=source.get('name', 'OpenStreetMap contributors'), license=source.get('license', 'ODbL-1.0'),
                             url=source.get('url', 'https://www.openstreetmap.org/copyright'),
                             endpoint=source.get('endpoint'), query=source['query'], fetchedAt=source.get('fetchedAt'),
                             snapshotToken=token, rawSha256=digest, limitations=source.get('limitations'))
    return path, bbox, normalized_source, doc['elements']


def road_features(elements):
    roads, ignored = [], 0
    for element in elements:
        if element['type'] != 'way' or 'highway' not in element.get('tags', {}):
            continue
        kind = element['tags']['highway']
        if kind not in SUPPORTED_ROADS:
            ignored += 1
            continue
        geometry, nodes = element.get('geometry'), element.get('nodes')
        if not isinstance(geometry, list) or len(geometry) < 2 or not isinstance(nodes, list) or len(nodes) != len(geometry) or not all(safe_id(node) for node in nodes) or any(point is None for point in geometry):
            raise ValueError(f'道路 way/{element["id"]} 的节点与完整几何不一致，请使用 out geom 的完整响应')
        coordinates = [[round(point['lon'], 7), round(point['lat'], 7)] for point in geometry]
        roads.append(dict(id=element['id'], type=kind, nodes=nodes, points=coordinates))
    return roads, ignored


def validate_sample(pack: dict, node: str | None = None) -> bytes:
    executable = node or shutil.which('node')
    if not executable:
        raise ValueError('转换校验需要 Node.js 22+，请安装 Node.js 或使用 --node 指定解释器')
    raw = (json.dumps(pack, ensure_ascii=False, separators=(',', ':'), allow_nan=False) + '\n').encode('utf-8')
    if len(raw) > MAX_SAMPLE_BYTES:
        raise ValueError('转换后的样本包超过 8 MiB，请缩小数据范围')
    try:
        result = subprocess.run([executable, str(ROOT / 'scripts' / '校验样本包.cjs')], input=raw,
                                stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=60)
    except (OSError, subprocess.TimeoutExpired) as error:
        raise ValueError(f'无法运行 Node.js 样本校验：{error}') from error
    if result.returncode:
        raise ValueError(result.stderr.decode('utf-8', errors='replace').strip() or 'Node.js 样本校验失败')
    return result.stdout


def write_atomic(output: Path, raw: bytes, overwrite: bool):
    output.parent.mkdir(parents=True, exist_ok=True)
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(dir=output.parent, prefix='.city-texture-', delete=False) as stream:
            temporary = Path(stream.name)
            stream.write(raw)
            stream.flush()
            os.fsync(stream.fileno())
        if overwrite:
            os.replace(temporary, output)
        else:
            os.link(temporary, output)  # 原子创建；已有文件（包括并发创建）不会被覆盖。
    finally:
        if temporary is not None:
            temporary.unlink(missing_ok=True)


def convert_config(config_path: Path, output: Path, *, node: str | None = None, overwrite: bool = False, allow_skipped: bool = False):
    config_path, output = config_path.resolve(), output.resolve()
    config = strict_json(read_limited(config_path, MAX_CONFIG_BYTES), '配置')
    if not isinstance(config, dict) or not isinstance(config.get('city'), dict):
        raise ValueError('配置缺少 city 对象')
    input_paths = {config_path}
    for key in ('roads', 'buildings'):
        entry = config.get(key)
        if not isinstance(entry, dict) or not isinstance(entry.get('file'), str):
            raise ValueError(f'配置缺少 {key}.file')
        input_paths.add((config_path.parent / entry['file']).resolve())
    if output in input_paths:
        raise ValueError('输出路径不能是配置或原始数据文件')
    if output.exists() and not overwrite:
        raise ValueError('输出文件已存在；确认需要替换时使用 --overwrite')
    _, road_bbox, road_source, road_elements = dataset(config['roads'], config_path.parent, '道路')
    _, building_bbox, building_source, building_elements = dataset(config['buildings'], config_path.parent, '建筑')
    roads, ignored = road_features(road_elements)
    buildings, conversion = convert_buildings(building_elements)
    if conversion['skipped'] and not allow_skipped:
        skipped = conversion['skipped']
        raise ValueError(f'有 {len(skipped)} 个建筑无法转换（首个 {skipped[0]["id"]}：{skipped[0]["reason"]}）；请修正数据，或用 --allow-skipped-buildings 明确保留跳过记录')
    city = dict(config['city'], bbox=road_bbox, roads=roads, source=road_source)
    pack = dict(format='city-texture-sample', version=1, city=city,
                buildings=dict(cityId=city.get('id'), bbox=building_bbox, features=buildings, conversion=conversion, source=building_source))
    raw = validate_sample(pack, node)
    write_atomic(output, raw, overwrite)
    return dict(output=str(output), bytes=len(raw), sampleId=city['id'], roads=len(roads), buildings=len(buildings),
                ignoredRoadWays=ignored, skippedBuildings=conversion['skipped'],
                roadsRawSha256=road_source['rawSha256'], buildingsRawSha256=building_source['rawSha256'])


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--config', type=Path, required=True, help='配置 JSON；原始文件路径相对此配置文件')
    parser.add_argument('--output', type=Path, required=True, help='生成的样本包 JSON')
    parser.add_argument('--node', help='Node.js 22+ 解释器路径；只在转换时需要')
    parser.add_argument('--overwrite', action='store_true', help='校验成功后替换已有输出；原始输入始终不覆盖')
    parser.add_argument('--allow-skipped-buildings', action='store_true', help='允许跳过无法转换的建筑，并在样本内保留原因')
    args = parser.parse_args()
    try:
        summary = convert_config(args.config, args.output, node=args.node, overwrite=args.overwrite, allow_skipped=args.allow_skipped_buildings)
    except (ValueError, OSError) as error:
        parser.exit(1, f'转换失败：{error}\n')
    print(json.dumps(summary, ensure_ascii=False), flush=True)


if __name__ == '__main__':
    main()
