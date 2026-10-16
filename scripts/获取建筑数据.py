"""获取并归档真实建筑轮廓；闭合 way 与可拼接的 multipolygon，保留内院。"""
from __future__ import annotations

import argparse
import datetime as dt
import gzip
import hashlib
import json
import math
import urllib.parse
import urllib.request

from 获取城市数据 import CITIES, ROOT


def points(geometry):
    if not geometry or any(p is None or not all(k in p for k in ("lon", "lat")) for p in geometry):
        raise ValueError("缺失几何坐标")
    result = []
    for p in geometry:
        lon, lat = p["lon"], p["lat"]
        if not isinstance(lon, (int, float)) or not isinstance(lat, (int, float)) or not math.isfinite(lon) or not math.isfinite(lat) or abs(lon) > 180 or abs(lat) > 90:
            raise ValueError("无效坐标")
        value = (round(lon, 7), round(lat, 7))
        if not result or result[-1] != value:
            result.append(value)
    return result


def check_ring(ring):
    if len(ring) < 4 or ring[0] != ring[-1] or len(set(ring[:-1])) < 3:
        raise ValueError("轮廓未闭合或顶点不足")
    # 使用首点作为计算原点，避免大经纬度相乘后的消减误差。
    x, y = ring[0]
    area = sum((a[0] - x) * (b[1] - y) - (b[0] - x) * (a[1] - y) for a, b in zip(ring, ring[1:]))
    if abs(area) < 1e-14:
        raise ValueError("零面积轮廓")
    return ring


def stitch(parts):
    """按端点拼接，允许成员顺序与方向不同；端点歧义时拒绝猜测。"""
    remaining = [p[:] for p in parts]
    if any(len(p) < 2 for p in remaining):
        raise ValueError("关系成员不足两点")
    rings = []
    while remaining:
        chain = remaining.pop(0)
        while chain[0] != chain[-1]:
            candidates = [(i, p[0] == chain[-1]) for i, p in enumerate(remaining) if p[0] == chain[-1] or p[-1] == chain[-1]]
            if len(candidates) != 1:
                raise ValueError("无法唯一拼接关系成员")
            index, forward = candidates[0]
            piece = remaining.pop(index)
            if not forward:
                piece.reverse()
            chain.extend(piece[1:])
        rings.append(check_ring(chain))
    return rings


def contains(point, ring):
    x, y = point
    inside = False
    for a, b in zip(ring, ring[1:]):
        cross = (x - a[0]) * (b[1] - a[1]) - (y - a[1]) * (b[0] - a[0])
        if abs(cross) < 1e-14 and min(a[0], b[0]) - 1e-12 <= x <= max(a[0], b[0]) + 1e-12 and min(a[1], b[1]) - 1e-12 <= y <= max(a[1], b[1]) + 1e-12:
            return True
        if (a[1] > y) != (b[1] > y) and x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]:
            inside = not inside
    return inside


def convert(elements):
    features, skipped, relation_members, seen = [], [], set(), set()
    for e in elements:
        tags = e.get("tags", {})
        if e.get("type") != "relation" or tags.get("type") != "multipolygon" or tags.get("building") in (None, "no"):
            continue
        # 关系成员不再单独作为建筑要素，以免内院被外轮廓填实。
        relation_members.update(m["ref"] for m in e.get("members", []) if m.get("type") == "way" and m.get("role", "") in ("outer", "inner", ""))
        try:
            outer_parts, inner_parts = [], []
            for member in e.get("members", []):
                role = member.get("role", "")
                if member.get("type") != "way":
                    if role in ("outer", "inner"):
                        raise ValueError("存在不支持的嵌套轮廓成员")
                    continue
                if role not in ("outer", "inner", ""):
                    raise ValueError("未知轮廓角色")
                (inner_parts if role == "inner" else outer_parts).append(points(member.get("geometry")))
            if not outer_parts:
                raise ValueError("缺少外轮廓")
            feature = dict(id=f"relation/{e['id']}", outers=stitch(outer_parts), inners=stitch(inner_parts), kind=tags["building"])
            if any(not any(all(contains(p, outer) for p in inner[:-1]) for outer in feature["outers"]) for inner in feature["inners"]):
                raise ValueError("内环顶点不在同一外轮廓中")
            if feature["id"] not in seen:
                features.append(feature)
                seen.add(feature["id"])
        except (ValueError, KeyError) as error:
            skipped.append(dict(id=f"relation/{e.get('id')}", reason=str(error)))
    for e in elements:
        tags = e.get("tags", {})
        if e.get("type") != "way" or e.get("id") in relation_members or tags.get("building") in (None, "no"):
            continue
        try:
            ring = check_ring(points(e.get("geometry")))
            feature = dict(id=f"way/{e['id']}", outers=[ring], inners=[], kind=tags["building"])
            if feature["id"] not in seen:
                features.append(feature)
                seen.add(feature["id"])
        except (ValueError, KeyError) as error:
            skipped.append(dict(id=f"way/{e.get('id')}", reason=str(error)))
    features.sort(key=lambda f: f["id"])
    return features, dict(featureCount=len(features), relations=sum(f["id"].startswith("relation/") for f in features),
                         innerRings=sum(len(f["inners"]) for f in features), skipped=skipped)


def fetch(city, endpoint, offline=False, force=False):
    lat_delta = math.degrees(0.55 / 6371.0088)
    lon_delta = lat_delta / math.cos(math.radians(city["lat"]))
    bbox = [city["lat"] - lat_delta, city["lon"] - lon_delta, city["lat"] + lat_delta, city["lon"] + lon_delta]
    box = ",".join(f"{v:.7f}" for v in bbox)
    query = f'[out:json][timeout:25];(way["building"]["building"!="no"]({box});rel["type"="multipolygon"]["building"]["building"!="no"]({box}););out geom;'
    manifest_path = ROOT / "data" / "建筑来源清单.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8")) if manifest_path.exists() else {}
    cache = ROOT / ".runtime" / f"{city['id']}-buildings-overpass.json"
    archive = ROOT / "data" / "snapshots" / f"{city['id']}-buildings.json.gz"
    if offline:
        source = manifest[city["id"]]
        raw = gzip.decompress(archive.read_bytes())
        if source["query"] != query or hashlib.sha256(raw).hexdigest() != source["rawSha256"]:
            raise ValueError("建筑归档的查询或内容校验不匹配")
    else:
        if cache.exists() and not force:
            raw = cache.read_bytes()
            source = manifest.get(city["id"])
            if not source or source["query"] != query or hashlib.sha256(raw).hexdigest() != source["rawSha256"]:
                raise ValueError("缓存缺少匹配的来源记录，请用 --force 重新获取")
        else:
            req = urllib.request.Request(endpoint + "?" + urllib.parse.urlencode({"data": query}), headers={"User-Agent": "CityTexture/0.3 educational city morphology atlas", "Accept": "application/json"})
            with urllib.request.urlopen(req, timeout=60) as response:
                raw = response.read(40_000_001)
            if len(raw) > 40_000_000:
                raise ValueError("建筑响应超出 40 MB 上限")
            parsed = json.loads(raw)
            if parsed.get("remark") or not parsed.get("elements"):
                raise ValueError("接口返回不完整或空数据")
            cache.write_bytes(raw)
            source = dict(name="OpenStreetMap contributors", license="ODbL-1.0", url="https://www.openstreetmap.org/copyright",
                          endpoint=endpoint, query=query, snapshotToken=json.loads(raw).get("osm3s", {}).get("timestamp_osm_base"),
                          fetchedAt=dt.datetime.fromtimestamp(cache.stat().st_mtime, dt.timezone.utc).isoformat(),
                          rawSha256=hashlib.sha256(raw).hexdigest(), limitations="建筑轮廓要素，不是独立楼栋或住房数量；不含仅标注 building:part 的要素，不做面积去重或覆盖率推断。")
    parsed = json.loads(raw)
    if parsed.get("remark") or not parsed.get("elements"):
        raise ValueError("建筑数据为空或包含错误")
    features, conversion = convert(parsed["elements"])
    if len(features) < 20:
        raise ValueError("有效建筑不足 20 个要素，拒绝空图层")
    data = dict(cityId=city["id"], bbox=bbox, features=features, conversion=conversion, source=source)
    text = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    output = ROOT / "dist" / "data" / f"{city['id']}-buildings.js"
    output.write_text(f"/* © OpenStreetMap contributors; ODbL-1.0. See 数据许可.md. */\n(function(g){{const d={text};if(typeof module==='object'&&module.exports)module.exports=d;else (g.BUILDING_DATA ||= []).push(d);}})(globalThis);\n", encoding="utf-8", newline="\n")
    if not offline:
        archive.write_bytes(gzip.compress(raw, mtime=0))
        manifest[city["id"]] = source
        manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
    return dict(city=city["name"], features=len(features), relations=conversion["relations"], innerRings=conversion["innerRings"], skipped=len(conversion["skipped"]), bytes=output.stat().st_size)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--endpoint", default="https://overpass.osm.ch/api/interpreter")
    parser.add_argument("--city", choices=[c["id"] for c in CITIES])
    parser.add_argument("--offline", action="store_true")
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()
    if args.offline and args.force:
        parser.error("--offline 与 --force 不能同时使用")
    (ROOT / ".runtime").mkdir(exist_ok=True)
    for city in CITIES:
        if not args.city or args.city == city["id"]:
            print(json.dumps(fetch(city, args.endpoint, args.offline, args.force), ensure_ascii=False), flush=True)
