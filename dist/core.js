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
  function prepareBuildings(city, data) {
    if (!data || data.cityId !== city.id || !Array.isArray(data.features)) throw new Error('建筑样本与城区不匹配');
    const seen = new Set();
    return data.features.map(feature => {
      if (typeof feature.id !== 'string' || seen.has(feature.id) || !Array.isArray(feature.outers) || !feature.outers.length || !Array.isArray(feature.inners)) throw new Error('建筑要素格式无效或重复');
      seen.add(feature.id);
      const convert = ring => {
        if (!Array.isArray(ring) || ring.length < 4 || !ring.every(p => Array.isArray(p) && p.length === 2 && p.every(Number.isFinite) && Math.abs(p[0]) <= 180 && Math.abs(p[1]) <= 90) || ring[0][0] !== ring.at(-1)[0] || ring[0][1] !== ring.at(-1)[1]) throw new Error('建筑轮廓无效或未闭合');
        return ring.map(p => project(p[0], p[1], city));
      };
      const outers = feature.outers.map(convert), inners = feature.inners.map(convert);
      const coordinates = outers.flat();
      return { id: feature.id, outers, inners, bbox: [Math.min(...coordinates.map(p => p[0])), Math.min(...coordinates.map(p => p[1])), Math.max(...coordinates.map(p => p[0])), Math.max(...coordinates.map(p => p[1]))] };
    });
  }
  function ringArea(ring) {
    if (ring.length < 3) return 0;
    const origin = ring[0]; let twice = 0;
    for (let i = 0; i < ring.length; i++) {
      const a = ring[i], b = ring[(i + 1) % ring.length];
      twice += (a[0] - origin[0]) * (b[1] - origin[1]) - (b[0] - origin[0]) * (a[1] - origin[1]);
    }
    return Math.abs(twice) / 2;
  }
  // 逐个半平面裁剪，用于判断要素与观察窗口是否有正面积交集。
  function clipRing(ring, half, offset = [0, 0]) {
    let output = ring.map(p => [p[0] - offset[0], p[1] - offset[1]]);
    for (const axis of [0, 1]) for (const sign of [-1, 1]) {
      const input = output; output = [];
      if (!input.length) continue;
      let previous = input.at(-1), wasInside = previous[axis] * sign <= half;
      for (const point of input) {
        const inside = point[axis] * sign <= half;
        if (inside !== wasInside) {
          const t = (sign * half - previous[axis]) / (point[axis] - previous[axis]);
          output.push(previous.map((v, i) => v + t * (point[i] - v)));
        }
        if (inside) output.push(point);
        previous = point; wasInside = inside;
      }
    }
    return output;
  }
  function analyzeBuildings(buildings, side, offset = [0, 0]) {
    if (![0.25, 0.5, 0.75, 1].includes(side) || !Array.isArray(offset) || offset.length !== 2 || !offset.every(Number.isFinite)) throw new Error('建筑观察范围无效');
    const half = side / 2, features = [];
    for (const building of buildings) {
      const b = building.bbox;
      if (b[0] >= offset[0] + half || b[2] <= offset[0] - half || b[1] >= offset[1] + half || b[3] <= offset[1] - half) continue;
      const area = rings => rings.reduce((sum, ring) => sum + ringArea(clipRing(ring, half, offset)), 0);
      if (area(building.outers) - area(building.inners) > 1e-10) features.push(building);
    }
    return { featureCount: features.length, features, sideKm: side, offsetKm: [...offset] };
  }
  function analyze(roads, side, walking = false, offset = [0, 0]) {
    if (![0.25, 0.5, 0.75, 1].includes(side)) throw new Error('不支持的观察尺度');
    if (!Array.isArray(offset) || offset.length !== 2 || !offset.every(Number.isFinite)) throw new Error('观察位置无效');
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
        const p = road.points[i - 1], q = road.points[i];
        const clipped = clip([p[0] - offset[0], p[1] - offset[1]], [q[0] - offset[0], q[1] - offset[1]], side / 2);
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
    return { sideKm: side, offsetKm: [...offset], areaKm2: side * side, lengthKm: length, density: length / (side * side),
      wayCount: visibleWays.size, diversity: length ? entropy / Math.log(18) * 100 : null, bins, segments };
  }
  // 使用两个下载框的交集约束共同位移，留 1 米余量，避免把未下载区域当成空白。
  function panBounds(cities, side) {
    if (!Array.isArray(cities) || !cities.length || ![0.25, 0.5, 0.75, 1].includes(side)) throw new Error('观察范围无效');
    let minX = -Infinity, minY = -Infinity, maxX = Infinity, maxY = Infinity;
    for (const city of cities) {
      const b = city.bbox;
      if (!Array.isArray(b) || b.length !== 4 || !b.every(Number.isFinite) || b[0] >= b[2] || b[1] >= b[3]) throw new Error('城区边界无效');
      const lower = project(b[1], b[0], city), upper = project(b[3], b[2], city), inset = side / 2 + 0.001;
      minX = Math.max(minX, lower[0] + inset); minY = Math.max(minY, lower[1] + inset);
      maxX = Math.min(maxX, upper[0] - inset); maxY = Math.min(maxY, upper[1] - inset);
    }
    // 向内取整到毫米；视图参数的来回转换不会因浮点舍入越界。
    const limits = { minX: Math.ceil(minX * 1e6) / 1e6, minY: Math.ceil(minY * 1e6) / 1e6,
      maxX: Math.floor(maxX * 1e6) / 1e6, maxY: Math.floor(maxY * 1e6) / 1e6 };
    if (limits.minX > limits.maxX || limits.minY > limits.maxY) throw new Error('样本范围不足以覆盖当前窗口');
    return limits;
  }
  function clampOffset(offset, limits) {
    const safe = Array.isArray(offset) && offset.length === 2 ? offset : [0, 0];
    return safe.map((v, i) => {
      const min = i ? limits.minY : limits.minX, max = i ? limits.maxY : limits.maxX;
      return Math.round(Math.max(min, Math.min(max, Number.isFinite(v) ? v : 0)) * 1e6) / 1e6;
    });
  }
  function readState(hash, ids) {
    const defaults = { left: ids[0], right: ids[1] || ids[0], side: 0.75, walking: true, offset: [0, 0], layer: 'both' };
    const p = new URLSearchParams(String(hash || '').replace(/^#/, ''));
    if (!['1', '2', '3'].includes(p.get('v'))) return defaults;
    const coordinate = key => {
      const raw = p.get(key);
      if (!['2', '3'].includes(p.get('v')) || raw === null || !/^-?\d{1,6}(?:\.\d{1,3})?$/.test(raw)) return 0;
      return Number(raw) / 1000;
    };
    return { left: ids.includes(p.get('a')) ? p.get('a') : defaults.left,
      right: ids.includes(p.get('b')) ? p.get('b') : defaults.right,
      side: [0.25, 0.5, 0.75, 1].includes(Number(p.get('s'))) ? Number(p.get('s')) : defaults.side,
      walking: p.has('w') ? p.get('w') === '1' : defaults.walking,
      offset: [coordinate('x'), coordinate('y')],
      layer: p.get('v') === '3' && ['roads', 'both', 'buildings'].includes(p.get('l')) ? p.get('l') : 'roads' };
  }
  function stateHash(state) {
    const offset = state.offset || [0, 0];
    return '#' + new URLSearchParams({ v: '3', a: state.left, b: state.right, s: String(state.side), w: state.walking ? '1' : '0', l: state.layer || 'both',
      x: (offset[0] * 1000).toFixed(3), y: (offset[1] * 1000).toFixed(3) });
  }
  function parseView(text, ids) {
    if (typeof text !== 'string' || text.length > 2000) throw new Error('视图参数无效或过长');
    const value = text.trim(), index = value.indexOf('#'), fragment = index >= 0 ? value.slice(index) : '#' + value;
    const p = new URLSearchParams(fragment.slice(1));
    if (['1', '2', '3'].includes(p.get('v')) && (p.get('a') || p.get('b')) && (!ids.includes(p.get('a')) || !ids.includes(p.get('b')))) throw new Error('视图中的样本尚未加载，请先导入同一份样本包，再恢复视图');
    if (!['1', '2', '3'].includes(p.get('v')) || !ids.includes(p.get('a')) || !ids.includes(p.get('b')) || ![0.25, 0.5, 0.75, 1].includes(Number(p.get('s'))) || !['0', '1'].includes(p.get('w'))) throw new Error('请粘贴城市纹理生成的视图参数或链接');
    if (['2', '3'].includes(p.get('v')) && ['x', 'y'].some(k => !/^-?\d{1,6}(?:\.\d{1,3})?$/.test(p.get(k) || ''))) throw new Error('视图中的位置参数无效');
    if (p.get('v') === '3' && !['roads', 'both', 'buildings'].includes(p.get('l'))) throw new Error('视图中的图层参数无效');
    return readState(fragment, ids);
  }
  function report(city, result, walking) {
    const half = result.sideKm / 2;
    const [x, y] = result.offsetKm || [0, 0];
    return { city: city.name, sample: city.district, sampleNote: city.note || null, center: unproject(x, y, city),
      projectionOrigin: [city.lon, city.lat], offsetKm: [x, y],
      bounds: [unproject(x - half, y - half, city), unproject(x + half, y + half, city)],
      filter: walking ? '机动车道路及已收录的步行/骑行道路' : '机动车道路（含 service）',
      projection: '局部等距圆柱近似；WGS84，R=6371.0088km',
      sideKm: result.sideKm, areaKm2: result.areaKm2, roadLengthKm: result.lengthKm,
      roadDensityKmPerKm2: result.density, orientationDiversity: result.diversity,
      orientationBinsKm: result.bins, source: city.source,
      caveats: '局部城区样本；OSM可能缺漏。分隔车道分别计入；方向多样性使用10度轴向分箱与长度加权，不是城市质量评分。' };
  }
  const api = { R, DRIVING, WALKING, project, unproject, clip, prepare, prepareBuildings, ringArea, clipRing, analyzeBuildings, analyze, panBounds, clampOffset, readState, stateHash, parseView, report };
  if (typeof module === 'object' && module.exports) module.exports = api; else root.CityCore = api;
})(globalThis);
