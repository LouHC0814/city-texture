const { test } = require('node:test');
const assert = require('node:assert/strict');
const S = require('../dist/samples.js');
const C = require('../dist/core.js');
const fixture = () => structuredClone({ format: S.FORMAT, version: 1,
  city: require('../dist/data/zurich.js'), buildings: require('../dist/data/zurich-buildings.js') });
const rejects = (change, pattern) => { const p = fixture(); change(p); assert.throws(() => S.validateSample(p), pattern); };

for (const id of ['zurich', 'bern', 'nanjing']) test(`样本包 ${id} 往返保留几何、来源、内院与四种尺度统计`, () => {
  const city = require(`../dist/data/${id}.js`), buildings = require(`../dist/data/${id}-buildings.js`);
  const pack = S.parseSample(JSON.stringify({ format: S.FORMAT, version: 1, city, buildings }));
  assert.deepEqual(pack.city.roads, city.roads); assert.deepEqual(pack.city.source, city.source);
  assert.deepEqual(pack.buildings, buildings);
  for (const side of [0.25, 0.5, 0.75, 1]) {
    assert.deepEqual(C.analyze(C.prepare(pack.city), side, true, [0.01, 0.01]), C.analyze(C.prepare(city), side, true, [0.01, 0.01]));
    assert.deepEqual(C.analyzeBuildings(C.prepareBuildings(pack.city, pack.buildings), side), C.analyzeBuildings(C.prepareBuildings(city, buildings), side));
  }
});
test('拒绝统计报告、原始数据、错误版本、损坏 JSON 和超大文件', () => {
  for (const v of ['not json', 'null', '[]', '{}', '{"samples":[]}', '{"elements":[]}', '{"format":"city-texture-sample","version":2}']) assert.throws(() => S.parseSample(v));
  assert.throws(() => S.parseSample(' '.repeat(S.MAX_BYTES + 1)), /8 MiB/);
  assert.throws(() => S.parseSample('中'.repeat(Math.floor(S.MAX_BYTES / 3) + 1)), /8 MiB/);
  assert.equal(S.parseSample('\uFEFF' + JSON.stringify(fixture())).city.id, 'zurich');
});
test('ID、颜色、文本、中心与来源校验阻止无效字段进入 UI', () => {
  for (const id of ['__proto__', 'constructor', 'prototype', '../city', 'X', 'a'.repeat(49)]) rejects(p => { p.city.id = id; }, /ID/);
  rejects(p => { p.city.color = 'url(https://example.com)'; }, /颜色/);
  rejects(p => { p.city.name = 'a\ncity'; }, /城市名/);
  rejects(p => { p.city.name = '中'.repeat(25); }, /城市名/);
  rejects(p => { p.city.lat = 90; }, /样本中心/);
  rejects(p => { p.city.source.fetchedAt = 'yesterday'; }, /抓取时间/);
  rejects(p => { p.buildings.source.license = 'unknown'; }, /ODbL/);
  rejects(p => { p.city.source.rawSha256 = 'abc'; }, /SHA-256/);
  rejects(p => { p.city.source.endpoint = 'javascript:alert(1)'; }, /HTTP/);
  rejects(p => { p.city.source.url = 'https://name:password@example.com'; }, /HTTP/);
});
test('只返回允许字段，不信任输入声明的转换计数和 provenance', () => {
  const p = fixture(); p.city.provenance = 'trusted'; p.city.unknown = { bad: true }; p.unknown = 1;
  p.buildings.conversion.featureCount = 0; p.buildings.conversion.relations = 99999;
  p.city.name = '<img src=x>'; const pack = S.validateSample(p);
  assert.equal(pack.city.name, '<img src=x>'); assert.equal(pack.city.unknown, undefined); assert.equal(pack.city.provenance, undefined);
  assert.equal(pack.unknown, undefined); assert.equal(pack.buildings.conversion.featureCount, p.buildings.features.length);
  assert.notEqual(pack.buildings.conversion.relations, 99999);
  pack.city.roads[0].points[0][0] = 0; assert.notEqual(p.city.roads[0].points[0][0], 0);
});
test('可选样本说明往返保留，拒绝无效说明', () => {
  const p = fixture(); p.city.note = '含地下及室内通道；平面图未区分层级。';
  assert.equal(S.parseSample(JSON.stringify(p)).city.note, p.city.note);
  for (const note of [null, '', 'x'.repeat(161), 'bad\nline']) rejects(value => { value.city.note = note; }, /样本说明/);
});
test('道路和建筑范围都覆盖所有尺度，拒绝过小或过大的下载框', () => {
  rejects(p => { p.city.bbox[0] = p.city.lat - 0.001; }, /501/);
  rejects(p => { p.buildings.bbox[3] = p.city.lon + 0.001; }, /501/);
  rejects(p => { p.city.bbox[0] = p.city.lat - 1; }, /20 公里/);
  rejects(p => { p.city.bbox = [1, 2, 0, 3]; }, /下载框/);
  rejects(p => { p.city.roads[0].points[0] = [0, 0]; }, /25 公里/);
});
test('道路去重依赖的节点 ID、坐标对应关系和资源上限得到校验', () => {
  rejects(p => { p.city.roads[0].nodes.pop(); }, /一一对应/);
  rejects(p => { p.city.roads[0].nodes[0] = '123'; }, /节点 ID/);
  rejects(p => { p.city.roads[0].id = Number.MAX_SAFE_INTEGER + 1; }, /道路 ID/);
  rejects(p => { p.city.roads.push(p.city.roads[0]); }, /不重复/);
  rejects(p => { p.city.roads[1].nodes[0] = p.city.roads[0].nodes[0]; }, /不同坐标/);
  rejects(p => { p.city.roads[0].points[0][0] = Infinity; }, /坐标/);
  rejects(p => { p.city.roads = Array(15001).fill(p.city.roads[0]); }, /道路数量/);
  rejects(p => { p.city.roads[0].points = Array(4097).fill(p.city.roads[0].points[0]); }, /4,096/);
  rejects(p => { p.city.roads.forEach(r => { r.type = 'construction'; }); }, /受支持/);
});
test('建筑匹配、闭环、非零面积、唯一 ID 与资源上限得到校验', () => {
  rejects(p => { p.buildings.cityId = 'bern'; }, /不一致/);
  rejects(p => { p.buildings.features[0].outers[0].pop(); }, /闭合/);
  rejects(p => { const r = p.buildings.features[0].outers[0]; p.buildings.features[0].outers[0] = Array(4).fill(r[0]); }, /面积/);
  rejects(p => { p.buildings.features.push(p.buildings.features[0]); }, /建筑 ID/);
  rejects(p => { p.buildings.features[0].id = '../file'; }, /建筑 ID/);
  rejects(p => { p.buildings.features[0].outers = Array(129).fill(p.buildings.features[0].outers[0]); }, /过多/);
  rejects(p => { p.buildings.features = Array(10001).fill(p.buildings.features[0]); }, /10,000/);
  const p = fixture(); p.buildings.features = []; const result = S.validateSample(p);
  assert.equal(C.analyzeBuildings(C.prepareBuildings(result.city, result.buildings), 1).featureCount, 0);
});
test('200,000 个坐标上限在复杂几何投影前阻止过量输入', () => {
  const p = fixture(), r = p.city.roads[0];
  p.city.roads = Array.from({ length: 50 }, (_, i) => ({ ...r, id: i + 1,
    points: Array.from({ length: 4096 }, () => [...r.points[0]]), nodes: Array(4096).fill(r.nodes[0]) }));
  assert.throws(() => S.validateSample(p), /200,000/);
});
