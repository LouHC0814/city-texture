const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const L = require('../src/model-library.cjs');
const V = require('../dist/view.js');
const builtin = { id: 'eiffel-tower', name: '埃菲尔铁塔', builtin: true };
const fixture = name => new Uint8Array(fs.readFileSync(path.join(__dirname, '../tools/模型体检/反例', name)));
const a = () => L.inspect(fixture('01-normal-indexed.glb'), { name: '人工测试三角网格', author: '测试', license: 'MIT' });
const b = () => L.inspect(fixture('10-embedded-png-real.glb'), { name: '人工贴图测试立方体', place: '非真实建筑' });
const view = id => ({ format: V.FORMAT, version: 1, modelId: id, wireframe: false,
  view: { view: 'custom', camera: [10, 12, 14], target: [0, 5.6, 0], fov: 40, near: 0.1, far: 180 } });

test('本地模型身份由原始 GLB 的 SHA-256 决定；保留原字节与文件版权声明', async () => {
  const first = await a(), second = await a();
  assert.equal(first.id, second.id); assert.match(first.id, /^local-[a-f0-9]{64}$/);
  assert.deepEqual(first.bytes, fixture('01-normal-indexed.glb'));
  assert.equal(first.triangles, 2);
  const changedName = await L.inspect(first.bytes, { name: '改显示名' });
  assert.equal(changedName.id, first.id);
});
test('与 CLI 共用准入：坏容器、外部图片、扩展、世界范围溢出均拒绝', async () => {
  for (const file of ['06-bad-magic.glb', '08-external-image.glb', '09-unsupported-extension.glb', 'codex-world-overflow.glb', 'codex-bounds-size-overflow.glb']) {
    await assert.rejects(L.inspect(fixture(file)), /无法加入/);
  }
  await assert.rejects(L.inspect(new Uint8Array(L.LIMITS.file + 1)), /8 MiB/);
  await assert.rejects(L.inspect(new Uint8Array()), /8 MiB/);
});
test('资料不执行 HTML；来源只接受无账号信息的 HTTPS，文字有限长', () => {
  assert.equal(L.metadata({ name: '<img onerror=alert(1)>' }).name, '<img onerror=alert(1)>');
  for (const source of ['javascript:alert(1)', 'data:text/html,x', 'https://user:password@example.org', 'http://example.org']) assert.throws(() => L.metadata({ source }), /HTTPS/);
  assert.throws(() => L.metadata({ author: 'x'.repeat(101) }), /文字/);
  assert.throws(() => L.metadata({ name: 'a\nb' }), /文字/);
  assert.equal(L.metadata({ source: 'https://example.org/model' }).source, 'https://example.org/model');
  assert.equal(L.metadata().license, '未声明许可');
});
test('重复模型、份数与累计大小限制独立生效', async () => {
  const entry = await a(); assert.throws(() => L.quota([entry], entry), /已经/);
  assert.throws(() => L.quota(Array.from({ length: 4 }, (_, id) => ({ id, bytes: new Uint8Array(1) }))), /3 份/);
  assert.throws(() => L.quota([{ id: 'a', bytes: new Uint8Array(L.LIMITS.total + 1) }]), /16 MiB/);
});
test('工作台保存与打开完整保留两份原始模型、资料、当前建筑与独立视角', async () => {
  const first = await a(), second = await b();
  const views = new Map([[builtin.id, view(builtin.id)], [first.id, view(first.id)], [second.id, { ...view(second.id), wireframe: true }]]);
  const saved = L.serialize([first, second], views, second.id, builtin, V);
  const restored = await L.parse(saved, builtin, V);
  assert.equal(restored.activeId, second.id); assert.equal(restored.entries.length, 2);
  assert.deepEqual(restored.entries[0].bytes, first.bytes); assert.deepEqual(restored.entries[1].bytes, second.bytes);
  assert.deepEqual(restored.views, views);
  assert.equal(restored.entries[0].author, first.author);
});
test('工作台预览不注册模型；错误/未知模型与跨模型视角均不能改变注册表', async () => {
  const entry = await a(), before = Object.keys(V.KNOWN_MODELS);
  const raw = JSON.parse(L.serialize([entry], new Map([[entry.id, view(entry.id)]]), entry.id, builtin, V));
  await L.parse(JSON.stringify(raw), builtin, V); assert.deepEqual(Object.keys(V.KNOWN_MODELS), before);
  raw.views[entry.id].modelId = builtin.id;
  await assert.rejects(L.parse(JSON.stringify(raw), builtin, V), /不一致/);
  assert.deepEqual(Object.keys(V.KNOWN_MODELS), before);
});
test('损坏校验值、非规范 base64、重复模型、缺失当前建筑和其他格式被拒绝', async () => {
  const entry = await a();
  const base = JSON.parse(L.serialize([entry], new Map(), entry.id, builtin, V));
  const mutations = [x => { x.models[0].id = 'local-' + '0'.repeat(64); }, x => { x.models[0].data += '!'; },
    x => { x.models.push(x.models[0]); }, x => { x.activeId = 'missing'; }, x => { x.format = 'city-texture-project'; },
    x => { x.version = 2; }, x => { x.extra = true; }];
  for (const mutate of mutations) { const raw = structuredClone(base); mutate(raw); await assert.rejects(L.parse(JSON.stringify(raw), builtin, V)); }
  await assert.rejects(L.parse('{bad', builtin, V), /JSON/);
  await assert.rejects(L.parse(' '.repeat(L.LIMITS.project + 1), builtin, V), /24 MiB/);
});
test('视角注册只允许文件身份，本地视角移除后失效，旧铁塔文件始终兼容', async () => {
  const entry = await a();
  assert.throws(() => V.parseView(JSON.stringify(view(entry.id))), /模型/);
  V.registerModel(entry.id, { label: entry.name, author: entry.author, license: entry.license });
  assert.equal(V.parseView(JSON.stringify(view(entry.id))).modelId, entry.id);
  V.unregisterModel(entry.id); assert.throws(() => V.parseView(JSON.stringify(view(entry.id))), /模型/);
  V.unregisterModel(builtin.id); assert.equal(V.parseView(JSON.stringify(view(builtin.id))).modelId, builtin.id);
  for (const id of ['__proto__', 'constructor', 'toString', 'random']) assert.throws(() => V.validateView(view(id)), /模型/);
  assert.throws(() => V.registerModel('other', { label: 'x', author: 'x', license: 'x' }), /SHA-256/);
});
test('真实大模型的数兆 base64 可完整往返，不依赖小样本或递归正则', async () => {
  const archive = require('../dist/data/landmark-eiffel.js');
  const bytes = new Uint8Array(require('node:zlib').gunzipSync(Buffer.from(archive.data, 'base64')));
  const entry = await L.inspect(bytes, { name: archive.name, author: archive.author, license: archive.license, source: archive.source });
  const saved = L.serialize([entry], new Map([[entry.id, view(entry.id)]]), entry.id, builtin, V);
  assert.ok(saved.length > 5 * 1024 * 1024);
  const restored = await L.parse(saved, builtin, V);
  assert.deepEqual(restored.entries[0].bytes, bytes); assert.equal(restored.entries[0].triangles, 147604);
});
test('图片在真实解码前核对分辨率、总像素与声明类型，防止压缩小文件占满纹理', async () => {
  const fixtures = require('./model-fixtures.cjs'), png = fixtures.png();
  const oversized = Buffer.from(png); oversized.writeUInt32BE(8192, 16);
  await assert.rejects(L.inspect(new Uint8Array(fixtures.textured(oversized))), /4096/);
  await assert.rejects(L.inspect(new Uint8Array(fixtures.textured(png, 'image/jpeg'))), /类型/);
  const full = Buffer.from(png); full.writeUInt32BE(4096, 16); full.writeUInt32BE(4096, 20);
  await assert.rejects(L.inspect(new Uint8Array(fixtures.textured(full, 'image/png', 2))), /总像素/);
  await assert.rejects(L.inspect(new Uint8Array(fixtures.textured(png, 'image/png', 17))), /16 张/);
  assert.equal((await L.inspect(new Uint8Array(fixtures.textured(png)))).triangles, 12);
});
