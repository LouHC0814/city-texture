"""将合法取得的本地模型转为离线候选并体检；不联网、不改应用、不覆盖输出。"""
from __future__ import annotations

import argparse
import base64
import copy
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import shutil
import stat
import struct
import subprocess
import tempfile
from urllib.parse import unquote, urlsplit
import zipfile

from 转换城区样本 import strict_json

ROOT = Path(__file__).resolve().parents[1]
MAX_GLB = 64 * 1024 * 1024
MAX_PACKAGE = 128 * 1024 * 1024
MAX_JSON = 8 * 1024 * 1024
SOURCE = ROOT / 'tools' / '模型体检' / '南京紫峰-来源清单.json'


def read_limited(path, limit):
    with Path(path).open('rb') as stream:
        raw = stream.read(limit + 1)
    if len(raw) > limit:
        raise ValueError(f'文件超过 {limit} 字节上限：{Path(path).name}')
    return raw


def safe_name(name):
    if not isinstance(name, str) or not name or '\\' in name or ':' in name or '\0' in name:
        raise ValueError('资源路径必须是压缩包内的相对路径')
    path = PurePosixPath(name)
    if path.is_absolute() or any(p in ('..', '.') for p in name.split('/')):
        raise ValueError('资源路径不能越过模型所在目录')
    return path.as_posix()


class Resources:
    """ZIP 只在内存读取，绝不将包内路径解压到磁盘。"""
    def __init__(self, path, entry=None):
        self.path = Path(path).resolve()
        self.original = read_limited(self.path, MAX_PACKAGE)
        self.used = {}
        self.archive = None
        if self.path.suffix.lower() == '.zip':
            import io
            self.archive = zipfile.ZipFile(io.BytesIO(self.original))
            names = set()
            total = 0
            entries = self.archive.infolist()
            if len(entries) > 512:
                raise ValueError('压缩包条目超过 512 个')
            for info in entries:
                name = safe_name(info.filename.rstrip('/'))
                if name.casefold() in names or stat.S_ISLNK(info.external_attr >> 16) or info.flag_bits & 1:
                    raise ValueError('压缩包含重复路径、符号链接或加密文件')
                names.add(name.casefold())
                total += info.file_size
                if total > MAX_PACKAGE or info.file_size > MAX_GLB:
                    raise ValueError('压缩包展开大小超过上限')
            models = [i.filename for i in entries if not i.is_dir() and PurePosixPath(i.filename).suffix.lower() in ('.glb', '.gltf')]
            if entry is None:
                if len(models) != 1:
                    raise ValueError('压缩包必须只有一个模型入口；多个入口时用 --entry 明确选择')
                entry = models[0]
            if entry not in models:
                raise ValueError('--entry 必须是压缩包内存在的 GLB/glTF 文件')
            self.entry = entry
            self.base = PurePosixPath(entry).parent
        else:
            if entry is not None:
                raise ValueError('--entry 仅适用于 ZIP')
            if self.path.suffix.lower() not in ('.glb', '.gltf'):
                raise ValueError('只接受 GLB、glTF 或 ZIP 文件')
            self.entry = self.path.name
            self.base = PurePosixPath('.')

    def read(self, name, limit=MAX_GLB):
        name = safe_name(name)
        if name in self.used:
            raw = self.used[name]
            if len(raw) > limit:
                raise ValueError('资源超过本次读取上限')
            return raw
        if self.archive:
            info = self.archive.getinfo(name)
            if info.file_size > limit:
                raise ValueError('压缩包资源超过大小上限')
            with self.archive.open(info) as stream:
                raw = stream.read(limit + 1)
        else:
            target = (self.path.parent / name).resolve()
            if not target.is_relative_to(self.path.parent):
                raise ValueError('资源指向模型目录之外')
            raw = read_limited(target, limit)
        if len(raw) > limit or sum(map(len, self.used.values())) + len(raw) > MAX_PACKAGE:
            raise ValueError('读取资源总量超过上限')
        self.used[name] = raw
        return raw

    def uri(self, uri):
        if not isinstance(uri, str):
            raise ValueError('资源 URI 缺失')
        if uri.startswith('data:'):
            header, separator, encoded = uri.partition(',')
            if not separator or not header.endswith(';base64') or len(encoded) > (MAX_GLB * 4 // 3 + 4):
                raise ValueError('仅支持限长 base64 data URI')
            return base64.b64decode(encoded, validate=True)
        parts = urlsplit(uri)
        if parts.scheme or parts.netloc or parts.query or parts.fragment:
            raise ValueError('离线模型不接受网络 URI、查询或片段')
        name = safe_name(unquote(parts.path, errors='strict'))
        return self.read((self.base / name).as_posix())


def convert(resources):
    raw = resources.read(resources.entry)
    if resources.entry.lower().endswith('.glb'):
        return raw, '原始 GLB 保持逐字节不变'
    if len(raw) > MAX_JSON:
        raise ValueError('glTF JSON 超过 8 MiB')
    model = strict_json(raw, 'glTF')
    if not isinstance(model, dict) or not isinstance(model.get('asset'), dict) or model['asset'].get('version') != '2.0':
        raise ValueError('仅支持 glTF 2.0')
    if model.get('extensionsUsed') or model.get('extensionsRequired'):
        raise ValueError('当前体检规则不支持扩展；保留原件，不自动删除或降级扩展')
    model = copy.deepcopy(model)
    buffers = model.get('buffers')
    if not isinstance(buffers, list) or len(buffers) != 1 or not isinstance(buffers[0], dict):
        raise ValueError('首版离线合并仅支持一个 glTF buffer')
    buffer = buffers[0]
    binary = bytearray(resources.uri(buffer.get('uri')))
    if type(buffer.get('byteLength')) is not int or buffer['byteLength'] != len(binary):
        raise ValueError('glTF buffer 声明长度与原始资源不符')
    views = model.setdefault('bufferViews', [])
    if not isinstance(views, list):
        raise ValueError('bufferViews 必须是数组')
    for view in views:
        if (not isinstance(view, dict) or type(view.get('buffer')) is not int or view['buffer'] != 0
                or type(view.get('byteOffset', 0)) is not int or view.get('byteOffset', 0) < 0
                or type(view.get('byteLength')) is not int or view['byteLength'] <= 0
                or view.get('byteOffset', 0) + view['byteLength'] > len(binary)):
            raise ValueError('原始 bufferView 引用或范围无效，拒绝合并')
    images = model.get('images', [])
    if not isinstance(images, list):
        raise ValueError('images 必须是数组')
    accessors = model.get('accessors', [])
    if not isinstance(accessors, list):
        raise ValueError('accessors 必须是数组')
    # 添加图片 bufferView 之前校验原引用，避免把原本越界的引用意外变成有效值。
    for item in accessors + images:
        if not isinstance(item, dict):
            raise ValueError('accessor/image 必须是对象')
        if 'bufferView' in item and (type(item['bufferView']) is not int or not 0 <= item['bufferView'] < len(views)):
            raise ValueError('原始 accessor/image 的 bufferView 引用越界')
    for image in images:
        if not isinstance(image, dict) or ('uri' in image) == ('bufferView' in image):
            raise ValueError('image 必须恰有 uri 或 bufferView')
        if 'uri' not in image:
            continue
        content = resources.uri(image['uri'])
        mime = 'image/png' if content.startswith(b'\x89PNG\r\n\x1a\n') else 'image/jpeg' if content.startswith(b'\xff\xd8\xff') else None
        if mime is None or image.get('mimeType', mime) != mime:
            raise ValueError('图片必须是类型声明一致的 PNG/JPEG')
        binary.extend(b'\0' * (-len(binary) % 4))
        image['bufferView'] = len(views)
        views.append(dict(buffer=0, byteOffset=len(binary), byteLength=len(content)))
        binary.extend(content)
        image['mimeType'] = mime
        del image['uri']
        if len(binary) > MAX_GLB:
            raise ValueError('合并的模型超过 64 MiB')
    del buffer['uri']
    buffer['byteLength'] = len(binary)
    document = json.dumps(model, ensure_ascii=False, separators=(',', ':'), allow_nan=False).encode()
    if len(document) > MAX_JSON:
        raise ValueError('合并后的 glTF JSON 超过 8 MiB')
    document += b' ' * (-len(document) % 4)
    binary.extend(b'\0' * (-len(binary) % 4))
    size = 28 + len(document) + len(binary)
    if size > MAX_GLB:
        raise ValueError('合并的 GLB 超过 64 MiB')
    return (struct.pack('<4sII', b'glTF', 2, size) + struct.pack('<I4s', len(document), b'JSON') + document
            + struct.pack('<I4s', len(binary), b'BIN\0') + binary), '合并 glTF、单个 buffer 与 PNG/JPEG；不简化网格、不改署名、不删除扩展'


def prepare(input_path, output, *, source=SOURCE, node=None, entry=None):
    output = Path(output).absolute()
    if output.exists():
        raise ValueError('输出目录已存在；请选用新目录，原结果不会被覆盖')
    source_raw = read_limited(source, 128 * 1024)
    metadata = strict_json(source_raw, '来源清单')
    if not isinstance(metadata, dict) or not all(isinstance(metadata.get(k), str) and metadata[k].strip() for k in ('model', 'author', 'license', 'licenseUrl', 'sourceUrl')):
        raise ValueError('来源清单必须包含模型、作者、许可和原始来源链接')
    executable = node or shutil.which('node')
    if not executable:
        raise ValueError('请用 --node 指定 Node.js 22+ 解释器')
    resources = Resources(input_path, entry)
    glb, changes = convert(resources)
    output.parent.mkdir(parents=True, exist_ok=True)
    # 临时目录与最终结果同级。所有报告完成后才提交，转换/IO 失败不留下半套结果。
    with tempfile.TemporaryDirectory(prefix='model-intake-', dir=output.parent) as temporary:
        stage = Path(temporary) / '结果'
        stage.mkdir()
        (stage / '候选模型.glb').write_bytes(glb)
        (stage / '来源声明.json').write_bytes(source_raw)
        archive_name = '原始下载' + resources.path.suffix.lower()
        (stage / archive_name).write_bytes(resources.original)
        if resources.archive is None and resources.path.suffix.lower() == '.gltf':
            for name, raw in resources.used.items():
                target = stage / '原始资源' / name
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes(raw)
        cli = ROOT / 'tools' / '模型体检' / 'bin' / 'gltf-inspect.cjs'
        result = subprocess.run([str(executable), str(cli), '--input', str(stage / '候选模型.glb'), '--out', str(stage / '体检'),
                                 '--name', 'candidate', '--source', str(stage / '来源声明.json')],
                                capture_output=True, encoding='utf-8', timeout=90,
                                creationflags=subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0)
        if result.returncode not in (0, 2):
            raise ValueError('体检工具未完成：' + result.stderr[-2000:])
        report = json.loads((stage / '体检' / 'candidate.gltf-inspect.json').read_text(encoding='utf-8'))
        if (result.returncode == 0) != (report['status'] == 'pass'):
            raise ValueError('体检退出码与报告状态不一致')
        summary = dict(format='city-texture-model-intake', version=1, status=report['status'],
                       original=dict(name=resources.path.name, bytes=len(resources.original), sha256=hashlib.sha256(resources.original).hexdigest(), archive=archive_name, entry=resources.entry),
                       resources=[dict(name=name, bytes=len(raw), sha256=hashlib.sha256(raw).hexdigest()) for name, raw in sorted(resources.used.items())],
                       candidate=dict(bytes=len(glb), sha256=hashlib.sha256(glb).hexdigest()),
                       source=metadata, changes=changes,
                       applicationIntegrated=False, visuallyVerified=False,
                       note='静态体检通过不代表模型身份、授权真实性、外观或性能已人工核实；未修改应用或发行版本。')
        (stage / '接入准备结果.json').write_text(json.dumps(summary, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        if output.exists():
            raise ValueError('输出目录已被其他任务创建，停止以免覆盖')
        stage.rename(output)
    return summary


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input', type=Path, required=True, help='通过授权途径取得的 GLB、glTF 或 ZIP')
    parser.add_argument('--out', type=Path, required=True, help='新的本地结果目录，不允许覆盖')
    parser.add_argument('--source', type=Path, default=SOURCE, help='来源声明 JSON，默认紫峰候选来源')
    parser.add_argument('--entry', help='ZIP 含多个模型时指定包内入口')
    parser.add_argument('--node', help='Node.js 22+ 绝对路径')
    args = parser.parse_args()
    try:
        result = prepare(args.input, args.out, source=args.source, node=args.node, entry=args.entry)
    except (ValueError, OSError, KeyError, TypeError, zipfile.BadZipFile, subprocess.SubprocessError) as error:
        parser.exit(3, f'准备失败：{error}\n')
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result['status'] == 'pass' else 2


if __name__ == '__main__':
    raise SystemExit(main())
