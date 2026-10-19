// 城市纹理 · GLB 体检工具断言测试（可复跑，失败非 0）
//
//   node tests/run.cjs            # 全部断言
//   node tests/run.cjs --verbose  # 打印每条通过项
//
// 覆盖：
//   A. 交付基线（铁塔）identity 与几何
//   B. 21 个交付反例的准入结论
//   C. Codex 第二次验收提出的 8 个新反例（坏类型 / 越容量 / 非数值变换 / 非整数 count /
//      非有限坐标 / JSON=null / 坏矩阵 / 旋转后精确包围盒）
//   D. 全局不变式：任何 error/unsupported ⇒ status!=='pass'、fatal===true、CLI 退出非 0、
//      且所有数值指标为 null/unknown
//   E. CLI 行为：覆盖保护、原子写入失败回滚、未知参数、--source 只收 JSON
'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert');
const { spawnSync } = require('node:child_process');

const { unpack, pack, triangleGLB } = require('./lib/glb.cjs');
const ROOT = path.resolve(__dirname, '..');
const CLI = path.join(ROOT, 'bin', 'gltf-inspect.cjs');
const { inspect } = require(path.join(ROOT, 'lib', 'inspect.js'));

const VERBOSE = process.argv.includes('--verbose');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'gltf-inspect-test-'));

let pass = 0;
const failures = [];
function ok(name, cond, detail) {
  if (cond) {
    pass++;
    if (VERBOSE) console.log('  PASS  ' + name);
  } else {
    failures.push({ name, detail: detail === undefined ? '' : String(detail) });
    console.log('  FAIL  ' + name + (detail !== undefined ? '  ← ' + detail : ''));
  }
}
function eq(name, actual, expected) {
  ok(name, actual === expected, `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}
function close(name, actual, expected, tol) {
  const t = tol === undefined ? 1e-9 : tol;
  ok(name, typeof actual === 'number' && Math.abs(actual - expected) <= t,
    `expected ${expected} ±${t}, got ${actual}`);
}
function cli(args) {
  const r = spawnSync(process.execPath, [CLI, ...args], { encoding: 'utf8', timeout: 20000, windowsHide: true });
  return { code: r.status, stdout: r.stdout || '', stderr: r.stderr || '' };
}
function reportOf(buf, name) { return inspect(buf, name || 'case'); }

// 不变式：非 pass 时必须"全 null"
function assertUnavailable(name, rep) {
  const g = rep.geometry || {};
  ok(name + ' · geometry.unknown', g.unknown === true, JSON.stringify(g.unknown));
  for (const k of ['geometryTriangles', 'sceneInstancesTriangles', 'positionRecords', 'byMode', 'meshGeometryTriangles']) {
    ok(name + ' · geometry.' + k + '=null', g[k] === null, JSON.stringify(g[k]));
  }
  const b = rep.bounds || {};
  ok(name + ' · bounds.computed=null', b.computed === null, JSON.stringify(b.computed));
}

// ───────────────────────────────────────────────
console.log('A. 交付基线（eiffel）');
// ───────────────────────────────────────────────
{
  const file = path.join(ROOT, '基线', 'eiffel.glb');
  const buf = fs.readFileSync(file);
  const rep = reportOf(buf, 'eiffel');
  eq('A1 字节数', buf.length, 5696248);
  eq('A2 status', rep.status, 'pass');
  eq('A3 fatal', rep.fatal, false);
  eq('A4 几何三角面', rep.geometry.geometryTriangles, 147604);
  eq('A5 场景实例三角面', rep.geometry.sceneInstancesTriangles, 147604);
  eq('A6 issues 为空', (rep.issues || []).length, 0);
  ok('A7 sha256 存在', typeof rep.input.sha256 === 'string' && rep.input.sha256.length === 64, rep.input.sha256);
  ok('A8 世界包围盒已算出', rep.bounds.computed != null);
}

// ───────────────────────────────────────────────
console.log('B. 21 个交付反例');
// ───────────────────────────────────────────────
const FIXTURE_EXPECT = {
  '01-normal-indexed': { status: 'pass', triangles: 2 },
  '02-normal-nonindexed': { status: 'pass', triangles: 2 },
  '03-shared-mesh-two-instances': { status: 'pass', triangles: 12, instances: 24 },
  '04-transform-parent-translation': { status: 'pass', triangles: 12 },
  '05-bbox-self-mismatch': { status: 'pass', triangles: 12, issue: 'W_BBOX_MISMATCH' },
  '06-bad-magic': { status: 'error', issue: 'E_BAD_MAGIC' },
  '07-accessor-out-of-range': { status: 'error', issue: 'E_ACC_OUT_OF_RANGE' },
  '08-external-image': { status: 'error', issue: 'E_NOT_SELF_CONTAINED' },
  '09-unsupported-extension': { status: 'unsupported', issue: 'E_UNSUPPORTED_EXTENSION' },
  '10-embedded-png-real': { status: 'pass', triangles: 12, imageSize: 1 },
  '11-shared-image-two-textures': { status: 'pass', triangles: 12, uniqueImages: 1 },
  '12-malicious-name': { status: 'pass', triangles: 12 },
  '13-sparse-accessor': { status: 'unsupported', issue: 'E_UNSUPPORTED_FEATURE' },
  '14-cycle-node': { status: 'error', issue: 'E_NODE_CYCLE' },
  '15-quantization-required': { status: 'unsupported', issue: 'E_UNSUPPORTED_EXTENSION' },
  '16-default-scene-1': { status: 'pass', triangles: 2, instances: 2 },
  '17-strip-nonindexed': { status: 'pass', triangles: 4 },
  '18-indices-out-of-range': { status: 'error', issue: 'E_INDICES_OUT_OF_RANGE' },
  '19-nan-position': { status: 'error', issue: 'E_POSITION_NON_FINITE' },
  '20-legal-interleaved': { status: 'pass', triangles: 2 },
  '21-real-jpeg': { status: 'pass', triangles: 12, imageSize: 1 }
};

for (const name of Object.keys(FIXTURE_EXPECT)) {
  const exp = FIXTURE_EXPECT[name];
  const file = path.join(ROOT, '反例', name + '.glb');
  if (!fs.existsSync(file)) { ok('B ' + name + ' 文件存在', false, file); continue; }
  const rep = reportOf(fs.readFileSync(file), name);
  const codes = (rep.issues || []).map(i => i.code);
  eq('B ' + name + ' status', rep.status, exp.status);
  eq('B ' + name + ' fatal 与 status 一致', rep.fatal, exp.status !== 'pass');
  if (exp.triangles !== undefined) eq('B ' + name + ' triangles', rep.geometry.geometryTriangles, exp.triangles);
  if (exp.instances !== undefined) eq('B ' + name + ' instances', rep.geometry.sceneInstancesTriangles, exp.instances);
  if (exp.issue) ok('B ' + name + ' 含 ' + exp.issue, codes.indexOf(exp.issue) !== -1, codes.join(','));
  if (exp.uniqueImages !== undefined) eq('B ' + name + ' uniqueImageCount', rep.images.uniqueImageCount, exp.uniqueImages);
  if (exp.imageSize !== undefined) {
    const im = (rep.images.list || [])[0] || {};
    eq('B ' + name + ' image.width', im.width, exp.imageSize);
    eq('B ' + name + ' image.height', im.height, exp.imageSize);
  }
  if (exp.status !== 'pass') assertUnavailable('B ' + name, rep);
}

// ───────────────────────────────────────────────
console.log('C. Codex 第二次验收的 8 个新反例');
// ───────────────────────────────────────────────
const CASES = {
  'C1 坏 componentType(123)': { mutate: (json) => { json.accessors[0].componentType = 123; }, code: 'E_ACC_BAD_CT' },
  'C2 bufferView 越过所属 buffer': { mutate: (json) => { json.bufferViews[0].byteLength = 100000; }, code: 'E_BV_EXCEEDS_BUFFER' },
  'C3 非数值 translation': { mutate: (json) => { json.nodes[0].translation = [0, 'oops', 0]; }, code: 'E_NODE_BAD_TRS' },
  'C4 非整数 count(3.5)': { mutate: (json) => { json.accessors[0].count = 3.5; }, code: 'E_ACC_BAD_COUNT' },
  'C5 未知 JSON 形状(null)': { nullJson: true, code: 'E_JSON_NOT_OBJECT' },
  'C6 坏 matrix(15 项)': { mutate: (json) => { json.nodes[0].matrix = new Array(15).fill(0); }, code: 'E_NODE_BAD_MATRIX' },
  'C7 非有限坐标(NaN)': { nan: true, code: 'E_POSITION_NON_FINITE' },
  'C8 旋转三角形精确包围盒': { rotated: true }
};

for (const label of Object.keys(CASES)) {
  const spec = CASES[label];
  let buf;
  if (spec.nan) {
    buf = triangleGLB((json, bin) => { bin.writeFloatLE(NaN, 0); });
  } else if (spec.rotated) {
    buf = triangleGLB((json) => {
      json.nodes[0].rotation = [0, 0, Math.sin(Math.PI / 8), Math.cos(Math.PI / 8)];
    });
  } else {
    const f = unpack(path.join(ROOT, '反例', '01-normal-indexed.glb'));
    const holder = { json: f.json, bin: f.bin };
    if (spec.nullJson) holder.json = null; else spec.mutate(holder.json);
    buf = pack(holder.json, holder.bin);
  }

  const rep = reportOf(buf, label.replace(/\s.*/, ''));
  const codes = (rep.issues || []).map(i => i.code);

  if (spec.rotated) {
    eq(label + ' · status', rep.status, 'pass');
    ok(label + ' · 无 error code', codes.filter(c => c[0] === 'E').length === 0, codes.join(','));
    const b = rep.bounds.computed;
    ok(label + ' · 有包围盒', b != null);
    if (b) {
      const r = Math.SQRT1_2;
      close(label + ' · min.x', b.min[0], -r);
      close(label + ' · min.y', b.min[1], 0);
      close(label + ' · min.z', b.min[2], 0);
      close(label + ' · max.x', b.max[0], r);
      close(label + ' · max.y', b.max[1], r);
      close(label + ' · max.z', b.max[2], 0);
      ok(label + ' · max.y 不是 sqrt(2)', Math.abs(b.max[1] - Math.SQRT2) > 1e-6, b.max[1]);
    }
  } else {
    eq(label + ' · status 非 pass', rep.status === 'pass', false);
    ok(label + ' · 命中 ' + spec.code, codes.indexOf(spec.code) !== -1, codes.join(','));
    assertUnavailable(label, rep);
  }

  // CLI 退出码：C8 是合法样本应退出 0，其余坏样本必须非 0
  const file = path.join(TMP, label.replace(/[^\w]+/g, '_') + '.glb');
  fs.writeFileSync(file, buf);
  const r = cli(['--input', file, '--out', path.join(TMP, 'cli'), '--name', label.replace(/[^\w]+/g, '_'), '--overwrite']);
  if (spec.rotated) {
    eq(label + ' · CLI 退出 0', r.code, 0);
  } else {
    ok(label + ' · CLI 退出非 0', r.code !== 0, 'exit=' + r.code);
  }
}

// ───────────────────────────────────────────────
console.log('D. 全局不变式：error/unsupported ⇒ 非 pass + CLI 非 0 + 指标不可用');
// ───────────────────────────────────────────────
{
  const dir = path.join(TMP, 'inv');
  fs.mkdirSync(dir, { recursive: true });
  const queue = [];
  for (const n of fs.readdirSync(path.join(ROOT, '反例')).filter(f => f.endsWith('.glb'))) {
    queue.push(path.join(ROOT, '反例', n));
  }
  let checked = 0;
  for (const file of queue) {
    const rep = reportOf(fs.readFileSync(file), path.basename(file, '.glb'));
    const bad = (rep.issues || []).some(i => i.severity === 'error' || i.severity === 'unsupported');
    if (!bad) continue;
    checked++;
    const name = path.basename(file, '.glb');
    eq('D ' + name + ' · status 非 pass', rep.status !== 'pass', true);
    eq('D ' + name + ' · fatal', rep.fatal, true);
    assertUnavailable('D ' + name, rep);
  }
  ok('D · 至少覆盖到一个坏样本', checked > 0, checked);
}

// ───────────────────────────────────────────────
console.log('E. CLI 行为');
// ───────────────────────────────────────────────
{
  const dir = path.join(TMP, 'cli-行为');
  const normal = path.join(ROOT, '反例', '01-normal-indexed.glb');

  // E1 正常写出
  const r1 = cli(['--input', normal, '--out', dir, '--name', 'e1']);
  eq('E1 正常退出 0', r1.code, 0);
  ok('E1 三份产物都在', ['e1.gltf-inspect.json', 'e1.gltf-inspect.html', 'e1.issues.json']
    .every(f => fs.existsSync(path.join(dir, f))));

  // E2 默认拒绝覆盖
  const before = fs.readFileSync(path.join(dir, 'e1.gltf-inspect.json'));
  const r2 = cli(['--input', path.join(ROOT, '反例', '06-bad-magic.glb'), '--out', dir, '--name', 'e1']);
  ok('E2 默认拒绝覆盖退出非 0', r2.code !== 0, 'exit=' + r2.code);
  ok('E2 原 JSON 未变', before.equals(fs.readFileSync(path.join(dir, 'e1.gltf-inspect.json'))));

  // E3 未知参数
  const r3 = cli(['--input', normal, '--out', dir, '--name', 'e3', '--bogus', 'x']);
  eq('E3 未知参数退出 3', r3.code, 3);

  // E4 --source 必须是 JSON
  const txt = path.join(TMP, 'license.txt');
  fs.writeFileSync(txt, 'CC-BY-4.0 original text');
  const r4 = cli(['--input', normal, '--out', dir, '--name', 'e4', '--source', txt]);
  eq('E4 --source 传 txt 应退出 3', r4.code, 3);

  // E5 --source 传 JSON 正常
  const srcJson = path.join(TMP, 'source.json');
  fs.writeFileSync(srcJson, JSON.stringify({ author: 'SDC', license: 'CC-BY-4.0', sourceUrl: 'https://example.org', note: '', credit: '' }));
  const r5 = cli(['--input', normal, '--out', dir, '--name', 'e5', '--source', srcJson]);
  eq('E5 --source 传 JSON 退出 0', r5.code, 0);
  const rep5 = JSON.parse(fs.readFileSync(path.join(dir, 'e5.gltf-inspect.json'), 'utf8'));
  eq('E5 source 进入报告', rep5.source && rep5.source.license, 'CC-BY-4.0');

  // E6 原子写入：第二份目标是目录 → 退出 4 且前一份不被改
  const dir2 = path.join(TMP, 'atomic');
  const r6a = cli(['--input', normal, '--out', dir2, '--name', 'a1']);
  eq('E6 前置：首批写入成功', r6a.code, 0);
  const jsonBefore = fs.readFileSync(path.join(dir2, 'a1.gltf-inspect.json'));
  const issuesBefore = fs.readFileSync(path.join(dir2, 'a1.issues.json'));
  fs.unlinkSync(path.join(dir2, 'a1.gltf-inspect.html'));
  fs.mkdirSync(path.join(dir2, 'a1.gltf-inspect.html'));
  const r6b = cli(['--input', path.join(ROOT, '反例', '03-shared-mesh-two-instances.glb'),
    '--out', dir2, '--name', 'a1', '--overwrite']);
  ok('E6 第二份写入失败应退出 4', r6b.code === 4, 'exit=' + r6b.code + ' ' + r6b.stderr.slice(0, 160));
  ok('E6 JSON 仍是上一批', jsonBefore.equals(fs.readFileSync(path.join(dir2, 'a1.gltf-inspect.json'))));
  ok('E6 issues 仍是上一批', issuesBefore.equals(fs.readFileSync(path.join(dir2, 'a1.issues.json'))));

  // E7 显式覆盖成功替换
  fs.rmdirSync(path.join(dir2, 'a1.gltf-inspect.html'));
  const r7 = cli(['--input', path.join(ROOT, '反例', '03-shared-mesh-two-instances.glb'),
    '--out', dir2, '--name', 'a1', '--overwrite']);
  eq('E7 显式覆盖退出 0', r7.code, 0);
  const rep7 = JSON.parse(fs.readFileSync(path.join(dir2, 'a1.gltf-inspect.json'), 'utf8'));
  eq('E7 报告已更新', rep7.geometry.geometryTriangles, 12);
}

// ───────────────────────────────────────────────
console.log('F. Codex 首次验收探针的等价用例（防止回归）');
// ───────────────────────────────────────────────
{
  const FIX = path.join(ROOT, '反例');

  // F1 默认场景 scene=1：只有 node 1 被引用，包围盒应被 translation 推到 [10,0,0]..[11,1,0]
  {
    const f = unpack(path.join(FIX, '01-normal-indexed.glb'));
    f.json.nodes = [{ mesh: 0 }, { mesh: 0, translation: [10, 0, 0] }];
    f.json.scenes = [{ nodes: [] }, { nodes: [1] }];
    f.json.scene = 1;
    const rep = reportOf(pack(f.json, f.bin), 'default-scene-1');
    eq('F1 status', rep.status, 'pass');
    eq('F1 三角面', rep.geometry.geometryTriangles, 2);
    eq('F1 实例三角面', rep.geometry.sceneInstancesTriangles, 2);
    const b = rep.bounds.computed || {};
    ok('F1 min=[10,0,0]', JSON.stringify(b.min) === JSON.stringify([10, 0, 0]), JSON.stringify(b.min));
    ok('F1 max=[11,1,0]', JSON.stringify(b.max) === JSON.stringify([11, 1, 0]), JSON.stringify(b.max));
  }

  // F2 索引 99 超过 4 个顶点
  {
    const f = unpack(path.join(FIX, '01-normal-indexed.glb'));
    const bv = f.json.bufferViews[f.json.accessors[1].bufferView];
    f.bin.writeUInt16LE(99, bv.byteOffset || 0);
    const rep = reportOf(pack(f.json, f.bin), 'idx99');
    ok('F2 报 E_INDICES_OUT_OF_RANGE', (rep.issues || []).some(i => i.code === 'E_INDICES_OUT_OF_RANGE'),
      (rep.issues || []).map(i => i.code).join(','));
    eq('F2 status', rep.status, 'error');
  }

  // F3 accessor.count=100000 → 结果必须是结构化错误，不能抛异常
  {
    const f = unpack(path.join(FIX, '01-normal-indexed.glb'));
    f.json.accessors[0].count = 100000;
    let threw = null, rep = null;
    try { rep = reportOf(pack(f.json, f.bin), 'accbig'); } catch (e) { threw = e; }
    ok('F3 未抛异常', threw === null, threw && threw.message);
    if (rep) {
      ok('F3 报 E_ACC_OUT_OF_RANGE', (rep.issues || []).some(i => i.code === 'E_ACC_OUT_OF_RANGE'),
        (rep.issues || []).map(i => i.code).join(','));
      eq('F3 status', rep.status, 'error');
    }
  }

  // F4 循环节点
  {
    const f = unpack(path.join(FIX, '01-normal-indexed.glb'));
    f.json.nodes[0].children = [0];
    const rep = reportOf(pack(f.json, f.bin), 'cycle');
    ok('F4 报 E_NODE_CYCLE', (rep.issues || []).some(i => i.code === 'E_NODE_CYCLE'),
      (rep.issues || []).map(i => i.code).join(','));
    eq('F4 status', rep.status, 'error');
  }

  // F5 稀疏 accessor
  {
    const f = unpack(path.join(FIX, '01-normal-indexed.glb'));
    f.json.accessors[0].sparse = { count: 1, indices: { bufferView: 1, componentType: 5123 }, values: { bufferView: 0 } };
    const rep = reportOf(pack(f.json, f.bin), 'sparse');
    eq('F5 status', rep.status, 'unsupported');
    ok('F5 报 E_UNSUPPORTED_FEATURE', (rep.issues || []).some(i => i.code === 'E_UNSUPPORTED_FEATURE'),
      (rep.issues || []).map(i => i.code).join(','));
  }

  // F6 required 扩展
  {
    const f = unpack(path.join(FIX, '01-normal-indexed.glb'));
    f.json.extensionsRequired = ['KHR_mesh_quantization'];
    const rep = reportOf(pack(f.json, f.bin), 'quant');
    eq('F6 status', rep.status, 'unsupported');
    ok('F6 报 E_UNSUPPORTED_EXTENSION', (rep.issues || []).some(i => i.code === 'E_UNSUPPORTED_EXTENSION'),
      (rep.issues || []).map(i => i.code).join(','));
  }

  // F7 非索引 strip 6 顶点 → 4 个三角形
  {
    const f = unpack(path.join(FIX, '02-normal-nonindexed.glb'));
    f.json.meshes[0].primitives[0].mode = 5;
    const rep = reportOf(pack(f.json, f.bin), 'strip');
    eq('F7 status', rep.status, 'pass');
    eq('F7 三角面', rep.geometry.geometryTriangles, 4);
  }

  // F8 合法交错布局：末元素无填充，不得误报越界
  {
    const bin = Buffer.alloc(72);
    const pos = [0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0];
    for (let i = 0; i < 4; i++) for (let d = 0; d < 3; d++) bin.writeFloatLE(pos[i * 3 + d], i * 16 + d * 4);
    [0, 1, 2, 0, 2, 3].forEach((v, i) => bin.writeUInt16LE(v, 60 + i * 2));
    const json = {
      asset: { version: '2.0' },
      buffers: [{ byteLength: 72 }],
      bufferViews: [{ buffer: 0, byteOffset: 0, byteLength: 60, byteStride: 16 }, { buffer: 0, byteOffset: 60, byteLength: 12 }],
      accessors: [
        { bufferView: 0, byteOffset: 0, componentType: 5126, count: 4, type: 'VEC3', min: [0, 0, 0], max: [1, 1, 0] },
        { bufferView: 1, componentType: 5123, count: 6, type: 'SCALAR' }
      ],
      meshes: [{ primitives: [{ attributes: { POSITION: 0 }, indices: 1, mode: 4 }] }],
      nodes: [{ mesh: 0 }],
      scenes: [{ nodes: [0] }]
    };
    const rep = reportOf(pack(json, bin), 'interleaved');
    eq('F8 status', rep.status, 'pass');
    ok('F8 不报越界', !(rep.issues || []).some(i => i.code === 'E_ACC_OUT_OF_RANGE'),
      (rep.issues || []).map(i => i.code).join(','));
    eq('F8 三角面', rep.geometry.geometryTriangles, 2);
  }
}

// ───────────────────────────────────────────────
console.log('G. Codex 第三次验收的 5 个反例 + 合法对照');
// ───────────────────────────────────────────────
{
  const FIX = path.join(ROOT, '反例');

  // G1–G5：原样使用 Codex 交付的 5 个文件，断言"具体错误码"而不只是"报了个错"
  const CODEX_CASES = [
    ['codex-hidden-cycle', 'E_NODE_CYCLE', '非默认场景里的环'],
    ['codex-multi-parent', 'E_NODE_MULTI_PARENT', '同一子节点被两个父引用'],
    ['codex-short-buffer', 'E_BV_EXCEEDS_BUFFER', 'bufferView 越过逻辑 buffer 长度'],
    ['codex-world-overflow', 'E_WORLD_MATRIX_NON_FINITE', '父子 scale 相乘溢出'],
    ['codex-bad-texture-ref', 'E_TEXINFO_OUT_OF_RANGE', '材质纹理索引越界']
  ];
  for (const [name, code, why] of CODEX_CASES) {
    const file = path.join(FIX, name + '.glb');
    if (!fs.existsSync(file)) { ok('G ' + name + ' 文件存在', false, file); continue; }
    const rep = reportOf(fs.readFileSync(file), name);
    const codes = (rep.issues || []).map(i => i.code);
    eq('G ' + name + ' status', rep.status, 'error');
    ok('G ' + name + ' 命中 ' + code + '（' + why + '）', codes.indexOf(code) !== -1, codes.join(','));
    eq('G ' + name + ' fatal', rep.fatal, true);
    eq('G ' + name + ' bounds.computed=null', rep.bounds.computed, null);
    eq('G ' + name + ' geometry.unknown', rep.geometry.unknown, true);
    const r = cli(['--input', file, '--out', path.join(TMP, 'g'), '--name', name, '--overwrite']);
    ok('G ' + name + ' CLI 退出非 0', r.code !== 0, 'exit=' + r.code);
  }

  // G6 同一个 node 作为两个 scene 的根 —— 合法，不是多父
  {
    const buf = triangleGLB((json) => {
      json.scenes = [{ nodes: [0] }, { nodes: [0] }];
    });
    const rep = reportOf(buf, 'multi-scene-shared-root');
    const codes = (rep.issues || []).map(i => i.code);
    eq('G6 跨场景复用同一根节点 status', rep.status, 'pass');
    ok('G6 不报多父', codes.indexOf('E_NODE_MULTI_PARENT') === -1, codes.join(','));
    eq('G6 默认场景三角面', rep.geometry.sceneInstancesTriangles, 1);
  }

  // G7 负缩放：合法，包围盒镜像到 [-1,0]
  {
    const buf = triangleGLB((json) => { json.nodes[0].scale = [-1, 1, 1]; });
    const rep = reportOf(buf, 'negative-scale');
    eq('G7 status', rep.status, 'pass');
    const b = rep.bounds.computed || {};
    close('G7 min.x', b.min && b.min[0], -1);
    close('G7 max.x', b.max && b.max[0], 0);
    close('G7 max.y', b.max && b.max[1], 1);
  }

  // G8 父旋转 + 子非均匀缩放：世界矩阵有限，包围盒按真实顶点算
  {
    const buf = triangleGLB((json) => {
      json.nodes = [{ children: [1], rotation: [0, 0, Math.sin(Math.PI / 8), Math.cos(Math.PI / 8)] }, { mesh: 0, scale: [2, 1, 1] }];
      json.scenes = [{ nodes: [0] }];
    });
    const rep = reportOf(buf, 'parent-rot-child-scale');
    eq('G8 status', rep.status, 'pass');
    const b = rep.bounds.computed || {};
    const r2 = Math.SQRT2;
    close('G8 min.x', b.min && b.min[0], -r2 / 2);
    close('G8 max.x', b.max && b.max[0], r2);
    close('G8 max.y', b.max && b.max[1], r2);
    close('G8 min.y', b.min && b.min[1], 0);
  }

  // G9 两个不同 node 引用同一个 mesh —— 合法实例化，必须放行
  {
    const buf = triangleGLB((json) => {
      json.nodes = [{ mesh: 0 }, { mesh: 0, translation: [5, 0, 0] }];
      json.scenes = [{ nodes: [0, 1] }];
    });
    const rep = reportOf(buf, 'two-nodes-same-mesh');
    eq('G9 status', rep.status, 'pass');
    eq('G9 实例三角面', rep.geometry.sceneInstancesTriangles, 2);
    eq('G9 几何三角面', rep.geometry.geometryTriangles, 1);
    const b = rep.bounds.computed || {};
    close('G9 min.x', b.min && b.min[0], 0);
    close('G9 max.x', b.max && b.max[0], 6);
  }

  // G10 深链超过 nodeDepth：结构上必须拒，且不能把调用栈打爆
  {
    const depth = 40;
    const nodes = [];
    for (let i = 0; i < depth; i++) nodes.push(i < depth - 1 ? { children: [i + 1] } : { mesh: 0 });
    let threw = null, rep = null;
    try {
      rep = reportOf(triangleGLB((json) => {
        json.nodes = nodes;
        json.scenes = [{ nodes: [0] }];
      }), 'deep-chain');
    } catch (e) { threw = e; }
    ok('G10 未抛异常（显式栈）', threw === null, threw && threw.message);
    if (rep) {
      eq('G10 status', rep.status, 'error');
      ok('G10 报 E_NODE_DEPTH', (rep.issues || []).some(i => i.code === 'E_NODE_DEPTH'),
        (rep.issues || []).map(i => i.code).join(','));
    }
  }
}

// ───────────────────────────────────────────────
console.log('H. vendor verify 只读：改动必须报错，且不得重写清单');
// ───────────────────────────────────────────────
{
  const CASE = path.join(TMP, 'vendor-case');
  const SRC_SCRIPT = path.join(ROOT, 'scripts', 'sync-vendor.cjs');
  const SRC_VENDOR = path.join(ROOT, '预览', 'vendor');

  // 注意：本机 Node 22.22.2 的 fs.cpSync 在目标路径含中文时会直接崩溃
  // （0xC0000409 / STATUS_STACK_BUFFER_OVERRUN），所以这里手写递归拷贝。
  function copyTree(src, dst) {
    fs.mkdirSync(dst, { recursive: true });
    for (const name of fs.readdirSync(src)) {
      const s = path.join(src, name), d = path.join(dst, name);
      const st = fs.lstatSync(s);
      if (st.isDirectory()) copyTree(s, d);
      else if (st.isFile()) fs.copyFileSync(s, d);
    }
  }

  function buildCase() {
    fs.rmSync(CASE, { recursive: true, force: true });
    fs.mkdirSync(path.join(CASE, 'scripts'), { recursive: true });
    copyTree(SRC_VENDOR, path.join(CASE, '预览', 'vendor'));
    fs.copyFileSync(SRC_SCRIPT, path.join(CASE, 'scripts', 'sync-vendor.cjs'));
  }
  function runVerify() {
    const r = spawnSync(process.execPath, [path.join(CASE, 'scripts', 'sync-vendor.cjs'), '--verify'],
      { encoding: 'utf8', timeout: 20000, windowsHide: true });
    let parsed = null;
    try { parsed = JSON.parse(r.stdout); } catch (_) { /* 保留 null */ }
    return { code: r.status, stdout: r.stdout || '', json: parsed };
  }
  const manifestPath = () => path.join(CASE, '预览', 'vendor', 'MANIFEST.json');
  const roomEnvPath = () => path.join(CASE, '预览', 'vendor', 'jsm', 'environments', 'RoomEnvironment.js');

  buildCase();
  const h0 = runVerify();
  eq('H1 干净副本 verify 退出 0', h0.code, 0);
  ok('H1 verify 报告 ok', h0.json && h0.json.ok === true, h0.stdout.slice(0, 200));
  const manifestBytes0 = fs.readFileSync(manifestPath());

  // H2 改动一个 vendor 文件 → 必须非 0，且清单字节不变（旧版会在这里把新哈希写回去）
  fs.appendFileSync(roomEnvPath(), '\n// tampered by test\n');
  const h2 = runVerify();
  ok('H2 文件被改 → 退出非 0', h2.code !== 0, 'exit=' + h2.code);
  ok('H2 报告 hash_mismatch', !!(h2.json && (h2.json.problems || []).some(p => p.kind === 'hash_mismatch')),
    h2.json ? JSON.stringify(h2.json.problems) : h2.stdout.slice(0, 200));
  ok('H2 清单字节未被改写', manifestBytes0.equals(fs.readFileSync(manifestPath())));

  // H3 还原后恢复通过
  buildCase();
  const h3 = runVerify();
  eq('H3 还原后 verify 退出 0', h3.code, 0);

  // H4 只改清单（把某条哈希改掉）→ 必须非 0，且清单不会被"修正"
  const man = JSON.parse(fs.readFileSync(manifestPath(), 'utf8'));
  man.files[0].sha256 = '0'.repeat(64);
  fs.writeFileSync(manifestPath(), JSON.stringify(man, null, 2) + '\n');
  const tamperedManifest = fs.readFileSync(manifestPath());
  const h4 = runVerify();
  ok('H4 清单被改 → 退出非 0', h4.code !== 0, 'exit=' + h4.code);
  ok('H4 报告 hash_mismatch', !!(h4.json && (h4.json.problems || []).some(p => p.kind === 'hash_mismatch')),
    h4.json ? JSON.stringify(h4.json.problems) : h4.stdout.slice(0, 200));
  ok('H4 清单未被自动修复', tamperedManifest.equals(fs.readFileSync(manifestPath())));

  // H5 缺文件 → 非 0
  buildCase();
  fs.unlinkSync(roomEnvPath());
  const h5 = runVerify();
  ok('H5 缺文件 → 退出非 0', h5.code !== 0, 'exit=' + h5.code);
  ok('H5 报告 file_missing', !!(h5.json && (h5.json.problems || []).some(p => p.kind === 'file_missing')),
    h5.json ? JSON.stringify(h5.json.problems) : h5.stdout.slice(0, 200));

  // H6 正式交付树的清单本身必须自洽
  const h6 = spawnSync(process.execPath, [SRC_SCRIPT, '--verify'], { encoding: 'utf8', timeout: 20000, windowsHide: true });
  eq('H6 正式 vendor 清单校验通过', h6.status, 0);
}

// ───────────────────────────────────────────────
console.log('I. 世界坐标、中心与范围溢出的独立回归');
{
  const cases = [
    ['codex-position-overflow', 'E_WORLD_POSITION_NON_FINITE', (json, bin) => {
      json.nodes[0].scale = [1e300, 1, 1];
      bin.writeFloatLE(3e38, 12);
    }],
    ['codex-bounds-center-overflow', 'E_WORLD_BOUNDS_NON_FINITE', (json) => {
      json.nodes[0].translation = [1e308, 0, 0];
    }],
    ['codex-bounds-size-overflow', 'E_WORLD_BOUNDS_NON_FINITE', (json, bin) => {
      json.nodes[0].scale = [1e308, 1, 1];
      bin.writeFloatLE(-1, 0);
      json.accessors[0].min = [-1, 0, 0];
    }]
  ];
  for (const [name, code, mutate] of cases) {
    const buf = triangleGLB(mutate);
    const rep = reportOf(buf, name);
    eq('I ' + name + ' status', rep.status, 'error');
    eq('I ' + name + ' fatal', rep.fatal, true);
    ok('I ' + name + ' 问题代码', rep.issues.some(i => i.code === code));
    assertUnavailable('I ' + name, rep);
    const file = path.join(TMP, name + '.glb');
    fs.writeFileSync(file, buf);
    const result = cli(['--input', file, '--out', path.join(TMP, 'numeric-boundaries'), '--name', name]);
    eq('I ' + name + ' CLI exit', result.code, 2);
  }
}

console.log('');
console.log('────────────────────────────────────────');
if (failures.length === 0) {
  console.log(`全部通过：${pass} 项断言`);
  process.exit(0);
} else {
  console.log(`失败 ${failures.length} 项 / 通过 ${pass} 项`);
  for (const f of failures) console.log('  ✗ ' + f.name + (f.detail ? '  ← ' + f.detail : ''));
  process.exit(1);
}
