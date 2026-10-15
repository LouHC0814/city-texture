/* 城市纹理：独立实现的几何与路网统计。长度单位均为公里。 */
(function (root) {
  'use strict';
  const R = 6371.0088;
  const DRIVING = new Set('motorway trunk primary secondary tertiary unclassified residential living_street service motorway_link trunk_link primary_link secondary_link tertiary_link'.split(' '));
  const WALKING = new Set(['pedestrian', 'footway', 'path', 'cycleway', 'steps']);
  function project(lon, lat, center) {
    const k = Math.PI / 180 * R;
    return [(lon - center.lon) * k * Math.cos(center.lat * Math.PI / 180), (lat - center.lat) * k];
  }
  function unproject(x, y, center) {
    const k = Math.PI / 180 * R;
    return [center.lon + x / (k * Math.cos(center.lat * Math.PI / 180)), center.lat + y / k];
  }
  // 参数线段 a + t(b-a) 与四个半平面求交，避免把窗口外长度计入密度。
  function clip(a, b, half) {
    let lo = 0, hi = 1;
    for (let axis = 0; axis < 2; axis++) {
      const delta = b[axis] - a[axis];
      if (Math.abs(delta) < 1e-12) {
        if (Math.abs(a[axis]) > half) return null;
      } else {
        const t1 = (-half - a[axis]) / delta, t2 = (half - a[axis]) / delta;
        lo = Math.max(lo, Math.min(t1, t2)); hi = Math.min(hi, Math.max(t1, t2));
        if (hi < lo) return null;
      }
    }
    const p = a.map((v, i) => v + lo * (b[i] - v));
    const q = a.map((v, i) => v + hi * (b[i] - v));
    return Math.hypot(q[0] - p[0], q[1] - p[1]) < 1e-10 ? null : [p, q];
  }
  function prepare(city) {
    if (!city || !Number.isFinite(city.lon) || !Number.isFinite(city.lat) || !Array.isArray(city.roads)) throw new Error('城区数据格式无效');
    return city.roads.map(road => {
      if (!Array.isArray(road.points) || !Array.isArray(road.nodes) || road.nodes.length !== road.points.length) throw new Error('道路坐标与节点不一致');
      return { ...road, points: road.points.map(p => {
        if (!Array.isArray(p) || p.length !== 2 || !p.every(Number.isFinite) || Math.abs(p[0]) > 180 || Math.abs(p[1]) > 90) throw new Error('道路坐标无效');
        return project(p[0], p[1], city);
      }) };
    });
  }
  function analyze(roads, side, walking = false) {
    if (![0.25, 0.5, 0.75, 1].includes(side)) throw new Error('不支持的观察尺度');
    const seen = new Set(), visibleWays = new Set(), bins = Array(18).fill(0), segments = [];
    let length = 0;
    for (const road of roads) {
      if (!DRIVING.has(road.type) && !(walking && WALKING.has(road.type))) continue;
      for (let i = 1; i < road.points.length; i++) {
        const na = road.nodes[i - 1], nb = road.nodes[i];
        if (na === nb) continue;
        const key = na < nb ? `${na}:${nb}` : `${nb}:${na}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const clipped = clip(road.points[i - 1], road.points[i], side / 2);
        if (!clipped) continue;
        const [a, b] = clipped;
        const distance = Math.hypot(b[0] - a[0], b[1] - a[1]);
        const angle = ((Math.atan2(b[0] - a[0], b[1] - a[1]) * 180 / Math.PI) % 180 + 180) % 180;
        bins[Math.min(17, Math.floor(angle / 10))] += distance;
        segments.push({ a, b, type: road.type, id: road.id });
        visibleWays.add(road.id); length += distance;
      }
    }
    let entropy = 0;
    if (length) for (const count of bins) { if (count) { const p = count / length; entropy -= p * Math.log(p); } }
    return { sideKm: side, areaKm2: side * side, lengthKm: length, density: length / (side * side),
      wayCount: visibleWays.size, diversity: length ? entropy / Math.log(18) * 100 : null, bins, segments };
  }
  function readState(hash, ids) {
    const defaults = { left: ids[0], right: ids[1] || ids[0], side: 0.75, walking: true };
    const p = new URLSearchParams(String(hash || '').replace(/^#/, ''));
    if (p.get('v') !== '1') return defaults;
    return { left: ids.includes(p.get('a')) ? p.get('a') : defaults.left,
      right: ids.includes(p.get('b')) ? p.get('b') : defaults.right,
      side: [0.25, 0.5, 0.75, 1].includes(Number(p.get('s'))) ? Number(p.get('s')) : defaults.side,
      walking: p.has('w') ? p.get('w') === '1' : defaults.walking };
  }
  function stateHash(state) {
    return '#' + new URLSearchParams({ v: '1', a: state.left, b: state.right, s: String(state.side), w: state.walking ? '1' : '0' });
  }
  function report(city, result, walking) {
    const half = result.sideKm / 2;
    return { city: city.name, sample: city.district, center: [city.lon, city.lat],
      bounds: [unproject(-half, -half, city), unproject(half, half, city)],
      filter: walking ? '机动车道路及已收录的步行/骑行道路' : '机动车道路（含 service）',
      projection: '局部等距圆柱近似；WGS84，R=6371.0088km',
      sideKm: result.sideKm, areaKm2: result.areaKm2, roadLengthKm: result.lengthKm,
      roadDensityKmPerKm2: result.density, orientationDiversity: result.diversity,
      orientationBinsKm: result.bins, source: city.source,
      caveats: '局部城区样本；OSM可能缺漏。分隔车道分别计入；方向多样性使用10度轴向分箱与长度加权，不是城市质量评分。' };
  }
  const api = { R, DRIVING, WALKING, project, unproject, clip, prepare, analyze, readState, stateHash, report };
  if (typeof module === 'object' && module.exports) module.exports = api; else root.CityCore = api;
})(globalThis);
