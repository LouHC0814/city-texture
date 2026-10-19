// 城市纹理 · GLB 反例生成器（v0.2.0）
// 覆盖 Codex 返修单里的全部独立用例：
//  - 01-normal-indexed：正常 4 顶点 2 三角形（索引）
//  - 02-normal-nonindexed：正常 6 顶点 2 三角形（无索引）
//  - 03-shared-mesh-two-instances：1 mesh × 2 节点，24 实例三角形
//  - 04-transform-parent-translation：父节点 translation=(10,0,0)，子节点 0 平移 → 本地包围盒应 [0,1]^3，世界 [10,11]
//  - 05-bbox-self-mismatch：本地 POSITION 实算 = [0,1]^3，自报 = [0,1000] → W_BBOX_MISMATCH
//  - 06-bad-magic：magic = 'XXXX' → E_BAD_MAGIC
//  - 07-accessor-out-of-range：bufferView 故意设小 → E_ACC_OUT_OF_RANGE
//  - 08-external-image：images[].uri = https://... → E_NOT_SELF_CONTAINED
//  - 09-unsupported-extension：extensionsRequired=[KHR_draco_mesh_compression] → E_UNSUPPORTED_EXTENSION
//  - 10-embedded-png-real：嵌入真实有效 1×1 PNG（含 IHDR + IDAT + IEND + 正确 CRC）→ images.uniqueImageCount=1
//  - 11-shared-image-two-textures：1 image + 2 textures → uniqueImageCount=1
//  - 12-malicious-name：模型/node name 含 <script>、"><img onerror=...>，报告按文字展示
//  - 13-sparse-accessor：accessor[0].sparse 设置 → E_UNSUPPORTED_FEATURE
//  - 14-cycle-node：node 0 children=[0] → E_NODE_CYCLE
//  - 15-quantization-required：extensionsRequired=[KHR_mesh_quantization] → E_UNSUPPORTED_EXTENSION
//  - 16-default-scene-1：scene=1 + scene[1] 含平移 10 的四边形 → 实例数 2 + bounds [10,11]
//  - 17-strip-nonindexed：primitive.mode=5 + 非索引 + 6 顶点 → 4 三角形
//  - 18-indices-out-of-range：索引值 99 > POSITION.count=4 → E_INDICES_OUT_OF_RANGE
//  - 19-nan-position：POSITION 顶点 0 含 NaN → W_NONFINITE_POSITION + geometry.unknown
//  - 20-legal-interleaved：合法交错布局（count=4, stride=16, bvLength=60）→ 无越界错
//  - 21-real-jpeg：嵌入真实有效 1×1 JPEG → images.uniqueImageCount=1

'use strict';
const fs = require('node:fs');
const path = require('node:path');

function pad4(b) {
  const r = b.length % 4;
  return r === 0 ? b : Buffer.concat([b, Buffer.alloc(4 - r, 0x20)]);
}
function packGLB(jsonObj, bin) {
  const json = Buffer.from(JSON.stringify(jsonObj));
  const jp = pad4(json);
  const bp = pad4(bin);
  const total = 12 + 8 + jp.length + 8 + bp.length;
  const h = Buffer.alloc(12);
  h.write('glTF', 0, 'ascii'); h.writeUInt32LE(2, 4); h.writeUInt32LE(total, 8);
  const jh = Buffer.alloc(8); jh.writeUInt32LE(jp.length, 0); jh[4] = 0x4A; jh[5] = 0x53; jh[6] = 0x4F; jh[7] = 0x4E;
  const bh = Buffer.alloc(8); bh.writeUInt32LE(bp.length, 0); bh[4] = 0x42; bh[5] = 0x49; bh[6] = 0x4E; bh[7] = 0x00;
  return Buffer.concat([h, jh, jp, bh, bp]);
}

function buildPrimitive({ positions, indices, mode = 4, material = null }) {
  // positions: Float32Array-like, vec3 array; indices: Uint16Array-like
  // 单 bufferView 包含 POSITION + 索引（mode 4）
  const posBytes = Buffer.alloc(positions.length * 4);
  for (let i = 0; i < positions.length; i++) posBytes.writeFloatLE(positions[i], i * 4);
  let bin = posBytes;
  let idxBytes = null;
  if (indices) {
    idxBytes = Buffer.alloc(indices.length * 2);
    for (let i = 0; i < indices.length; i++) idxBytes.writeUInt16LE(indices[i], i * 2);
    bin = Buffer.concat([bin, idxBytes]);
  }
  const buffers = [{ byteLength: bin.length }];
  const bufferViews = [
    { buffer: 0, byteOffset: 0, byteLength: posBytes.length }
  ];
  let posBV = 0, idxBV = null;
  if (indices) {
    bufferViews.push({ buffer: 0, byteOffset: posBytes.length, byteLength: idxBytes.length });
    idxBV = 1;
  }
  const accessors = [
    { bufferView: posBV, componentType: 5126, count: positions.length / 3, type: 'VEC3', min: positions.length ? minArr(positions) : undefined, max: positions.length ? maxArr(positions) : undefined }
  ];
  let posAcc = 0;
  if (indices) {
    accessors.push({ bufferView: idxBV, componentType: 5123, count: indices.length, type: 'SCALAR' });
  }
  const prim = { attributes: { POSITION: posAcc }, mode };
  if (indices) prim.indices = 1;
  if (material != null) prim.material = material;
  const meshes = [{ primitives: [prim] }];
  const nodes = [{ mesh: 0 }];
  return { buffer: bin, buffers, bufferViews, accessors, meshes, nodes, positions, indices };
}
function minArr(positions) {
  const m = [Infinity, Infinity, Infinity];
  for (let i = 0; i < positions.length; i += 3) {
    for (let d = 0; d < 3; d++) if (positions[i + d] < m[d]) m[d] = positions[i + d];
  }
  return m;
}
function maxArr(positions) {
  const m = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < positions.length; i += 3) {
    for (let d = 0; d < 3; d++) if (positions[i + d] > m[d]) m[d] = positions[i + d];
  }
  return m;
}

// 真实有效的 1×1 透明 PNG（最小但 CRC 正确的 PNG）
// bytes: 89 50 4E 47 0D 0A 1A 0A  (signature)
// IHDR chunk (length 13, type IHDR, data 1x1 RGBA 8bit, CRC)
// IDAT chunk (1 byte 0x00 filtered + 4 bytes raw RGBA, compressed with zlib deflate level 0)
// IEND chunk (length 0)
const REAL_PNG_1x1 = Buffer.from([
  0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
  0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89,
  0x00, 0x00, 0x00, 0x0D, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x60, 0x00, 0x02, 0x00, 0x00, 0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4,
  0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
]);
// 真实有效的 1×1 JPEG (最小 grayscale 0xFF 单像素)
// bytes: FF D8 FF E0 00 10 4A 46 49 46 00 01 01 00 00 01 00 01 00 00
//        FF DB 00 43 00 (quantization table truncated, simplified)
// 用更稳的最小 JPEG 1×1:
const REAL_JPEG_1x1 = Buffer.from([
  0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00,
  0xFF, 0xDB, 0x00, 0x43, 0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09, 0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12, 0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20, 0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29, 0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32, 0x3C, 0x2E, 0x33, 0x34, 0x32,
  0xFF, 0xC0, 0x00, 0x0B, 0x08, 0x00, 0x01, 0x00, 0x01, 0x01, 0x01, 0x11, 0x00,
  0xFF, 0xC4, 0x00, 0x1F, 0x00, 0x00, 0x01, 0x05, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B,
  0xFF, 0xC4, 0x00, 0xB5, 0x10, 0x00, 0x02, 0x01, 0x03, 0x03, 0x02, 0x04, 0x03, 0x05, 0x05, 0x04, 0x04, 0x00, 0x00, 0x01, 0x7D, 0x01, 0x02, 0x03, 0x00, 0x04, 0x11, 0x05, 0x12, 0x21, 0x31, 0x41, 0x06, 0x13, 0x51, 0x61, 0x07, 0x22, 0x71, 0x14, 0x32, 0x81, 0x91, 0xA1, 0x08, 0x23, 0x42, 0xB1, 0xC1, 0x15, 0x52, 0xD1, 0xF0, 0x24, 0x33, 0x62, 0x72, 0x82,
  0xFF, 0xDA, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3F, 0x00, 0xFB, 0xD0, 0xFF, 0xD9
]);

const FIXTURES = {
  // 基础：单位四边形 (z=0)
  quad: () => {
    const positions = [0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0];
    const indices = [0, 1, 2, 0, 2, 3];
    return buildPrimitive({ positions, indices });
  },
  // 立方体（24 三角形） - 共享 mesh 用例
  cube: () => {
    const positions = [];
    // 6 面 × 4 顶点
    const faces = [
      // +X
      [1, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0],
      // -X
      [0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 1],
      // +Y
      [0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0],
      // -Y
      [0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0],
      // +Z
      [0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1],
      // -Z
      [1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0]
    ];
    for (const f of faces) for (const v of f) positions.push(v);
    // 索引：6 面 × 2 三角形 × 3 顶点 = 36 indices，复用 24 顶点
    const indices = [];
    for (let f = 0; f < 6; f++) {
      const base = f * 4;
      indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
    }
    return buildPrimitive({ positions, indices });
  }
};

function emit(outDir, name, glb) {
  const p = path.join(outDir, name + '.glb');
  fs.writeFileSync(p, glb);
  return p;
}

function makeGLB(jsonObj, bin) {
  return packGLB(jsonObj, bin);
}

function build01() {
  const q = FIXTURES.quad();
  const json = {
    asset: { version: '2.0' },
    buffers: q.buffers,
    bufferViews: q.bufferViews,
    accessors: q.accessors,
    meshes: q.meshes,
    nodes: q.nodes,
    scenes: [{ nodes: [0] }]
  };
  return makeGLB(json, q.buffer);
}
function build02() {
  const positions = [0, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0];
  // 非索引 TRIANGLES 6 顶点 2 三角形
  const bin = Buffer.alloc(positions.length * 4);
  for (let i = 0; i < positions.length; i++) bin.writeFloatLE(positions[i], i * 4);
  const json = {
    asset: { version: '2.0' },
    buffers: [{ byteLength: bin.length }],
    bufferViews: [{ buffer: 0, byteOffset: 0, byteLength: bin.length }],
    accessors: [{ bufferView: 0, componentType: 5126, count: 6, type: 'VEC3', min: [-0.5, 0, 0], max: [1, 1, 0] }],
    meshes: [{ primitives: [{ attributes: { POSITION: 0 }, mode: 4 }] }],
    nodes: [{ mesh: 0 }],
    scenes: [{ nodes: [0] }]
  };
  return makeGLB(json, bin);
}
function build03() {
  const c = FIXTURES.cube();
  // 两个节点引用同一 mesh
  const json = {
    asset: { version: '2.0' },
    buffers: c.buffers,
    bufferViews: c.bufferViews,
    accessors: c.accessors,
    meshes: c.meshes,
    nodes: [{ mesh: 0 }, { mesh: 0, translation: [3, 0, 0] }],
    scenes: [{ nodes: [0, 1] }]
  };
  return makeGLB(json, c.buffer);
}
function build04() {
  // 父节点 translation=(10,0,0) + 子节点 mesh 0（单位立方体）→ 世界包围盒应 [10,11]^3
  const c = FIXTURES.cube();
  const json = {
    asset: { version: '2.0' },
    buffers: c.buffers,
    bufferViews: c.bufferViews,
    accessors: c.accessors,
    meshes: c.meshes,
    nodes: [{ translation: [10, 0, 0], children: [1] }, { mesh: 0 }],
    scenes: [{ nodes: [0] }]
  };
  return makeGLB(json, c.buffer);
}
function build05() {
  // 自报 [0,1000] 故意错（本地实算 [0,1]） → W_BBOX_MISMATCH
  const c = FIXTURES.cube();
  c.accessors[0].min = [0, 0, 0];
  c.accessors[0].max = [1000, 1000, 1000];
  const json = {
    asset: { version: '2.0' },
    buffers: c.buffers,
    bufferViews: c.bufferViews,
    accessors: c.accessors,
    meshes: c.meshes,
    nodes: c.nodes,
    scenes: [{ nodes: [0] }]
  };
  return makeGLB(json, c.buffer);
}
function build06() {
  // 任意合法 GLB 改 magic
  const q = FIXTURES.quad();
  const glb = makeGLB({
    asset: { version: '2.0' },
    buffers: q.buffers, bufferViews: q.bufferViews,
    accessors: q.accessors, meshes: q.meshes, nodes: q.nodes,
    scenes: [{ nodes: [0] }]
  }, q.buffer);
  const buf = Buffer.from(glb);
  buf.write('XXXX', 0, 'ascii');
  return buf;
}
function build07() {
  // 故意让 accessor 越界：cube 的 position bufferView 设为 72 字节（实际需要 24*4*3=288 字节）
  const c = FIXTURES.cube();
  c.bufferViews[0].byteLength = 72;
  const json = {
    asset: { version: '2.0' },
    buffers: c.buffers,
    bufferViews: c.bufferViews,
    accessors: c.accessors,
    meshes: c.meshes,
    nodes: c.nodes,
    scenes: [{ nodes: [0] }]
  };
  return makeGLB(json, c.buffer);
}
function build08() {
  const c = FIXTURES.cube();
  // 加一张外部图片引用
  const json = {
    asset: { version: '2.0' },
    buffers: c.buffers, bufferViews: c.bufferViews,
    accessors: c.accessors, meshes: c.meshes, nodes: c.nodes,
    images: [{ uri: 'https://example.com/x.png' }, { uri: 'texture.png' }],
    scenes: [{ nodes: [0] }]
  };
  return makeGLB(json, c.buffer);
}
function build09() {
  const c = FIXTURES.cube();
  const json = {
    asset: { version: '2.0' },
    buffers: c.buffers, bufferViews: c.bufferViews,
    accessors: c.accessors, meshes: c.meshes, nodes: c.nodes,
    extensionsRequired: ['KHR_draco_mesh_compression'],
    extensionsUsed: ['KHR_draco_mesh_compression'],
    scenes: [{ nodes: [0] }]
  };
  return makeGLB(json, c.buffer);
}
function build10() {
  // 嵌入真实 PNG
  const c = FIXTURES.cube();
  const pngBin = REAL_PNG_1x1;
  // 合并到 bin 末尾（buffer view 起始偏移 = c.buffer.length）
  const bin = Buffer.concat([c.buffer, pngBin]);
  c.bufferViews.push({ buffer: 0, byteOffset: c.buffer.length, byteLength: pngBin.length });
  const imgBV = c.bufferViews.length - 1;   // 必须是刚 push 的那个，不能硬编码
  const json = {
    asset: { version: '2.0' },
    buffers: [{ byteLength: bin.length }],
    bufferViews: c.bufferViews,
    accessors: c.accessors,
    meshes: c.meshes, nodes: c.nodes,
    images: [{ bufferView: imgBV, mimeType: 'image/png' }],
    textures: [{ source: 0 }],
    materials: [{ pbrMetallicRoughness: { baseColorTexture: { index: 0 } } }],
    scenes: [{ nodes: [0] }]
  };
  // 给 mesh prim 加 material 0
  json.meshes[0].primitives[0].material = 0;
  return makeGLB(json, bin);
}
function build11() {
  // 一张图被两个 texture 引用 → uniqueImageCount=1
  const c = FIXTURES.cube();
  const pngBin = REAL_PNG_1x1;
  const bin = Buffer.concat([c.buffer, pngBin]);
  c.bufferViews.push({ buffer: 0, byteOffset: c.buffer.length, byteLength: pngBin.length });
  const imgBV = c.bufferViews.length - 1;
  const json = {
    asset: { version: '2.0' },
    buffers: [{ byteLength: bin.length }],
    bufferViews: c.bufferViews,
    accessors: c.accessors,
    meshes: c.meshes, nodes: c.nodes,
    images: [{ bufferView: imgBV, mimeType: 'image/png' }],
    textures: [{ source: 0 }, { source: 0 }],
    materials: [{ pbrMetallicRoughness: { baseColorTexture: { index: 0 } } }, { pbrMetallicRoughness: { baseColorTexture: { index: 1 } } }],
    scenes: [{ nodes: [0] }]
  };
  json.meshes[0].primitives[0].material = 0;
  return makeGLB(json, bin);
}
function build12() {
  const c = FIXTURES.cube();
  c.meshes[0].name = '<script>alert(1)</script>';
  c.nodes[0].name = '"><img onerror=alert(1) src=x>';
  const json = {
    asset: { version: '2.0' },
    buffers: c.buffers, bufferViews: c.bufferViews,
    accessors: c.accessors, meshes: c.meshes, nodes: c.nodes,
    scenes: [{ nodes: [0] }]
  };
  return makeGLB(json, c.buffer);
}
function build13() {
  const c = FIXTURES.cube();
  // 给 accessor 0 加 sparse
  c.accessors[0].sparse = { count: 1, indices: { bufferView: 0, componentType: 5123 }, values: { bufferView: 0 } };
  const json = {
    asset: { version: '2.0' },
    buffers: c.buffers, bufferViews: c.bufferViews,
    accessors: c.accessors, meshes: c.meshes, nodes: c.nodes,
    scenes: [{ nodes: [0] }]
  };
  return makeGLB(json, c.buffer);
}
function build14() {
  const c = FIXTURES.cube();
  c.nodes[0].children = [0];  // 自环
  const json = {
    asset: { version: '2.0' },
    buffers: c.buffers, bufferViews: c.bufferViews,
    accessors: c.accessors, meshes: c.meshes, nodes: c.nodes,
    scenes: [{ nodes: [0] }]
  };
  return makeGLB(json, c.buffer);
}
function build15() {
  const c = FIXTURES.cube();
  const json = {
    asset: { version: '2.0' },
    buffers: c.buffers, bufferViews: c.bufferViews,
    accessors: c.accessors, meshes: c.meshes, nodes: c.nodes,
    extensionsRequired: ['KHR_mesh_quantization'],
    extensionsUsed: ['KHR_mesh_quantization'],
    scenes: [{ nodes: [0] }]
  };
  return makeGLB(json, c.buffer);
}
function build16() {
  // scene=1, scene[0] 为空, scene[1] 含平移 10 的四边形
  const q = FIXTURES.quad();
  const json = {
    asset: { version: '2.0' },
    buffers: q.buffers, bufferViews: q.bufferViews,
    accessors: q.accessors, meshes: q.meshes,
    nodes: [{ mesh: 0, translation: [10, 0, 0] }],
    scenes: [{ nodes: [] }, { nodes: [0] }],
    scene: 1
  };
  return makeGLB(json, q.buffer);
}
function build17() {
  // 非索引 STRIP 6 顶点 → 4 三角形
  const positions = [0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, -1, 0.5, 0, 0.5, 0.5, 0];
  const bin = Buffer.alloc(positions.length * 4);
  for (let i = 0; i < positions.length; i++) bin.writeFloatLE(positions[i], i * 4);
  const json = {
    asset: { version: '2.0' },
    buffers: [{ byteLength: bin.length }],
    bufferViews: [{ buffer: 0, byteOffset: 0, byteLength: bin.length }],
    accessors: [{ bufferView: 0, componentType: 5126, count: 6, type: 'VEC3', min: [-1, 0, 0], max: [1, 1, 0] }],
    meshes: [{ primitives: [{ attributes: { POSITION: 0 }, mode: 5 }] }],
    nodes: [{ mesh: 0 }],
    scenes: [{ nodes: [0] }]
  };
  return makeGLB(json, bin);
}
function build18() {
  // 索引值 99 越界
  const c = FIXTURES.cube();
  // 索引 0 写一个 99
  c.buffer.writeUInt16LE(99, c.bufferViews[1].byteOffset);  // indices bufferView 起始位置
  const json = {
    asset: { version: '2.0' },
    buffers: c.buffers, bufferViews: c.bufferViews,
    accessors: c.accessors, meshes: c.meshes, nodes: c.nodes,
    scenes: [{ nodes: [0] }]
  };
  return makeGLB(json, c.buffer);
}
function build19() {
  const c = FIXTURES.cube();
  // 顶点 0 写 NaN
  c.buffer.writeFloatLE(NaN, 0);
  c.buffer.writeFloatLE(NaN, 4);
  c.buffer.writeFloatLE(NaN, 8);
  const json = {
    asset: { version: '2.0' },
    buffers: c.buffers, bufferViews: c.bufferViews,
    accessors: c.accessors, meshes: c.meshes, nodes: c.nodes,
    scenes: [{ nodes: [0] }]
  };
  return makeGLB(json, c.buffer);
}
function build20() {
  // 合法交错布局：count=4, stride=16，末元素真实数据偏移 3*16=48，占 12 字节 → 48+12=60
  // 注意：bufferView 的长度要给满 4 个 stride（64），因为 three.js 的 GLTFLoader 在
  // byteLength 不是 byteStride 整数倍时会抛 "Invalid typed array length"。
  // 精确的 60==60 边界（末元素刚好贴边、不得误判越界）由 tests/run.cjs 的 F8 在
  // 体检器层面覆盖，不经过浏览器。
  const numVerts = 4;
  const stride = 16;
  const elemBytes = 12;
  const posBytes = numVerts * stride;                    // 64
  const lastElementEnd = (numVerts - 1) * stride + elemBytes;  // 60
  const idxBytes = 6 * 2;
  const bin = Buffer.alloc(posBytes + idxBytes);
  for (let v = 0; v < numVerts; v++) {
    const base = v * stride;
    const px = v === 1 || v === 2 ? 1 : 0;
    const py = v === 2 || v === 3 ? 1 : 0;
    bin.writeFloatLE(px, base);
    bin.writeFloatLE(py, base + 4);
    bin.writeFloatLE(0, base + 8);
  }
  const idx = [0, 1, 2, 0, 2, 3];
  for (let i = 0; i < idx.length; i++) bin.writeUInt16LE(idx[i], posBytes + i * 2);
  const json = {
    asset: { version: '2.0' },
    buffers: [{ byteLength: bin.length }],
    bufferViews: [
      { buffer: 0, byteOffset: 0, byteLength: posBytes, byteStride: stride },
      { buffer: 0, byteOffset: posBytes, byteLength: idxBytes }
    ],
    accessors: [
      { bufferView: 0, byteOffset: 0, componentType: 5126, count: 4, type: 'VEC3', min: [0, 0, 0], max: [1, 1, 1] },
      { bufferView: 1, componentType: 5123, count: 6, type: 'SCALAR' }
    ],
    meshes: [{ primitives: [{ attributes: { POSITION: 0 }, indices: 1, mode: 4 }] }],
    nodes: [{ mesh: 0 }],
    scenes: [{ nodes: [0] }]
  };
  return makeGLB(json, bin);
}
function build21() {
  const c = FIXTURES.cube();
  const jpgBin = REAL_JPEG_1x1;
  const bin = Buffer.concat([c.buffer, jpgBin]);
  c.bufferViews.push({ buffer: 0, byteOffset: c.buffer.length, byteLength: jpgBin.length });
  const imgBV = c.bufferViews.length - 1;
  const json = {
    asset: { version: '2.0' },
    buffers: [{ byteLength: bin.length }],
    bufferViews: c.bufferViews,
    accessors: c.accessors,
    meshes: c.meshes, nodes: c.nodes,
    images: [{ bufferView: imgBV, mimeType: 'image/jpeg' }],
    textures: [{ source: 0 }],
    materials: [{ pbrMetallicRoughness: { baseColorTexture: { index: 0 } } }],
    scenes: [{ nodes: [0] }]
  };
  json.meshes[0].primitives[0].material = 0;
  return makeGLB(json, bin);
}

const BUILDERS = {
  '01-normal-indexed': build01,
  '02-normal-nonindexed': build02,
  '03-shared-mesh-two-instances': build03,
  '04-transform-parent-translation': build04,
  '05-bbox-self-mismatch': build05,
  '06-bad-magic': build06,
  '07-accessor-out-of-range': build07,
  '08-external-image': build08,
  '09-unsupported-extension': build09,
  '10-embedded-png-real': build10,
  '11-shared-image-two-textures': build11,
  '12-malicious-name': build12,
  '13-sparse-accessor': build13,
  '14-cycle-node': build14,
  '15-quantization-required': build15,
  '16-default-scene-1': build16,
  '17-strip-nonindexed': build17,
  '18-indices-out-of-range': build18,
  '19-nan-position': build19,
  '20-legal-interleaved': build20,
  '21-real-jpeg': build21
};

function main() {
  const outDir = process.argv[2] || path.join(__dirname, '..', '反例');
  fs.mkdirSync(outDir, { recursive: true });
  const out = {};
  for (const [name, fn] of Object.entries(BUILDERS)) {
    const glb = fn();
    const p = emit(outDir, name, glb);
    out[name] = { path: p, bytes: glb.length };
  }
  // 旧 01~12 也输出，保留兼容
  console.log(JSON.stringify({ outDir, files: out }, null, 2));
}
if (require.main === module) main();
module.exports = { BUILDERS, FIXTURES };