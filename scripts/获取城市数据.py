"""从公共 Overpass 接口取得小范围 OSM 快照。标准库，无需密钥；串行请求。"""
from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import gzip
import json
import math
from pathlib import Path
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
CITIES = [
    dict(id="zurich", name="苏黎世", english="ZÜRICH", district="老城与利马特河周边", country="瑞士", lat=47.3740, lon=8.5415, color="#27776c"),
    dict(id="bern", name="伯尔尼", english="BERN", district="老城与阿勒河周边", country="瑞士", lat=46.9480, lon=7.4474, color="#b66043"),
    dict(id="nanjing", name="南京", english="NANJING", district="新街口周边", country="中国", lat=32.0436, lon=118.7789, color="#566fa8", note="勾选步行道路时含地下及室内通道；平面图未区分层级。"),
]
CITY_ENDPOINTS = {"nanjing": "https://overpass-api.de/api/interpreter"}
ROAD_TYPES = "motorway|trunk|primary|secondary|tertiary|unclassified|residential|living_street|service|motorway_link|trunk_link|primary_link|secondary_link|tertiary_link"


def fetch(city: dict, endpoint: str | None = None, force: bool = False, offline: bool = False) -> dict:
    endpoint = endpoint or CITY_ENDPOINTS.get(city["id"], "https://overpass.osm.ch/api/interpreter")
    cache = ROOT / ".runtime" / f"{city['id']}-overpass.json"
    half = 0.55
    lat_delta = math.degrees(half / 6371.0088)
    lon_delta = lat_delta / math.cos(math.radians(city["lat"]))
    bbox = [city["lat"] - lat_delta, city["lon"] - lon_delta,
            city["lat"] + lat_delta, city["lon"] + lon_delta]
    box = ",".join(f"{v:.7f}" for v in bbox)
    query = f'[out:json][timeout:25];way[highway]({box});out geom;'
    recorded_source = None
    if offline:
        manifest = json.loads((ROOT / "data" / "来源清单.json").read_text(encoding="utf-8"))
        recorded_source = manifest[city["id"]]
        raw = gzip.decompress((ROOT / "data" / "snapshots" / f"{city['id']}.json.gz").read_bytes())
        if hashlib.sha256(raw).hexdigest() != recorded_source["rawSha256"]:
            raise ValueError("原始快照校验失败")
        if recorded_source["query"] != query:
            raise ValueError("查询参数与归档样本不一致，拒绝错误标注")
    elif cache.exists() and not force:
        raw = cache.read_bytes()
    else:
        url = endpoint + "?" + urllib.parse.urlencode({"data": query})
        req = urllib.request.Request(url, headers={"User-Agent": "CityTexture/0.1 educational open-source city comparison", "Accept": "application/json"})
        with urllib.request.urlopen(req, timeout=45) as response:
            raw = response.read()
        parsed = json.loads(raw)
        if parsed.get("remark") or not parsed.get("elements"):
            raise ValueError(f"Overpass 返回不完整数据：{parsed.get('remark', '无要素')}")
        cache.write_bytes(raw)
    parsed = json.loads(raw)
    if parsed.get("remark") or not parsed.get("elements"):
        raise ValueError("数据为空或包含错误提示")
    roads, buildings = [], []
    for element in parsed["elements"]:
        if element.get("type") != "way" or not element.get("geometry"):
            continue
        points = [[round(p["lon"], 7), round(p["lat"], 7)] for p in element["geometry"]]
        tags = element.get("tags", {})
        if tags.get("highway") in ROAD_TYPES.split("|") + ["pedestrian", "footway", "path", "cycleway", "steps"] and len(points) == len(element.get("nodes", [])):
            roads.append(dict(id=element["id"], type=tags["highway"], nodes=element["nodes"], points=points))
    if len(roads) < 20:
        raise ValueError("道路不足 20 条，拒绝生成看似正常的空地图")
    source = recorded_source or dict(name="OpenStreetMap contributors", license="ODbL-1.0",
                            url="https://www.openstreetmap.org/copyright",
                            endpoint=endpoint, query=query,
                            snapshotToken=parsed.get("osm3s", {}).get("timestamp_osm_base"),
                            fetchedAt=dt.datetime.fromtimestamp(cache.stat().st_mtime, dt.timezone.utc).isoformat(),
                            rawSha256=hashlib.sha256(raw).hexdigest(),
                            limitations="道路为 highway 白名单；步行道可切换。不含建筑。仅为小范围城区窗口，不代表全市。接口快照标识不一定是时间。")
    data = dict(city, extentKm=1.1, bbox=bbox, roads=roads, source=source)
    output = ROOT / "dist" / "data" / f"{city['id']}.js"
    content = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    output.write_text(f"/* © OpenStreetMap contributors; ODbL-1.0. See 数据许可.md. */\n(function(g){{const d={content};if(typeof module==='object'&&module.exports)module.exports=d;else (g.CITY_DATA ||= []).push(d);}})(globalThis);\n", encoding="utf-8", newline="\n")
    return dict(city=city["name"], roads=len(roads), bytes=output.stat().st_size, snapshotToken=data["source"]["snapshotToken"])


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--endpoint", help="覆盖接口；默认苏黎世/伯尔尼使用瑞士实例，南京使用全球实例")
    parser.add_argument("--city", choices=[c["id"] for c in CITIES])
    parser.add_argument("--force", action="store_true", help="重新访问接口；默认复用本地缓存")
    parser.add_argument("--offline", action="store_true", help="校验并使用仓库归档的原始数据，完全离线重建 JS 样本")
    args = parser.parse_args()
    if args.offline and args.force:
        parser.error("--offline 与 --force 不能同时使用")
    (ROOT / ".runtime").mkdir(exist_ok=True)
    for city in CITIES:
        if not args.city or city["id"] == args.city:
            print(json.dumps(fetch(city, args.endpoint, args.force, args.offline), ensure_ascii=False), flush=True)
