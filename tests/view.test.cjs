const { test } = require('node:test');
const assert = require('node:assert/strict');
const V = require('../dist/view.js');

const iso = { view: 'iso', camera: [10, 12, 14], target: [0, 5.6, 0], fov: 40, near: 0.1, far: 180 };
const custom = { view: 'custom', camera: [-5.4, 3.1, 7.7], target: [1, 2, 3], fov: 55, near: 0.5, far: 250 };

test('合法视角往返：构造、序列化与解析均保留全部字段', () => {
  const value = V.createView('eiffel-tower', iso, true);
  assert.equal(value.format, V.FORMAT); assert.equal(value.version, V.VERSION);
  assert.equal(value.modelId, 'eiffel-tower'); assert.equal(value.wireframe, true);
  assert.equal(value.view.view, 'iso'); assert.deepEqual(value.view.camera, iso.camera);
  assert.deepEqual(value.view.target, iso.target);
  assert.equal(value.view.fov, 40); assert.equal(value.view.near, 0.1); assert.equal(value.view.far, 180);
  const json = JSON.stringify(value);
  const parsed = V.parseView(json);
  assert.deepEqual(parsed.view.camera, iso.camera); assert.deepEqual(parsed.view.target, iso.target);
  assert.equal(parsed.view.fov, 40); assert.equal(parsed.view.near, 0.1); assert.equal(parsed.view.far, 180);
  assert.equal(parsed.wireframe, true); assert.equal(parsed.modelId, 'eiffel-tower');
  const [dx, dy, dz] = [iso.camera[0] - iso.target[0], iso.camera[1] - iso.target[1], iso.camera[2] - iso.target[2]];
  assert.ok(Math.abs(parsed.view.distance - Math.sqrt(dx * dx + dy * dy + dz * dz)) < 1e-9);
});

test('不带 BOM 的 JSON、超大文件、损坏 JSON 与非字符串输入都被拒绝', () => {
  assert.throws(() => V.parseView(null), /字符串/);
  assert.throws(() => V.parseView({ format: V.FORMAT }), /字符串/);
  assert.throws(() => V.parseView('{not json'), /JSON/);
  assert.throws(() => V.parseView(' '.repeat(V.MAX_BYTES + 1)), /16384/);
  assert.throws(() => V.parseView('中'.repeat(Math.floor(V.MAX_BYTES / 3) + 1)), /16384/);
});

test('顶层结构、空对象、纯数组都不是有效视角', () => {
  for (const bad of [null, undefined, [], 'string', 42]) assert.throws(() => V.validateView(bad), /不是有效/);
});

test('格式标识、版本号、模型 ID 与未知字段被严格检查', () => {
  assert.throws(() => V.validateView({ format: 'other-project', version: 1, modelId: 'eiffel-tower', view: iso }), /三维视角文件格式/);
  assert.throws(() => V.validateView({ format: V.FORMAT, version: 2, modelId: 'eiffel-tower', view: iso }), /三维视角文件/);
  assert.throws(() => V.validateView({ format: V.FORMAT, version: 0, modelId: 'eiffel-tower', view: iso }), /三维视角文件/);
  assert.throws(() => V.validateView({ format: V.FORMAT, version: 1, modelId: 'unknown-model', view: iso }), /模型/);
  assert.throws(() => V.validateView({ format: V.FORMAT, version: 1, modelId: 'eiffel-tower', view: iso, rogue: 1 }), /未知字段/);
  assert.throws(() => V.validateView({ format: V.FORMAT, version: 1, modelId: 'eiffel-tower', view: { ...iso, extra: 1 } }), /未知字段/);
});

test('预设名必须为 iso/front/top/custom 之一', () => {
  assert.throws(() => V.validateView({ format: V.FORMAT, version: 1, modelId: 'eiffel-tower', view: { ...iso, view: 'side' } }), /预设名称/);
  for (const bad of [null, '', 1, {}]) assert.throws(() => V.validateView({ format: V.FORMAT, version: 1, modelId: 'eiffel-tower', view: { ...iso, view: bad } }), /预设名称/);
  assert.doesNotThrow(() => V.validateView({ format: V.FORMAT, version: 1, modelId: 'eiffel-tower', view: { ...iso, view: 'custom' } }));
});

test('相机与目标必须是三元有限数值数组；过大、非有限、错误形状被拒绝', () => {
  for (const bad of [[10, 12], [10, 12, 14, 15], [NaN, 12, 14], [Infinity, 12, 14], [-Infinity, 12, 14],
    [1e7, 12, 14], '10,12,14', { x: 1, y: 2, z: 3 }, null, undefined, [10, 12, 'x']]) {
    assert.throws(() => V.validateView({ format: V.FORMAT, version: 1, modelId: 'eiffel-tower', view: { ...iso, camera: bad } }), /相机/);
  }
  for (const bad of [[0, 5.6], [0, 5.6, 0, 1], [NaN, 5.6, 0], [-Infinity, 5.6, 0]]) {
    assert.throws(() => V.validateView({ format: V.FORMAT, version: 1, modelId: 'eiffel-tower', view: { ...iso, target: bad } }), /目标/);
  }
});

// 短距离基础视图：camera→target=3，用于在不触发“远裁剪面小于相机到目标距离”规则的前提下测试 far 字段校验。
const closeBase = { view: 'custom', camera: [3, 4, 0], target: [0, 4, 0], fov: 40, near: 0.1, far: 5 };
test('FOV、near 与 far 各自有合理范围，far 必须大于 near', () => {
  for (const bad of [9, 91, NaN, Infinity, -10, '40', null]) {
    assert.throws(() => V.validateView({ format: V.FORMAT, version: 1, modelId: 'eiffel-tower', view: { ...iso, fov: bad } }), /FOV/);
  }
  for (const bad of [0, -1, 11, NaN, '0.1']) {
    assert.throws(() => V.validateView({ format: V.FORMAT, version: 1, modelId: 'eiffel-tower', view: { ...iso, near: bad } }), /near/);
  }
  for (const bad of [0, -1, 10001, NaN, '180']) {
    // 同样 far 值会先触发“远裁剪面小于相机到目标距离”（短距离 3 也无法绕过 0/-1），
    // 测试断言同时接受两种拒绝消息：单纯越界 vs. 对当前距离而言过小。
    assert.throws(() => V.validateView({ format: V.FORMAT, version: 1, modelId: 'eiffel-tower', view: { ...closeBase, far: bad } }), /far|远裁剪面/);
  }
  assert.throws(() => V.validateView({ format: V.FORMAT, version: 1, modelId: 'eiffel-tower', view: { ...closeBase, near: 5, far: 4 } }), /far/);
});

test('相机与目标距离过近（重合及亚单位距离）被拒绝；远距离构图也被距离上限拦截', () => {
  // 完全重合：distance=0，立刻被拒绝，避免目标点同时也是相机。
  const coincident = { ...iso, camera: iso.target.slice() };
  assert.throws(() => V.validateView({ format: V.FORMAT, version: 1, modelId: 'eiffel-tower', view: coincident }), /视角相机过于接近观察目标/);
  // 稍大于 0 但小于 1：仍然过近，相机几乎在观察目标点上，恢复后必然看到模型缺失或被裁。
  const tooClose = { ...iso, camera: [iso.target[0] + 0.1, iso.target[1], iso.target[2]] };
  assert.throws(() => V.validateView({ format: V.FORMAT, version: 1, modelId: 'eiffel-tower', view: tooClose }), /视角相机过于接近观察目标/);
  const far = { view: 'custom', camera: [5001, 0, 0], target: [-5000, 0, 0], fov: 40, near: 0.1, far: 10000 };
  assert.throws(() => V.validateView({ format: V.FORMAT, version: 1, modelId: 'eiffel-tower', view: far }), /距离/);
  const ok = V.validateView({ format: V.FORMAT, version: 1, modelId: 'eiffel-tower', view: custom });
  assert.equal(ok.view.view, 'custom');
});

test('远裁剪面小于相机到目标距离被拒绝，确保模型在投影内完整可见', () => {
  // camera-target ≈ 23.7，但 far 仅 10：模型显然会被裁掉。
  const farTooShort = { view: 'custom', camera: [20, 8, 12], target: [0, 5.6, 0], fov: 40, near: 0.1, far: 10 };
  assert.throws(() => V.validateView({ format: V.FORMAT, version: 1, modelId: 'eiffel-tower', view: farTooShort }), /远裁剪面/);
  // 同一距离，far 提升到 30：可以通过文件级校验，但运行时还需结合模型包围球再核一次。
  const farComfortable = { view: 'custom', camera: [20, 8, 12], target: [0, 5.6, 0], fov: 40, near: 0.1, far: 30 };
  const result = V.validateView({ format: V.FORMAT, version: 1, modelId: 'eiffel-tower', view: farComfortable });
  assert.ok(result.view.far >= result.view.distance);
});

test('线框字段必须为布尔值；缺失时默认为 false', () => {
  const a = V.validateView({ format: V.FORMAT, version: 1, modelId: 'eiffel-tower', view: iso });
  assert.equal(a.wireframe, false);
  const b = V.validateView({ format: V.FORMAT, version: 1, modelId: 'eiffel-tower', view: iso, wireframe: true });
  assert.equal(b.wireframe, true);
  for (const bad of ['yes', 1, 0, null, {}]) {
    assert.throws(() => V.validateView({ format: V.FORMAT, version: 1, modelId: 'eiffel-tower', view: iso, wireframe: bad }), /线框/);
  }
});

test('createView 拒绝未注册模型；生成的 JSON 体积不得超过上限', () => {
  assert.throws(() => V.createView('other-tower', iso, false), /尚未注册/);
  const fine = { ...iso, camera: [1.123456789, -2.987654321, 3.14159265358979] };
  const value = V.createView('eiffel-tower', fine, false);
  const json = JSON.stringify(value);
  assert.ok(new TextEncoder().encode(json).byteLength <= V.MAX_BYTES);
});

test('解析时拒绝与比较项目、统计报告或单样本包混用的同名/同结构文件', () => {
  const projectLike = JSON.stringify({ format: 'city-texture-project', version: 1, view: '#v=3&a=nanjing&b=zurich' });
  assert.throws(() => V.parseView(projectLike), /三维视角文件格式/);
  const reportLike = JSON.stringify({ version: 3 });
  assert.throws(() => V.parseView(reportLike), /三维视角文件|模型/);
  assert.throws(() => V.parseView(JSON.stringify({ format: V.FORMAT, version: 1, modelId: 'eiffel-tower' })), /视角数据/);
});
