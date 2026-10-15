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
  const ids = ['zurich', 'bern'], state = { left: 'bern', right: 'zurich', side: 0.25, walking: false };
  assert.deepEqual(C.readState(C.stateHash(state), ids), state);
  const invalid = C.readState('#v=1&a=<img>&b=none&s=Infinity&w=yes', ids);
  assert.equal(invalid.left, 'zurich'); assert.equal(invalid.right, 'bern'); assert.equal(invalid.side, 0.75); assert.equal(invalid.walking, false);
  assert.deepEqual(C.readState('#v=999&a=bern', ids), C.readState('', ids));
});
test('报告保留窗口坐标与来源，不输出绘制缓存', () => {
  const city = { name: '测试', district: '测试样本', lat: 0, lon: 0, source: { license: 'ODbL-1.0' } };
  const r = C.report(city, C.analyze([], 0.5), true);
  assert.equal(r.areaKm2, 0.25); assert.equal(r.bounds.length, 2); close(r.bounds[0][0], -r.bounds[1][0]);
  assert.equal(r.source.license, 'ODbL-1.0'); assert.equal(r.segments, undefined); assert.ok(r.caveats.includes('不是城市质量评分'));
});
for (const id of ['zurich', 'bern']) {
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
