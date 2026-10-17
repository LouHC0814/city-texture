const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const C = require('../dist/core.js');
const close = (a, b, epsilon = 1e-8) => assert.ok(Math.abs(a - b) < epsilon, `${a} ≈ ${b}`);
const road = (points, nodes = points.map((_, i) => i + 1), type = 'residential', id = 1) => ({ id, type, points, nodes });

test('投影使用纬度修正经向距离，且可逆', () => {
  const center = { lat: 60, lon: 10 };
  const p = C.project(10.01, 60.01, center);
  close(p[1] / p[0], 2); const geo = C.unproject(...p, center); close(geo[0], 10.01); close(geo[1], 60.01);
});
test('穿越观察窗口的道路只累计内部长度', () => {
  const r = C.analyze([road([[-2, 0], [2, 0]])], 1);
  close(r.lengthKm, 1); close(r.density, 1); assert.deepEqual(r.segments[0].a, [-0.5, 0]); assert.deepEqual(r.segments[0].b, [0.5, 0]);
});
test('窗口外、零长、仅触碰角点的线段不产生长度', () => {
  assert.equal(C.clip([1, 1], [2, 2], 0.5), null);
  assert.equal(C.clip([0, 0], [0, 0], 0.5), null);
  assert.equal(C.clip([-1, 0], [0, 1], 0.5), null);
});
test('斜线裁剪及沿边界线段正确', () => {
  const r = C.clip([-1, -1], [1, 1], 0.5); assert.deepEqual(r, [[-0.5, -0.5], [0.5, 0.5]]);
  assert.deepEqual(C.clip([-1, 0.5], [1, 0.5], 0.5), [[-0.5, 0.5], [0.5, 0.5]]);
});
test('同一 OSM 节点对重复或反向出现时去重', () => {
  const a = road([[-0.25, 0], [0.25, 0]], [1, 2]);
  const b = road([[0.25, 0], [-0.25, 0]], [2, 1], 'residential', 2);
  const r = C.analyze([a, b, a], 1); close(r.lengthKm, 0.5); assert.equal(r.segments.length, 1);
});
test('不同节点的平行车道分别计入', () => {
  const r = C.analyze([road([[-0.25, 0], [0.25, 0]], [1, 2]), road([[-0.25, 0.01], [0.25, 0.01]], [3, 4])], 1);
  close(r.lengthKm, 1);
});
test('弯折路段累计折线长度，方向图保存两个方向', () => {
  const r = C.analyze([road([[-0.25, -0.25], [0.25, -0.25], [0.25, 0.25]])], 1);
  close(r.lengthKm, 1); close(r.bins[0], 0.5); close(r.bins[9], 0.5); close(r.diversity, Math.log(2) / Math.log(18) * 100);
});
test('方向分布按长度而非道路数量加权，正反方向合并', () => {
  const r = C.analyze([road([[-0.4, 0], [0.4, 0]], [1, 2]), road([[0, 0.1], [0, -0.1]], [3, 4])], 1);
  close(r.bins[9], 0.8); close(r.bins[0], 0.2); close(r.bins.reduce((a, b) => a + b), r.lengthKm);
});
test('步行开关不混入 construction 等未收录类型', () => {
  const rs = [road([[-0.4, 0], [0.4, 0]], [1, 2]), road([[0, -0.4], [0, 0.4]], [3, 4], 'footway'), road([[-0.4, -0.4], [0.4, 0.4]], [5, 6], 'construction')];
  close(C.analyze(rs, 1).lengthKm, 0.8); close(C.analyze(rs, 1, true).lengthKm, 1.6);
});
test('密度的分母随尺度正确变化', () => {
  const r = C.analyze([road([[-1, 0], [1, 0]])], 0.25); close(r.lengthKm, 0.25); close(r.areaKm2, 0.0625); close(r.density, 4);
});
test('空样本多样性不可用，单方向为零；拒绝非法尺度', () => {
  assert.equal(C.analyze([], 1).diversity, null); close(C.analyze([road([[-0.2, 0], [0.2, 0]])], 1).diversity, 0);
  for (const bad of [NaN, Infinity, -1, 0, 0.7, '1']) assert.throws(() => C.analyze([], bad));
});
test('格式校验拒绝非有限坐标和节点错位', () => {
  assert.throws(() => C.prepare({ lon: 0, lat: 0, roads: [{ points: [[0, NaN]], nodes: [1] }] }));
  assert.throws(() => C.prepare({ lon: 0, lat: 0, roads: [{ points: [[0, 0]], nodes: [] }] }));
});
test('分享状态只接受已存在的城市与预设尺度', () => {
  const ids = ['zurich', 'bern'], state = { left: 'bern', right: 'zurich', side: 0.25, walking: false, offset: [0.123456, -0.0351], layer: 'both' };
  assert.deepEqual(C.readState(C.stateHash(state), ids), state);
  const invalid = C.readState('#v=1&a=<img>&b=none&s=Infinity&w=yes', ids);
  assert.equal(invalid.left, 'zurich'); assert.equal(invalid.right, 'bern'); assert.equal(invalid.side, 0.75); assert.equal(invalid.walking, false);
  assert.deepEqual(C.readState('#v=999&a=bern', ids), C.readState('', ids));
});
test('平移后按新窗口裁剪，不把世界坐标直接作为画布坐标', () => {
  const r = C.analyze([road([[0, 0], [1, 0]])], 0.5, false, [0.5, 0]);
  close(r.lengthKm, 0.5); assert.deepEqual(r.offsetKm, [0.5, 0]); assert.deepEqual(r.segments[0].a, [-0.25, 0]); assert.deepEqual(r.segments[0].b, [0.25, 0]);
  assert.throws(() => C.analyze([], 0.5, false, [Infinity, 0]));
});
test('平移、选择与 v1 旧视图兼容；无效位置不会进入计算', () => {
  const ids = ['zurich', 'bern'];
  const old = C.readState('#v=1&a=bern&b=zurich&s=0.5&w=0&x=100&y=100', ids); assert.deepEqual(old.offset, [0, 0]); assert.equal(old.left, 'bern');
  const invalid = C.readState('#v=2&a=bern&b=zurich&s=1&w=1&x=NaN&y=1e300', ids); assert.deepEqual(invalid.offset, [0, 0]);
});
test('平移报告以实际位置为中心并保留投影原点', () => {
  const city = { name: '测试', district: '测试', lat: 47, lon: 8, source: {} };
  const r = C.report(city, C.analyze([], 0.25, false, [0.12, -0.07]), false);
  assert.deepEqual(r.center, C.unproject(0.12, -0.07, city)); assert.deepEqual(r.projectionOrigin, [8, 47]);
  assert.deepEqual(r.bounds[0], C.unproject(-0.005, -0.195, city)); assert.deepEqual(r.offsetKm, [0.12, -0.07]);
});
test('南京与任一内置城市的联动窗口都在道路和建筑下载框内', () => {
  const city = require('../dist/data/nanjing.js');
  for (const id of ['zurich', 'bern', 'nanjing']) for (const side of [0.25, 0.5, 0.75, 1]) {
    const other = require(`../dist/data/${id}.js`);
    const selected = [city, other], inputs = [...selected, ...selected.map(c => ({ ...c, bbox: require(`../dist/data/${c.id}-buildings.js`).bbox }))];
    const limits = C.panBounds(inputs, side);
    for (const request of [[-99, -99], [99, 99], [-99, 99], [99, -99]]) {
      const offset = C.clampOffset(request, limits);
      for (const c of inputs) {
        const report = C.report(c, C.analyze(C.prepare(c), side, true, offset), true);
        assert.ok(report.bounds[0][0] >= c.bbox[1] && report.bounds[0][1] >= c.bbox[0]);
        assert.ok(report.bounds[1][0] <= c.bbox[3] && report.bounds[1][1] <= c.bbox[2]);
      }
    }
  }
  assert.ok(C.report(city, C.analyze(C.prepare(city), 0.75, true), true).sampleNote.includes('地下'));
});
test('视图恢复接受参数和链接，拒绝未知城市、版本与坏数据', () => {
  const ids = ['zurich', 'bern'], hash = '#v=2&a=bern&b=zurich&s=0.5&w=1&x=25.125&y=-10.000';
  assert.deepEqual(C.parseView('https://example.com/app/' + hash, ids), C.readState(hash, ids));
  assert.deepEqual(C.parseView('  ' + hash.slice(1) + '\n', ids).offset, [0.025125, -0.01]);
  for (const value of ['', 'v=999&a=bern', 'v=2&a=none&b=bern&s=0.5&w=1&x=0&y=0', hash.replace('x=25.125', 'x=Infinity'), 'x'.repeat(2001)]) assert.throws(() => C.parseView(value, ids));
});
test('平移使用两份数据的共同有效框，放大窗口时向内约束位置', () => {
  const city = require('../dist/data/zurich.js'), other = require('../dist/data/bern.js');
  const small = C.panBounds([city, other], 0.25), large = C.panBounds([city, other], 1);
  assert.ok(small.maxX > large.maxX && small.maxY > large.maxY);
  const offset = C.clampOffset([100, -100], small); assert.deepEqual(offset, [small.maxX, small.minY]);
  assert.deepEqual(C.clampOffset(offset, large), [large.maxX, large.minY]);
  const narrower = { ...city, bbox: [city.lat - 0.002, city.lon - 0.002, city.lat + 0.002, city.lon + 0.002] };
  assert.throws(() => C.panBounds([city, narrower], 1));
});
test('真实样本边缘上的每个观察窗口都落在两份下载框中', () => {
  const cities = ['zurich', 'bern'].map(id => require(`../dist/data/${id}.js`));
  for (const side of [0.25, 0.5, 0.75, 1]) {
    const limits = C.panBounds(cities, side);
    for (const requested of [[-100, -100], [-100, 100], [100, -100], [100, 100], [NaN, Infinity]]) {
      const offset = C.clampOffset(requested, limits);
      for (const city of cities) {
        const r = C.report(city, C.analyze(C.prepare(city), side, true, offset), true), b = city.bbox;
        assert.ok(r.bounds[0][0] >= b[1] && r.bounds[0][1] >= b[0] && r.bounds[1][0] <= b[3] && r.bounds[1][1] <= b[2]);
        close(r.roadDensityKmPerKm2, r.roadLengthKm / r.areaKm2);
      }
      const restored = C.readState(C.stateHash({ left: 'zurich', right: 'bern', side, walking: true, offset }), cities.map(c => c.id));
      assert.deepEqual(restored.offset, offset);
    }
  }
});
test('报告保留窗口坐标与来源，不输出绘制缓存', () => {
  const city = { name: '测试', district: '测试样本', lat: 0, lon: 0, source: { license: 'ODbL-1.0' } };
  const r = C.report(city, C.analyze([], 0.5), true);
  assert.equal(r.areaKm2, 0.25); assert.equal(r.bounds.length, 2); close(r.bounds[0][0], -r.bounds[1][0]);
  assert.equal(r.source.license, 'ODbL-1.0'); assert.equal(r.segments, undefined); assert.ok(r.caveats.includes('不是城市质量评分'));
});
for (const id of ['zurich', 'bern', 'nanjing']) {
  test(`真实样本 ${id}：来源、格式与各尺度的几何不变量`, () => {
    const city = require(`../dist/data/${id}.js`), prepared = C.prepare(city);
    assert.equal(city.id, id); assert.equal(city.source.license, 'ODbL-1.0'); assert.ok(city.source.query.includes('way[highway]'));
    assert.match(city.source.rawSha256, /^[a-f0-9]{64}$/); assert.ok(Number.isFinite(Date.parse(city.source.fetchedAt))); assert.ok(city.roads.length > 100);
    let lastLength = 0;
    for (const size of [0.25, 0.5, 0.75, 1]) {
      const r = C.analyze(prepared, size, true), driving = C.analyze(prepared, size, false);
      assert.ok(r.lengthKm >= lastLength); lastLength = r.lengthKm;
      assert.ok(driving.lengthKm <= r.lengthKm + 1e-9); assert.ok(r.diversity >= 0 && r.diversity <= 100);
      close(r.bins.reduce((a, b) => a + b), r.lengthKm);
      for (const s of r.segments) for (const p of [s.a, s.b]) for (const v of p) assert.ok(Math.abs(v) <= size / 2 + 1e-9);
    }
  });
}
test('离线入口引用的文件都存在，且没有 CDN/在线地图依赖', () => {
  const root = path.resolve(__dirname, '../dist'), html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  for (const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
    if (/^https?:/.test(match[1])) continue;
    assert.ok(fs.existsSync(path.resolve(root, match[1])), match[1]);
  }
  assert.ok(!/<script[^>]+src="https?:/.test(html));
});

const square = (min, max) => [[min, min], [max, min], [max, max], [min, max], [min, min]];
const footprint = (outers, inners = [], id = 'way/1') => ({ id, outers, inners,
  bbox: [Math.min(...outers.flat().map(p => p[0])), Math.min(...outers.flat().map(p => p[1])), Math.max(...outers.flat().map(p => p[0])), Math.max(...outers.flat().map(p => p[1]))] });
test('建筑裁剪覆盖包围整个窗口的轮廓，且不改变原始数据', () => {
  const ring = square(-2, 2), copy = JSON.stringify(ring), clipped = C.clipRing(ring, 0.25);
  close(C.ringArea(clipped), 0.25); assert.equal(JSON.stringify(ring), copy);
  for (const p of clipped) assert.ok(p.every(v => Math.abs(v) <= 0.25));
  assert.equal(C.analyzeBuildings([footprint([ring])], 0.5).featureCount, 1);
});
test('仅触碰建筑边界或完全在窗口外的轮廓不计数', () => {
  assert.equal(C.analyzeBuildings([footprint([square(0.5, 1)])], 1).featureCount, 0);
  assert.equal(C.analyzeBuildings([footprint([square(2, 3)])], 0.5).featureCount, 0);
});
test('窗口完全位于内院时不计建筑，移至外壳后计入', () => {
  const building = footprint([square(-0.5, 0.5)], [square(-0.3, 0.3)]);
  assert.equal(C.analyzeBuildings([building], 0.25).featureCount, 0);
  assert.equal(C.analyzeBuildings([building], 0.25, [0.35, 0]).featureCount, 1);
});
test('凹多边形裁剪的正面积不使用包围框替代', () => {
  const l = [[-0.5, -0.5], [0.5, -0.5], [0.5, -0.2], [-0.2, -0.2], [-0.2, 0.5], [-0.5, 0.5], [-0.5, -0.5]];
  assert.equal(C.analyzeBuildings([footprint([l])], 0.25).featureCount, 0);
  close(C.ringArea(C.clipRing(l, 0.5)), 0.51);
});
test('一个关系包含多片轮廓仍按一个 OSM 要素计数', () => {
  const building = footprint([square(-0.4, -0.2), square(0.2, 0.4)], [], 'relation/1');
  assert.equal(C.analyzeBuildings([building], 1).featureCount, 1);
});
test('建筑准备阶段拒绝未闭合坐标、重复 ID 与错误城区', () => {
  const city = { id: 'sample', lon: 0, lat: 0 }, feature = { id: 'way/1', outers: [square(0, 0.001)], inners: [] };
  assert.equal(C.prepareBuildings(city, { cityId: 'sample', features: [feature] }).length, 1);
  assert.throws(() => C.prepareBuildings(city, { cityId: 'other', features: [feature] }));
  assert.throws(() => C.prepareBuildings(city, { cityId: 'sample', features: [feature, feature] }));
  assert.throws(() => C.prepareBuildings(city, { cityId: 'sample', features: [{ ...feature, outers: [[[0, 0], [1, 0], [0, 1]]] }] }));
});
test('图层视图支持 v3，v1/v2 保持仅道路，坏图层不可恢复', () => {
  const ids = ['zurich', 'bern'];
  for (const layer of ['roads', 'both', 'buildings']) {
    const state = { ...C.readState('', ids), layer };
    assert.deepEqual(C.parseView(C.stateHash(state), ids), state);
  }
  for (const v of ['1', '2']) assert.equal(C.readState(`#v=${v}&a=bern&b=zurich&s=0.5&w=1&x=10&y=0`, ids).layer, 'roads');
  assert.throws(() => C.parseView('#v=3&a=bern&b=zurich&s=0.5&w=1&x=0&y=0&l=bad', ids));
});
for (const id of ['zurich', 'bern', 'nanjing']) test(`真实建筑 ${id}：来源、内院、要素唯一与窗口变化`, () => {
  const city = require(`../dist/data/${id}.js`), data = require(`../dist/data/${id}-buildings.js`), buildings = C.prepareBuildings(city, data);
  assert.deepEqual(data.bbox, city.bbox); assert.equal(data.source.license, 'ODbL-1.0'); assert.match(data.source.rawSha256, /^[a-f0-9]{64}$/);
  assert.ok(data.features.length > 100 && data.conversion.innerRings > 0 && data.conversion.relations > 0);
  assert.equal(data.conversion.featureCount, data.features.length); assert.equal(new Set(buildings.map(b => b.id)).size, buildings.length);
  let previous = 0;
  for (const side of [0.25, 0.5, 0.75, 1]) { const n = C.analyzeBuildings(buildings, side).featureCount; assert.ok(n >= previous && n <= buildings.length); previous = n; }
  assert.throws(() => C.analyzeBuildings(buildings, NaN));
});
