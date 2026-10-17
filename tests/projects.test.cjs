const { test } = require('node:test');
const assert = require('node:assert/strict');
const P = require('../dist/projects.js'), S = require('../dist/samples.js'), C = require('../dist/core.js');
const builtins = ['zurich', 'bern', 'nanjing'].map(id => ({ format: S.FORMAT, version: 1,
  city: require(`../dist/data/${id}.js`), buildings: require(`../dist/data/${id}-buildings.js`) }));
const state = { left: 'nanjing', right: 'zurich', side: 0.5, walking: false, layer: 'buildings', offset: [0.015125, -0.02] };
const fixture = () => P.createProject(state, [], builtins);
function custom(id = 'my-nanjing') {
  const p = structuredClone(builtins[2]); p.city.id = p.buildings.cityId = id; return p;
}
test('比较项目完整携带所选内置样本，恢复毫米精度位置、筛选、图层与统计', () => {
  const pack = fixture(), result = P.parseProject('\uFEFF' + JSON.stringify(pack), builtins);
  assert.deepEqual(result.state, state); assert.equal(result.customSamples.length, 0);
  assert.equal(result.project.samples.length, 2); assert.ok(!result.project.samples.some(p => p.city.id === 'bern'));
  for (const id of [state.left, state.right]) {
    const saved = result.project.samples.find(p => p.city.id === id), original = builtins.find(p => p.city.id === id);
    assert.deepEqual(saved.city.source, original.city.source); assert.deepEqual(saved.buildings, original.buildings);
    assert.deepEqual(C.analyze(C.prepare(saved.city), state.side, state.walking, state.offset), C.analyze(C.prepare(original.city), state.side, state.walking, state.offset));
  }
});
test('携带所有三份导入样本，包括未在当前两侧显示的样本', () => {
  const samples = ['import-a', 'import-b', 'import-c'].map(custom), view = { ...state, left: 'import-a', right: 'import-a' };
  const result = P.parseProject(JSON.stringify(P.createProject(view, samples, builtins)), builtins);
  assert.equal(result.project.samples.length, 3); assert.deepEqual(result.customSamples.map(p => p.city.id), samples.map(p => p.city.id));
  assert.deepEqual(result.state, view); assert.equal(result.customSamples[0].city.note, samples[0].city.note);
});
test('导入与两个内置城市同时保存时上限为五份；忽略自称可信的来源字段', () => {
  const samples = ['import-a', 'import-b', 'import-c'].map(custom); samples[0].city.provenance = '项目内置快照';
  const value = P.createProject(state, samples, builtins); value.provenance = 'trusted';
  const result = P.validateProject(value, builtins);
  assert.equal(result.project.samples.length, 5); assert.equal(result.customSamples.length, 3);
  assert.equal(result.project.provenance, undefined); assert.equal(result.customSamples[0].city.provenance, undefined);
});
test('拒绝错误格式、版本、损坏 JSON、统计报告与单个样本包', () => {
  for (const v of [null, [], {}, { samples: [] }, { format: P.FORMAT, version: 2 }, builtins[0]]) assert.throws(() => P.validateProject(v, builtins));
  assert.throws(() => P.parseProject('{broken', builtins), /JSON/);
  assert.throws(() => P.parseProject(' '.repeat(P.MAX_BYTES + 1), builtins), /32 MiB/);
  assert.throws(() => P.parseProject('中'.repeat(Math.floor(P.MAX_BYTES / 3) + 1), builtins), /32 MiB/);
});
test('重复 ID、缺失样本、错误视图和图层均拒绝，不依赖页面已有样本', () => {
  let value = fixture(); value.samples.push(value.samples[0]); assert.throws(() => P.validateProject(value, builtins), /重复/);
  value = fixture(); value.view = C.stateHash({ ...state, right: 'bern' }); assert.throws(() => P.validateProject(value, builtins), /尚未加载/);
  for (const patch of [{ side: 3 }, { layer: 'unknown' }, { left: 'unknown' }]) {
    value = fixture(); value.view = C.stateHash({ ...state, ...patch }); assert.throws(() => P.validateProject(value, builtins));
  }
});
test('内置 ID 的几何、样本说明或来源被改写时拒绝，不能冒充内置快照', () => {
  for (const change of [p => { p.city.roads.pop(); }, p => { p.city.source.rawSha256 = 'a'.repeat(64); }, p => { p.city.note = '修改口径'; }, p => { p.buildings.features.pop(); }]) {
    const value = fixture(), sample = value.samples.find(p => p.city.id === 'nanjing'); change(sample);
    assert.throws(() => P.validateProject(value, builtins), /内置样本.*不一致/);
  }
});
test('不同程序内置版本拒绝替代；没有同名内置样本时按导入来源处理', () => {
  const value = fixture(), different = structuredClone(builtins); different[2].city.source.snapshotToken = 'new-snapshot';
  assert.throws(() => P.validateProject(value, different), /内置样本.*不一致/);
  const result = P.validateProject(value, builtins.slice(0, 2)); assert.deepEqual(result.customSamples.map(p => p.city.id), ['nanjing']);
});
test('项目数量与单份 8 MiB 资源限制在打开前校验', () => {
  for (const samples of [[], Array(6).fill(builtins[0])]) assert.throws(() => P.validateProject({ ...fixture(), samples }, builtins), /1–5/);
  const samples = ['a', 'b', 'c', 'd'].map(custom);
  assert.throws(() => P.validateProject({ ...fixture(), samples }, builtins), /最多包含 3/);
  const value = fixture(); value.samples[0].extra = 'x'.repeat(S.MAX_BYTES);
  assert.throws(() => P.validateProject(value, builtins), /8 MiB/);
});
test('全部样本都校验，最后一份错误也拒绝；原始输入与程序数据不被更改', () => {
  const value = P.createProject({ ...state, left: 'import-a' }, [custom('import-a'), custom('import-b')], builtins);
  value.samples.at(-1).buildings.features[0].outers[0].pop(); const before = JSON.stringify(value), original = JSON.stringify(builtins);
  assert.throws(() => P.validateProject(value, builtins), /闭合/);
  assert.equal(JSON.stringify(value), before); assert.equal(JSON.stringify(builtins), original);
});
test('越界位置按道路与建筑共同范围约束，返回规范化视图片段', () => {
  const value = fixture(); value.view = C.stateHash({ ...state, offset: [99, -99] });
  const result = P.validateProject(value, builtins), inputs = result.project.samples.flatMap(p => [p.city, { ...p.city, bbox: p.buildings.bbox }]);
  assert.deepEqual(result.state.offset, C.clampOffset([99, -99], C.panBounds(inputs, state.side)));
  assert.equal(result.project.view, C.stateHash(result.state));
});
