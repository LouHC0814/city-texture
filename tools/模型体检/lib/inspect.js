// 城市纹理 · GLB 体检工具（v0.5.0）
//
// 实现方式（据实修正 v0.2.0 的错误表述）：
//   - 本文件**不依赖** @gltf-transform / NodeIO / 任何第三方 GLB 库。
//     GLB 容器解析与结构校验全部在本仓库手写，唯一的共享校验源是 lib/gltf-admission.js
//     （同一份文件也被预览页在浏览器里使用，保证"同样本两端结论一致"）。
//
// 流程（严格三段，前一段不过就不进下一段）：
//   1) admission.check(bytes)  —— 容器 + 结构 + 引用 + 容量 + 不支持特性
//      + 全图节点校验（环/深度/多父）+ 世界矩阵与顶点变换有限性
//      status = pass | error | unsupported；任何 error/unsupported 都是 fatal
//   2) 仅当 pass 才做统计读数：三角面、顶点/索引计数、图片嗅探
//   3) 世界包围盒由准入在数据段逐顶点算出；本文件只取结果并排版
//      （所以不可能出现"准入 pass 但包围盒不可用"的自相矛盾状态）
//
// 输出约定：
//   - status !== 'pass' 时，所有数值指标一律 null / unknown，不输出"半套数字"
//   - 绝不让 TypeError 冒到 CLI：JSON 为 null、字段类型错等都会变成结构化 issue
'use strict';

const crypto = require('node:crypto');
const admission = require('./gltf-admission.js');

const TOOL = 'city-texture.gltf-inspect';
const TOOL_VERSION = '0.5.0';
const REPORT_FORMAT = 'city-texture-gltf-inspection';
const REPORT_VERSION = 5;

const MODE_NAME = {
  0: 'POINTS', 1: 'LINES', 2: 'LINE_LOOP', 3: 'LINE_STRIP',
  4: 'TRIANGLES', 5: 'TRIANGLE_STRIP', 6: 'TRIANGLE_FAN'
};

function issue(code, severity, message, target) {
  return { code, severity, message, target: target || null };
}

function trianglesOf(mode, hasIndices, indexCount, positionCount, issues, target) {
  const n = hasIndices ? indexCount : positionCount;
  if (mode === 4 || mode == null) {
    if (n < 3) {
      issues.push(issue('W_DEGENERATE_TRIANGLES', 'warning', `TRIANGLES 元素数 ${n} < 3`, target));
      return 0;
    }
    return Math.floor(n / 3);
  }
  if (mode === 5 || mode === 6) {
    if (n < 3) {
      issues.push(issue('W_DEGENERATE_TRIANGLES', 'warning', `${MODE_NAME[mode]} 元素数 ${n} < 3`, target));
      return 0;
    }
    return n - 2;
  }
  if (mode === 0 || mode === 1 || mode === 2 || mode === 3) return 0;
  issues.push(issue('W_UNKNOWN_PRIMITIVE_MODE', 'warning', `primitive.mode=${mode} 不计入三角形数`, target));
  return 0;
}

// ── 图片嗅探（只读文件头，不做解码） ──
function parsePng(b) {
  if (b.length < 24) return null;
  const sig = [137, 80, 78, 71, 13, 10, 26, 10];
  for (let i = 0; i < 8; i++) if (b[i] !== sig[i]) return null;
  if (b.toString('ascii', 12, 16) !== 'IHDR') return null;
  const w = b.readUInt32BE(16), h = b.readUInt32BE(20);
  const lim = admission.SUPPORT.limits.textureDimension;
  if (!(w > 0 && h > 0 && w <= lim && h <= lim)) return null;
  return { mime: 'image/png', width: w, height: h };
}
function parseJpeg(b) {
  if (b.length < 4 || b[0] !== 0xFF || b[1] !== 0xD8) return null;
  let off = 2;
  while (off < b.length - 1) {
    if (b[off] !== 0xFF) return null;
    while (off < b.length && b[off] === 0xFF) off++;
    if (off >= b.length) return null;
    const marker = b[off++];
    if (marker >= 0xC0 && marker <= 0xCF && marker !== 0xC4 && marker !== 0xC8 && marker !== 0xCC) {
      if (off + 5 > b.length) return null;
      const h = b.readUInt16BE(off + 3), w = b.readUInt16BE(off + 5);
      const lim = admission.SUPPORT.limits.textureDimension;
      if (!(w > 0 && h > 0 && w <= lim && h <= lim)) return null;
      return { mime: 'image/jpeg', width: w, height: h };
    }
    if (off + 2 > b.length) return null;
    const segLen = b.readUInt16BE(off);
    if (segLen < 2 || off + segLen > b.length) return null;
    off += segLen;
  }
  return null;
}
function detectImage(b) { return parsePng(b) || parseJpeg(b); }

// 世界矩阵 / 包围盒的计算已整体搬进 lib/gltf-admission.js。
// 理由：包围盒属于"准入结论"的一部分——算不出来就必须 error，
// 不能出现"准入 pass 但 bounds 某分量为 null"。本文件只做统计与报告排版。

// ───────────────────────────────────────────────
// 报告骨架
// ───────────────────────────────────────────────
function baseReport(ctx) {
  return {
    format: REPORT_FORMAT,
    formatVersion: REPORT_VERSION,
    run: {
      tool: TOOL,
      toolVersion: TOOL_VERSION,
      startedAt: new Date(ctx.t0).toISOString(),
      finishedAt: new Date().toISOString(),
      durationMs: Date.now() - ctx.t0
    },
    input: {
      name: ctx.name,
      bytes: ctx.bytes.length,
      sha256: ctx.sha256,
      detectedFormat: ctx.isGLB ? 'glb-2.0' : 'not-glb'
    },
    status: ctx.status,
    fatal: ctx.status !== 'pass',
    issues: ctx.issues
  };
}

function unknownGeometry(reasons) {
  return {
    positionRecords: null,
    uniqueGeometries: null,
    geometryTriangles: null,
    sceneInstancesTriangles: null,
    byMode: null,
    meshGeometryTriangles: null,
    meshInstanceCount: null,
    meshPositionCount: null,
    meshIndexCount: null,
    unknown: true,
    unknownReasons: reasons
  };
}

const NULL_BOUNDS = {
  unit: '模型本地坐标（未经归一化）',
  computed: null,
  conservative: null,
  selfReported: null,
  note: '未通过准入，未计算任何包围盒'
};

// ───────────────────────────────────────────────
// 主入口
// ───────────────────────────────────────────────
function inspect(buf, name) {
  const t0 = Date.now();
  const bytes = Buffer.isBuffer(buf)
    ? new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength)
    : new Uint8Array(buf);
  const sha256 = crypto.createHash('sha256')
    .update(Buffer.isBuffer(buf) ? buf : Buffer.from(bytes)).digest('hex');

  const verdict = admission.check(bytes);
  const issues = verdict.issues.slice();
  const status = verdict.status;
  const isGLB = verdict.json != null || verdict.container.magicOk;

  const ctx = { t0, name, bytes, sha256, issues, status, isGLB };

  // ── 准入未通过：直接出报告，不读任何数据 ──
  if (status !== 'pass') {
    const report = baseReport(ctx);
    report.reason = status === 'unsupported'
      ? '命中首版不支持的特性，未读取数据'
      : '结构/容器校验未通过，未读取数据';
    report.container = verdict.container;
    report.structure = verdict.summary ? {
      buffers: verdict.summary.buffers,
      bufferViews: verdict.summary.bufferViews,
      accessors: verdict.summary.accessors,
      meshes: verdict.summary.meshes,
      primitives: verdict.summary.primitives,
      nodes: verdict.summary.nodes,
      textures: verdict.summary.textures,
      scenes: verdict.summary.scenes,
      defaultSceneIndex: verdict.summary.defaultSceneIndex
    } : null;
    report.admission = {
      status,
      support: admission.SUPPORT,
      issueCountBySeverity: countBySeverity(issues)
    };
    report.geometry = unknownGeometry(
      issues.filter(i => i.severity !== 'warning').map(i => i.code).filter((v, i2, a) => a.indexOf(v) === i2)
    );
    report.bounds = NULL_BOUNDS;
    report.materials = null;
    report.images = null;
    report.extensions = {
      used: Array.isArray(verdict.json && verdict.json.extensionsUsed) ? verdict.json.extensionsUsed : [],
      required: Array.isArray(verdict.json && verdict.json.extensionsRequired) ? verdict.json.extensionsRequired : []
    };
    return report;
  }

  // ── 准入通过：开始统计 ──
  const gltf = verdict.json;
  const bin = buf.subarray(verdict.binOffset, verdict.binOffset + verdict.binLength);
  const nodes = Array.isArray(gltf.nodes) ? gltf.nodes : [];
  const meshes = Array.isArray(gltf.meshes) ? gltf.meshes : [];
  const accInfo = verdict.accessors;
  const nodeOrder = verdict.nodeOrder || [];
  // 顶点有限性、索引范围、世界变换有限性都已由准入判过；这里只做计数与排版
  const meshLocalBounds = (verdict.worldBounds && verdict.worldBounds.meshLocal) || [];

  let geometryTriangles = 0;
  let positionRecords = 0;
  const byMode = {};
  const meshGeometryTri = [];
  const meshPositionCount = [];
  const meshIndexCount = [];
  const meshSelfReported = [];

  for (let mi = 0; mi < meshes.length; mi++) {
    const mesh = meshes[mi];
    let mTri = 0, mPos = 0, mIdx = 0;
    const selfRep = { hasSelfReported: false };
    const prims = Array.isArray(mesh.primitives) ? mesh.primitives : [];

    for (let pi = 0; pi < prims.length; pi++) {
      const prim = prims[pi];
      const target = `mesh/${mesh.name || mi}/prim/${pi}`;
      const mode = prim.mode == null ? 4 : prim.mode;
      const posIdx = prim.attributes.POSITION;
      const posInfo = accInfo[posIdx];
      const posCount = posInfo.count;

      let idxCount = 0;
      let hasIndices = false;
      if (prim.indices != null) {
        const idxInfo = accInfo[prim.indices];
        idxCount = idxInfo.count;
        hasIndices = true;
        mIdx += idxCount;
      }
      mPos = Math.max(mPos, posCount);
      positionRecords += posCount;

      const tri = trianglesOf(mode, hasIndices, idxCount, posCount, issues, target);
      mTri += tri;
      const mn = MODE_NAME[mode] || `mode${mode}`;
      byMode[mn] = (byMode[mn] || 0) + tri;

      const acc = gltf.accessors[posIdx];
      if (!selfRep.hasSelfReported && Array.isArray(acc.min) && Array.isArray(acc.max) &&
          acc.min.length === 3 && acc.max.length === 3) {
        selfRep.hasSelfReported = true;
        selfRep.min = acc.min.slice();
        selfRep.max = acc.max.slice();
      }
    }

    meshGeometryTri.push(mTri);
    meshPositionCount.push(mPos);
    meshIndexCount.push(mIdx);
    meshSelfReported.push(selfRep.hasSelfReported ? { min: selfRep.min, max: selfRep.max } : null);
    geometryTriangles += mTri;
  }

  // ── 场景实例计数 ──
  const meshInstanceCount = new Array(meshes.length).fill(0);
  let sceneInstancesTriangles = 0;
  for (const nIdx of nodeOrder) {
    const node = nodes[nIdx];
    if (typeof node.mesh !== 'number') continue;
    const mi = node.mesh;
    if (mi < 0 || mi >= meshes.length) continue;
    sceneInstancesTriangles += meshGeometryTri[mi] || 0;
    meshInstanceCount[mi]++;
  }

  // ── 世界包围盒：由准入逐顶点变换得出（通过准入即保证有限且完整） ──
  const wb = verdict.worldBounds || {};
  const computedBounds = wb.computed ? withCenterSize(wb.computed) : null;
  const conservativeBounds = wb.conservative ? withCenterSize(wb.conservative) : null;

  // 自报 vs 本地实算
  const selfReported = {};
  for (let mi = 0; mi < meshSelfReported.length; mi++) {
    const sr = meshSelfReported[mi];
    if (!sr) continue;
    selfReported[`mesh/${mi}`] = sr;
    const lb = meshLocalBounds[mi];
    if (!lb) continue;
    for (let d = 0; d < 3; d++) {
      const diff = Math.max(Math.abs(sr.min[d] - lb.min[d]), Math.abs(sr.max[d] - lb.max[d]));
      const range = lb.max[d] - lb.min[d];
      if (range > 0 && diff / range > 1e-3) {
        issues.push(issue('W_BBOX_MISMATCH', 'warning',
          `mesh ${mi} POSITION 自报与本地实算不一致（轴 ${d}，相对差 ${(diff / range).toExponential(2)}）`,
          `mesh/${mi}`));
      }
    }
  }

  const report = baseReport(ctx);
  report.container = verdict.container;
  report.admission = { status, support: admission.SUPPORT, issueCountBySeverity: countBySeverity(issues) };
  report.structure = structureOf(verdict, nodeOrder);
  report.geometry = {
    positionRecords,
    uniqueGeometries: meshes.length,
    geometryTriangles,
    sceneInstancesTriangles,
    byMode,
    meshGeometryTriangles: meshGeometryTri,
    meshInstanceCount,
    meshPositionCount,
    meshIndexCount,
    unknown: false,
    unknownReasons: []
  };
  report.bounds = {
    unit: '模型本地坐标（未经归一化）',
    computed: computedBounds,
    conservative: conservativeBounds,
    selfReported,
    note: 'computed 由共享准入在数据段逐顶点变换得出（世界矩阵按父子链合成，任一中间/最终结果非有限即判 error）；conservative 为本地 AABB 8 角点变换后的保守框，仅用于快速剔除'
  };
  report.materials = materialsOf(gltf);
  report.images = imagesOf(gltf, bin, verdict, issues);
  report.extensions = { used: gltf.extensionsUsed || [], required: gltf.extensionsRequired || [] };
  return report;
}

function structureOf(verdict, nodeOrder) {
  const s = verdict.summary || {};
  return {
    buffers: s.buffers ?? null,
    bufferViews: s.bufferViews ?? null,
    accessors: s.accessors ?? null,
    meshes: s.meshes ?? null,
    primitives: s.primitives ?? null,
    nodes: s.nodes ?? null,
    textures: s.textures ?? null,
    scenes: s.scenes ?? null,
    defaultSceneIndex: verdict.defaultSceneIndex,
    nodesInDefaultScene: nodeOrder ? nodeOrder.length : null
  };
}

function materialsOf(gltf) {
  const list = Array.isArray(gltf.materials) ? gltf.materials : [];
  const byType = {};
  for (const m of list) {
    const t = m && m.pbrMetallicRoughness ? 'PBR'
      : (m && m.extensions && m.extensions.KHR_materials_unlit ? 'Unlit' : 'Other');
    byType[t] = (byType[t] || 0) + 1;
  }
  return { count: list.length, byType };
}

function imagesOf(gltf, buf, verdict, issues) {
  const images = Array.isArray(gltf.images) ? gltf.images : [];
  const textures = Array.isArray(gltf.textures) ? gltf.textures : [];
  const refCount = new Map();
  for (const t of textures) {
    if (t && typeof t.source === 'number') refCount.set(t.source, (refCount.get(t.source) || 0) + 1);
  }
  const out = { count: images.length, uniqueImageCount: 0, byMime: {}, list: [] };
  const seen = new Set();

  for (let i = 0; i < images.length; i++) {
    const im = images[i] || {};
    const info = { index: i, mime: 'unknown', width: null, height: null, bytes: null, refCount: refCount.get(i) || 0 };
    let slice = null;

    if (typeof im.uri === 'string' && im.uri.startsWith('data:')) {
      const m = /^data:([^;,]+);base64,(.*)$/.exec(im.uri);
      if (m) {
        try {
          const b = Buffer.from(m[2], 'base64');
          info.bytes = b.length;
          slice = b;
        } catch (_) { /* 忽略非法 base64 */ }
      }
      seen.add(im.uri);
    } else if (typeof im.bufferView === 'number') {
      const bvi = verdict.bufferViews && verdict.bufferViews[im.bufferView];
      if (bvi) {
        slice = buf.subarray(bvi.offset, bvi.offset + bvi.length);
        info.bytes = bvi.length;
      } else {
        // 准入已挡住；这里只记录，不臆测
        info.bytes = null;
      }
    }

    if (slice) {
      const det = detectImage(slice);
      if (det) {
        info.mime = det.mime;
        info.width = det.width;
        info.height = det.height;
        if (typeof im.mimeType === 'string' && im.mimeType !== det.mime) {
          issues.push(issue('W_IMAGE_MIME_MISMATCH', 'warning',
            `image ${i} 声明 mimeType=${im.mimeType}，实际字节为 ${det.mime}`, `image/${i}`));
        }
      } else {
        info.mime = typeof im.mimeType === 'string' ? im.mimeType : 'unknown';
        issues.push(issue('W_IMAGE_UNDECODABLE', 'warning',
          `image ${i} 取到 ${info.bytes} 字节，但无法识别为 PNG/JPEG`, `image/${i}`));
      }
    }
    out.list.push(info);
    out.byMime[info.mime] = (out.byMime[info.mime] || 0) + 1;
  }
  out.uniqueImageCount = seen.size || images.length;
  return out;
}

function withCenterSize(b) {
  const center = [0, 0, 0], size = [0, 0, 0];
  for (let d = 0; d < 3; d++) {
    center[d] = (b.min[d] + b.max[d]) / 2;
    size[d] = b.max[d] - b.min[d];
  }
  return { min: b.min.slice(), max: b.max.slice(), center, size };
}

function countBySeverity(issues) {
  const out = { error: 0, unsupported: 0, warning: 0, info: 0 };
  for (const i of issues) out[i.severity] = (out[i.severity] || 0) + 1;
  return out;
}

module.exports = { inspect, TOOL, TOOL_VERSION, REPORT_FORMAT, REPORT_VERSION, admission };
