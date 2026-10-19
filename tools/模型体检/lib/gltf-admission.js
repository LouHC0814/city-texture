// 城市纹理 · GLB 准入规则（唯一真源）
//
// 这个文件同时被两处使用，必须是"纯"的：不 require 任何 node: 模块，
// 不依赖 Buffer，只用 Uint8Array / DataView / TextDecoder / JSON。
//   - CLI：  lib/inspect.js  require('./gltf-admission.js')
//   - 浏览器：预览/index.html 用 <script src="/lib/gltf-admission.js"> 加载，取 window.GLTFAdmission
//
// 设计要点（对应 Codex 第二次验收 P1-1 / P1-4）：
//   1. 状态只有三档：pass / error / unsupported。任何 error 或 unsupported 都算 fatal。
//      不再维护"哪些 code 致命"的白名单——漏一个就漏一批。
//   2. 校验分两段：容器段（字节）与结构段（JSON + BIN 容量）。两段都过才允许读数据。
//      没过就一律不读 accessor、不遍历节点、不算包围盒。
//   3. 所有"不可信数字"必须显式拒绝：非整数 count、非有限 TRS、越界引用、超容量 bufferView。
//      不允许"记一条 issue 然后继续算出一半数字"。
//   4. 支持范围（SUPPORT）在这里声明一次，CLI 与预览页共用同一份，不允许各写一遍。
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.GLTFAdmission = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // ── 支持范围（唯一声明） ──
  var SUPPORT = {
    container: 'GLB 2.0（magic=glTF, version=2，且总长度字段必须等于实际字节数）',
    selfContained: 'buffer 只能取 GLB 内嵌 BIN chunk；image 只能内嵌 bufferView 或 data: URI',
    geometry: '静态三角网格；POSITION 必须 float32 VEC3；indices 必须 SCALAR 5121/5123/5125',
    allowedExtensions: [],           // 首版一个扩展都不放行
    rejectedExtensions: [
      'KHR_draco_mesh_compression', 'KHR_mesh_quantization', 'EXT_meshopt_compression',
      'KHR_materials_unlit', 'KHR_materials_specular', 'KHR_materials_ior',
      'KHR_materials_emissive_strength', 'KHR_materials_volume', 'KHR_materials_transmission',
      'KHR_materials_sheen', 'KHR_materials_clearcoat', 'KHR_materials_iridescence',
      'KHR_materials_pbrSpecularGlossiness', 'EXT_texture_webp', 'EXT_texture_avif',
      'KHR_texture_basisu', 'KHR_texture_transform'
    ],
    rejectedFeatures: ['skins', 'animations', 'morphTargets', 'sparse accessor', 'data: URI buffer'],
    limits: {
      fileBytes: 64 * 1024 * 1024,
      jsonChunkBytes: 8 * 1024 * 1024,
      nodeDepth: 32,
      nodeCount: 1 << 20,
      accessorCount: 1 << 20,
      bufferViewCount: 1 << 16,
      meshCount: 1 << 16,
      primitiveCount: 1 << 20,
      sceneCount: 1 << 16,
      textureCount: 1 << 16,
      imageBytes: 16 * 1024 * 1024,
      textureDimension: 8192,
      vertexCount: 1 << 24,
      indexCount: 1 << 24
    }
  };
  var LIMITS = SUPPORT.limits;

  var SEV = { ERROR: 'error', UNSUPPORTED: 'unsupported', WARNING: 'warning', INFO: 'info' };

  var CBYTES = { 5120: 1, 5121: 1, 5122: 2, 5123: 2, 5125: 4, 5126: 4 };
  var TDIM = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT2: 4, MAT3: 9, MAT4: 16 };
  var MAT_COLS = { MAT2: 2, MAT3: 3, MAT4: 4 };
  var ACC_TYPES = Object.keys(TDIM);
  var INDEX_CT = [5121, 5123, 5125];

  function issue(code, severity, message, target) {
    return { code: code, severity: severity, message: message, target: target || null };
  }

  // 元素字节数：矩阵类型每列按 4 字节对齐（glTF 2.0 §3.6.2.4）
  function elementBytes(componentType, type) {
    var cs = CBYTES[componentType];
    var dim = TDIM[type];
    if (!cs || !dim) return 0;
    if (type.indexOf('MAT') === 0 && cs < 4) {
      var cols = MAT_COLS[type];
      var colBytes = Math.ceil((cs * cols) / 4) * 4;
      return cols * colBytes;
    }
    return cs * dim;
  }

  function isFiniteNumber(v) { return typeof v === 'number' && isFinite(v); }
  function isNonNegInt(v) { return typeof v === 'number' && isFinite(v) && Math.floor(v) === v && v >= 0; }
  function isPosInt(v) { return isNonNegInt(v) && v > 0; }
  function isPlainObject(v) { return v != null && typeof v === 'object' && !Array.isArray(v); }

  function vecFinite(arr, len) {
    if (!Array.isArray(arr) || arr.length !== len) return false;
    for (var i = 0; i < len; i++) if (!isFiniteNumber(arr[i])) return false;
    return true;
  }

  // textureInfo 形状 + 引用范围 + texCoord
  var TEXINFO_SLOTS = ['baseColorTexture', 'metallicRoughnessTexture', 'normalTexture', 'occlusionTexture', 'emissiveTexture'];
  function checkTextureInfo(info, slot, mIdx, textureCount, issues) {
    if (info == null) return;
    var tg = 'material/' + mIdx + '/' + slot;
    if (!isPlainObject(info)) {
      issues.push(issue('E_TEXINFO_BAD_SHAPE', SEV.ERROR,
        'material ' + mIdx + ' ' + slot + ' 必须是对象，实际是 ' + (Array.isArray(info) ? 'array' : typeof info), tg));
      return;
    }
    if (!isNonNegInt(info.index)) {
      issues.push(issue('E_TEXINFO_BAD_INDEX', SEV.ERROR,
        'material ' + mIdx + ' ' + slot + '.index=' + JSON.stringify(info.index) + ' 必须是非负整数', tg));
    } else if (info.index >= textureCount) {
      issues.push(issue('E_TEXINFO_OUT_OF_RANGE', SEV.ERROR,
        'material ' + mIdx + ' ' + slot + '.index=' + info.index +
        ' 越界：textures 只有 ' + textureCount + ' 项', tg));
    }
    if (info.texCoord != null && (!isNonNegInt(info.texCoord) || info.texCoord > 15)) {
      issues.push(issue('E_TEXINFO_BAD_TEXCOORD', SEV.ERROR,
        'material ' + mIdx + ' ' + slot + '.texCoord=' + JSON.stringify(info.texCoord) + ' 必须是 0..15 的整数', tg));
    }
  }

  // ───────────────────────────────────────────────
  // 容器段
  // ───────────────────────────────────────────────
  function parseContainer(bytes) {
    var issues = [];
    var n = bytes.length;
    if (n < 12) {
      issues.push(issue('E_FILE_TOO_SMALL', SEV.ERROR, '文件长度 ' + n + ' < 12 字节', 'file'));
      return { ok: false, status: 'error', issues: issues };
    }
    if (n > LIMITS.fileBytes) {
      issues.push(issue('E_FILE_TOO_LARGE', SEV.ERROR, '文件 ' + n + ' 字节超过 ' + LIMITS.fileBytes + ' 上限', 'file'));
      return { ok: false, status: 'error', issues: issues };
    }
    var magic = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]);
    if (magic !== 'glTF') {
      issues.push(issue('E_BAD_MAGIC', SEV.ERROR, 'magic 错误：' + JSON.stringify(magic) + '，应为 glTF', 'header'));
      return { ok: false, status: 'error', issues: issues };
    }
    var dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    var version = dv.getUint32(4, true);
    if (version !== 2) {
      issues.push(issue('E_UNSUPPORTED_VERSION', SEV.ERROR, '版本 ' + version + ' 不支持，仅支持 2', 'header'));
      return { ok: false, status: 'error', issues: issues };
    }
    var total = dv.getUint32(8, true);
    if (total !== n) {
      issues.push(issue('E_LENGTH_MISMATCH', SEV.ERROR, '总长度字段 ' + total + ' 与实际 ' + n + ' 不一致', 'header'));
      return { ok: false, status: 'error', issues: issues };
    }
    if (n < 20) {
      issues.push(issue('E_TRUNCATED', SEV.ERROR, '缺少 JSON chunk 头', 'chunk0'));
      return { ok: false, status: 'error', issues: issues };
    }
    var jsonLen = dv.getUint32(12, true);
    if (jsonLen > LIMITS.jsonChunkBytes) {
      issues.push(issue('E_JSON_CHUNK_TOO_LARGE', SEV.ERROR, 'JSON chunk ' + jsonLen + ' 超过 ' + LIMITS.jsonChunkBytes + ' 上限', 'chunk0'));
      return { ok: false, status: 'error', issues: issues };
    }
    var jsonType = String.fromCharCode(bytes[16], bytes[17], bytes[18], bytes[19]);
    if (jsonType !== 'JSON') {
      issues.push(issue('E_BAD_CHUNK', SEV.ERROR, '第一个 chunk 类型 ' + JSON.stringify(jsonType) + '，应为 JSON', 'chunk0'));
      return { ok: false, status: 'error', issues: issues };
    }
    var jsonEnd = 20 + jsonLen;
    if (jsonEnd > n) {
      issues.push(issue('E_TRUNCATED', SEV.ERROR, 'JSON chunk 长度 ' + jsonLen + ' 越界（实际剩余 ' + (n - 20) + ' 字节）', 'chunk0'));
      return { ok: false, status: 'error', issues: issues };
    }

    var jsonText;
    try {
      jsonText = new TextDecoder('utf-8').decode(bytes.subarray(20, jsonEnd));
    } catch (e) {
      issues.push(issue('E_BAD_JSON', SEV.ERROR, 'JSON chunk 不是合法 UTF-8：' + (e && e.message), 'chunk0'));
      return { ok: false, status: 'error', issues: issues };
    }
    // 去掉可能的 BOM
    if (jsonText.charCodeAt(0) === 0xFEFF) jsonText = jsonText.slice(1);

    var json;
    try {
      json = JSON.parse(jsonText);
    } catch (e) {
      issues.push(issue('E_BAD_JSON', SEV.ERROR, 'JSON 解析失败：' + (e && e.message), 'chunk0'));
      return { ok: false, status: 'error', issues: issues };
    }
    if (!isPlainObject(json)) {
      // 关键：json=null 以前会一路 TypeError；这里直接结构化拒绝
      issues.push(issue('E_JSON_NOT_OBJECT', SEV.ERROR,
        'JSON 顶层必须是对象，实际是 ' + (json === null ? 'null' : (Array.isArray(json) ? 'array' : typeof json)), 'chunk0'));
      return { ok: false, status: 'error', issues: issues };
    }

    // BIN chunk（可选：没有 accessor 时可以没有）
    var binStart = jsonEnd;
    var binLength = 0;
    var binOffset = 0;
    var binPresent = false;
    if (binStart + 8 <= n) {
      var binLen = dv.getUint32(binStart, true);
      var binType = String.fromCharCode(bytes[binStart + 4], bytes[binStart + 5], bytes[binStart + 6], bytes[binStart + 7]);
      if (binType !== 'BIN\0') {
        issues.push(issue('E_BAD_CHUNK', SEV.ERROR, '第二个 chunk 类型 ' + JSON.stringify(binType) + '，应为 BIN\\0', 'chunk1'));
        return { ok: false, status: 'error', issues: issues };
      }
      if (binStart + 8 + binLen > n) {
        issues.push(issue('E_TRUNCATED', SEV.ERROR,
          'BIN chunk 长度 ' + binLen + ' 越界（实际剩余 ' + (n - binStart - 8) + ' 字节）', 'chunk1'));
        return { ok: false, status: 'error', issues: issues };
      }
      binOffset = binStart + 8;
      binLength = binLen;
      binPresent = true;
    } else if (binStart !== n) {
      issues.push(issue('E_TRUNCATED', SEV.ERROR, 'JSON chunk 之后有残留字节但不足 chunk 头', 'chunk1'));
      return { ok: false, status: 'error', issues: issues };
    }

    return {
      ok: true,
      status: 'pass',
      issues: issues,
      json: json,
      byteLength: n,
      binOffset: binOffset,
      binLength: binLength,
      binPresent: binPresent,
      jsonChunkBytes: jsonLen,
      binChunkBytes: binLength,
      container: {
        magicOk: true,
        version: 2,
        jsonChunkBytes: jsonLen,
        binChunkBytes: binLength,
        binPresent: binPresent,
        externalReferences: []
      }
    };
  }

  // ───────────────────────────────────────────────
  // 结构段
  // ───────────────────────────────────────────────
  function admit(json, binLength) {
    var issues = [];
    var limits = LIMITS;

    // asset
    if (!isPlainObject(json.asset)) {
      issues.push(issue('E_ASSET_MISSING', SEV.ERROR, '缺少 asset 对象', 'asset'));
    } else if (json.asset.version !== '2.0') {
      issues.push(issue('E_UNSUPPORTED_VERSION', SEV.ERROR,
        'asset.version=' + JSON.stringify(json.asset.version) + ' 不支持，仅支持 "2.0"', 'asset'));
    }

    // 数组字段类型
    var ARRAYS = ['buffers', 'bufferViews', 'accessors', 'meshes', 'nodes', 'scenes', 'materials', 'textures', 'images', 'samplers', 'skins', 'animations'];
    for (var ai = 0; ai < ARRAYS.length; ai++) {
      var key = ARRAYS[ai];
      if (json[key] != null && !Array.isArray(json[key])) {
        issues.push(issue('E_BAD_SHAPE', SEV.ERROR, key + ' 必须是数组，实际是 ' + typeof json[key], key));
      }
    }
    function arr(k) { return Array.isArray(json[k]) ? json[k] : []; }
    function count(k) { return arr(k).length; }

    // 数量上限（超限即停止后续处理）
    var COUNT_LIMITS = {
      accessors: limits.accessorCount, nodes: limits.nodeCount, bufferViews: limits.bufferViewCount,
      meshes: limits.meshCount, scenes: limits.sceneCount, textures: limits.textureCount
    };
    var countExceeded = false;
    for (var ck in COUNT_LIMITS) {
      if (count(ck) > COUNT_LIMITS[ck]) {
        issues.push(issue('E_TOO_MANY', SEV.ERROR, ck + ' 数量 ' + count(ck) + ' 超过上限 ' + COUNT_LIMITS[ck], ck));
        countExceeded = true;
      }
    }
    if (countExceeded) return finishAdmit(json, issues, null, null, null);

    var buffers = arr('buffers');
    var bufferViews = arr('bufferViews');
    var accessors = arr('accessors');
    var meshes = arr('meshes');
    var nodes = arr('nodes');
    var scenes = arr('scenes');
    var materials = arr('materials');
    var textures = arr('textures');
    var images = arr('images');
    var samplers = arr('samplers');

    // buffers：只支持 GLB 内嵌 BIN（buffer 0 无 uri）
    if (buffers.length === 0) {
      issues.push(issue('E_NO_BUFFER', SEV.ERROR, '缺少 buffers，GLB 必须至少有 buffer 0 指向 BIN chunk', 'buffers'));
    } else if (buffers.length > 1) {
      issues.push(issue('E_TOO_MANY_BUFFERS', SEV.UNSUPPORTED,
        'buffer 数量 ' + buffers.length + ' > 1，首版仅支持单一 BIN chunk', 'buffers'));
    } else {
      var b0 = buffers[0];
      if (!isPlainObject(b0)) {
        issues.push(issue('E_BUFFER_BAD_SHAPE', SEV.ERROR, 'buffer 0 不是对象', 'buffer/0'));
      } else if (typeof b0.uri === 'string') {
        if (b0.uri.slice(0, 5) === 'data:') {
          issues.push(issue('E_BUFFER_DATA_URI_UNSUPPORTED', SEV.UNSUPPORTED,
            'buffer 0 使用 data: URI，首版只支持 GLB 内嵌 BIN chunk（无法核验容量）', 'buffer/0'));
        } else {
          issues.push(issue('E_NOT_SELF_CONTAINED', SEV.ERROR,
            'buffer 0 引用外部 URI：' + truncate(b0.uri, 80), 'buffer/0'));
        }
      } else if (!isPosInt(b0.byteLength)) {
        issues.push(issue('E_BUFFER_BAD_LENGTH', SEV.ERROR,
          'buffer 0 byteLength=' + JSON.stringify(b0.byteLength) + ' 必须是正整数', 'buffer/0'));
      } else if (b0.byteLength > binLength) {
        issues.push(issue('E_BIN_TOO_SHORT', SEV.ERROR,
          'buffer 0 声明 byteLength=' + b0.byteLength + '，但 BIN chunk 只有 ' + binLength + ' 字节', 'buffer/0'));
      }
    }

    // 逻辑 buffer 容量（buffer.byteLength）——bufferView 必须先落在它里面，
    // BIN chunk 只是物理上限。二者不能混为一谈：BIN 36 字节但 buffer 只声明 4 字节时，
    // byteLength=36 的 bufferView 依然是越界的。
    var bufferLen = new Array(buffers.length);
    for (var bli = 0; bli < buffers.length; bli++) {
      var blb = buffers[bli];
      bufferLen[bli] = (isPlainObject(blb) && isPosInt(blb.byteLength)) ? blb.byteLength : null;
    }
    // BIN 允许比逻辑 buffer 多 0–3 字节的 4 字节对齐填充；多出更多就不正常了
    if (bufferLen.length === 1 && bufferLen[0] != null && binLength > bufferLen[0] && binLength - bufferLen[0] > 3) {
      issues.push(issue('W_BIN_PADDING_EXCESS', SEV.WARNING,
        'BIN chunk ' + binLength + ' 字节比 buffer 0 声明的 ' + bufferLen[0] + ' 多 ' +
        (binLength - bufferLen[0]) + ' 字节，超过 4 字节对齐允许的 0–3 字节填充', 'chunk1'));
    }

    // bufferViews：容量必须落在所属逻辑 buffer 内（再看 BIN）
    var bvInfo = new Array(bufferViews.length);
    for (var bi = 0; bi < bufferViews.length; bi++) {
      var bv = bufferViews[bi];
      if (!isPlainObject(bv)) {
        issues.push(issue('E_BV_BAD_SHAPE', SEV.ERROR, 'bufferView ' + bi + ' 不是对象', 'bufferView/' + bi));
        continue;
      }
      if (!isNonNegInt(bv.buffer) || bv.buffer >= buffers.length) {
        issues.push(issue('E_BAD_REFERENCE', SEV.ERROR,
          'bufferView ' + bi + '.buffer=' + JSON.stringify(bv.buffer) + ' 越界 [0,' + buffers.length + ')', 'bufferView/' + bi));
        continue;
      }
      var bo = bv.byteOffset == null ? 0 : bv.byteOffset;
      if (!isNonNegInt(bo)) {
        issues.push(issue('E_BV_BAD_OFFSET', SEV.ERROR, 'bufferView ' + bi + ' byteOffset 必须是非负整数', 'bufferView/' + bi));
        continue;
      }
      if (!isPosInt(bv.byteLength)) {
        issues.push(issue('E_BV_BAD_LENGTH', SEV.ERROR,
          'bufferView ' + bi + ' byteLength=' + JSON.stringify(bv.byteLength) + ' 必须是正整数', 'bufferView/' + bi));
        continue;
      }
      var logicalLen = bufferLen[bv.buffer];
      if (logicalLen != null && bo + bv.byteLength > logicalLen) {
        issues.push(issue('E_BV_EXCEEDS_BUFFER', SEV.ERROR,
          'bufferView ' + bi + ' 越过所属 buffer ' + bv.buffer + ' 的逻辑长度：byteOffset ' + bo +
          ' + byteLength ' + bv.byteLength + ' > buffer.byteLength ' + logicalLen,
          'bufferView/' + bi));
        continue;
      }
      if (bo + bv.byteLength > binLength) {
        issues.push(issue('E_BV_OUT_OF_RANGE', SEV.ERROR,
          'bufferView ' + bi + ' 越界：byteOffset ' + bo + ' + byteLength ' + bv.byteLength + ' > BIN ' + binLength + ' 字节', 'bufferView/' + bi));
        continue;
      }
      var stride = bv.byteStride;
      if (stride != null) {
        if (!isPosInt(stride) || stride < 4 || stride > 252 || stride % 4 !== 0) {
          issues.push(issue('E_BV_BAD_STRIDE', SEV.ERROR,
            'bufferView ' + bi + ' byteStride=' + JSON.stringify(stride) + ' 必须是 4 的正整数倍且 ≤252', 'bufferView/' + bi));
          continue;
        }
      }
      bvInfo[bi] = { offset: bo, length: bv.byteLength, stride: stride == null ? 0 : stride };
    }

    // accessors
    var accInfo = new Array(accessors.length);
    for (var aci = 0; aci < accessors.length; aci++) {
      var a = accessors[aci];
      if (!isPlainObject(a)) {
        issues.push(issue('E_ACC_BAD_SHAPE', SEV.ERROR, 'accessor ' + aci + ' 不是对象', 'accessor/' + aci));
        continue;
      }
      var tg = 'accessor/' + aci;
      if (a.sparse != null) {
        issues.push(issue('E_UNSUPPORTED_FEATURE', SEV.UNSUPPORTED, 'accessor ' + aci + ' 为稀疏（sparse）格式，首版不支持', tg));
      }
      if (!isPosInt(a.componentType) || !CBYTES[a.componentType]) {
        issues.push(issue('E_ACC_BAD_CT', SEV.ERROR, 'accessor ' + aci + ' componentType=' + JSON.stringify(a.componentType) + ' 不在允许枚举内', tg));
        continue;
      }
      if (typeof a.type !== 'string' || ACC_TYPES.indexOf(a.type) === -1) {
        issues.push(issue('E_ACC_BAD_TYPE', SEV.ERROR, 'accessor ' + aci + ' type=' + JSON.stringify(a.type) + ' 不在允许枚举内', tg));
        continue;
      }
      // count 必须是正整数——3.5 这类以前会被 |0 截断成 3，必须拒绝
      if (!isPosInt(a.count)) {
        issues.push(issue('E_ACC_BAD_COUNT', SEV.ERROR,
          'accessor ' + aci + ' count=' + JSON.stringify(a.count) + ' 必须是正整数', tg));
        continue;
      }
      if (a.count > limits.vertexCount) {
        issues.push(issue('E_TOO_MANY', SEV.ERROR, 'accessor ' + aci + ' count=' + a.count + ' 超过上限 ' + limits.vertexCount, tg));
        continue;
      }
      if (a.min != null && !Array.isArray(a.min)) {
        issues.push(issue('E_ACC_BAD_MIN', SEV.ERROR, 'accessor ' + aci + ' min 必须是数组', tg));
      }
      if (Array.isArray(a.min) && a.min.some(function (v) { return !isFiniteNumber(v); })) {
        issues.push(issue('E_ACC_BAD_MIN', SEV.ERROR, 'accessor ' + aci + ' min 含非有限值', tg));
      }
      if (a.max != null && !Array.isArray(a.max)) {
        issues.push(issue('E_ACC_BAD_MAX', SEV.ERROR, 'accessor ' + aci + ' max 必须是数组', tg));
      }
      if (Array.isArray(a.max) && a.max.some(function (v) { return !isFiniteNumber(v); })) {
        issues.push(issue('E_ACC_BAD_MAX', SEV.ERROR, 'accessor ' + aci + ' max 含非有限值', tg));
      }
      if (a.bufferView == null) {
        issues.push(issue('E_ACC_NO_BUFFERVIEW', SEV.UNSUPPORTED,
          'accessor ' + aci + ' 没有 bufferView（纯零数据），首版不支持——无法核验真实数值', tg));
        continue;
      }
      if (!isNonNegInt(a.bufferView) || a.bufferView >= bufferViews.length) {
        issues.push(issue('E_BAD_REFERENCE', SEV.ERROR,
          'accessor ' + aci + '.bufferView=' + JSON.stringify(a.bufferView) + ' 越界 [0,' + bufferViews.length + ')', tg));
        continue;
      }
      var bvi = bvInfo[a.bufferView];
      if (!bvi) {
        // bufferView 本身已经报错，这里不再重复报；但 accessor 不可用
        continue;
      }
      var ao = a.byteOffset == null ? 0 : a.byteOffset;
      if (!isNonNegInt(ao)) {
        issues.push(issue('E_ACC_BAD_OFFSET', SEV.ERROR, 'accessor ' + aci + ' byteOffset 必须是非负整数', tg));
        continue;
      }
      var eb = elementBytes(a.componentType, a.type);
      var stride2 = bvi.stride || eb;
      if (bvi.stride && bvi.stride < eb) {
        issues.push(issue('E_BV_BAD_STRIDE', SEV.ERROR,
          'bufferView ' + a.bufferView + ' byteStride ' + bvi.stride + ' 小于元素大小 ' + eb, 'bufferView/' + a.bufferView));
        continue;
      }
      var need = ao + (a.count - 1) * stride2 + eb;
      if (need > bvi.length) {
        issues.push(issue('E_ACC_OUT_OF_RANGE', SEV.ERROR,
          'accessor ' + aci + ' 数据越界：需要 ' + need + ' 字节，bufferView 只有 ' + bvi.length + ' 字节' +
          '（byteOffset ' + ao + ' + (count-1)×' + stride2 + ' + 元素 ' + eb + '）', tg));
        continue;
      }
      accInfo[aci] = {
        bufferView: a.bufferView,
        offset: bvi.offset + ao,
        stride: stride2,
        count: a.count,
        componentType: a.componentType,
        type: a.type,
        elementBytes: eb,
        dim: TDIM[a.type]
      };
    }

    // meshes / primitives
    var primitiveCount = 0;
    for (var mi = 0; mi < meshes.length; mi++) {
      var mesh = meshes[mi];
      if (!isPlainObject(mesh)) {
        issues.push(issue('E_MESH_BAD_SHAPE', SEV.ERROR, 'mesh ' + mi + ' 不是对象', 'mesh/' + mi));
        continue;
      }
      if (!Array.isArray(mesh.primitives) || mesh.primitives.length === 0) {
        issues.push(issue('E_MESH_NO_PRIMITIVE', SEV.ERROR, 'mesh ' + mi + ' 没有 primitives 数组', 'mesh/' + mi));
        continue;
      }
      primitiveCount += mesh.primitives.length;
      if (primitiveCount > limits.primitiveCount) {
        issues.push(issue('E_TOO_MANY', SEV.ERROR, 'primitive 总数超过上限 ' + limits.primitiveCount, 'meshes'));
        break;
      }
      for (var pi = 0; pi < mesh.primitives.length; pi++) {
        var p = mesh.primitives[pi];
        var ptg = 'mesh/' + (mesh.name || mi) + '/prim/' + pi;
        if (!isPlainObject(p)) {
          issues.push(issue('E_PRIM_BAD_SHAPE', SEV.ERROR, 'primitive ' + pi + ' 不是对象', ptg));
          continue;
        }
        if (Array.isArray(p.targets) && p.targets.length) {
          issues.push(issue('E_UNSUPPORTED_FEATURE', SEV.UNSUPPORTED, 'mesh ' + mi + ' 含 morphTargets，首版不支持', ptg));
        }
        var mode = p.mode == null ? 4 : p.mode;
        if (!isNonNegInt(mode) || mode > 6) {
          issues.push(issue('E_PRIM_BAD_MODE', SEV.ERROR, 'primitive.mode=' + JSON.stringify(p.mode) + ' 必须是 0..6', ptg));
        }
        if (!isPlainObject(p.attributes)) {
          issues.push(issue('E_PRIM_NO_ATTRIBUTES', SEV.ERROR, 'primitive 缺少 attributes 对象', ptg));
          continue;
        }
        var attrNames = Object.keys(p.attributes);
        for (var an = 0; an < attrNames.length; an++) {
          var accIdx = p.attributes[attrNames[an]];
          if (!isNonNegInt(accIdx) || accIdx >= accessors.length) {
            issues.push(issue('E_BAD_REFERENCE', SEV.ERROR,
              'primitive 属性 ' + attrNames[an] + ' 引用 accessor ' + JSON.stringify(accIdx) + ' 越界', ptg));
          }
        }
        var posIdx = p.attributes.POSITION;
        if (posIdx == null) {
          issues.push(issue('E_PRIM_NO_POSITION', SEV.ERROR, 'primitive 缺少 POSITION 属性，无法统计几何', ptg));
          continue;
        }
        if (isNonNegInt(posIdx) && posIdx < accInfo.length && accInfo[posIdx]) {
          var pa = accInfo[posIdx];
          if (pa.componentType !== 5126 || pa.type !== 'VEC3') {
            issues.push(issue('E_PRIM_POSITION_NOT_FLOAT3', SEV.UNSUPPORTED,
              'POSITION 必须是 float32 VEC3，实际 componentType=' + pa.componentType + ' type=' + pa.type +
              '（量化/整型顶点首版不支持）', ptg));
          }
        }
        if (p.indices != null) {
          if (!isNonNegInt(p.indices) || p.indices >= accessors.length) {
            issues.push(issue('E_BAD_REFERENCE', SEV.ERROR,
              'primitive.indices 引用 accessor ' + JSON.stringify(p.indices) + ' 越界', ptg));
          } else if (accInfo[p.indices]) {
            var ia = accInfo[p.indices];
            if (INDEX_CT.indexOf(ia.componentType) === -1) {
              issues.push(issue('E_PRIM_INDICES_BAD_CT', SEV.ERROR,
                'indices componentType=' + ia.componentType + ' 必须是 5121/5123/5125', ptg));
            }
            if (ia.type !== 'SCALAR') {
              issues.push(issue('E_PRIM_INDICES_BAD_TYPE', SEV.ERROR, 'indices type 必须是 SCALAR', ptg));
            }
            if (ia.count > limits.indexCount) {
              issues.push(issue('E_TOO_MANY', SEV.ERROR, 'indices count=' + ia.count + ' 超过上限 ' + limits.indexCount, ptg));
            }
          }
        }
        if (p.material != null && (!isNonNegInt(p.material) || p.material >= materials.length)) {
          issues.push(issue('E_BAD_REFERENCE', SEV.ERROR,
            'primitive.material=' + JSON.stringify(p.material) + ' 越界 [0,' + materials.length + ')', ptg));
        }
      }
    }

    // nodes：形状 + 数值有限性
    for (var ni = 0; ni < nodes.length; ni++) {
      var n = nodes[ni];
      if (!isPlainObject(n)) {
        issues.push(issue('E_NODE_BAD_SHAPE', SEV.ERROR, 'node ' + ni + ' 不是对象', 'node/' + ni));
        continue;
      }
      var ntg = 'node/' + ni;
      if (n.matrix != null) {
        if (!Array.isArray(n.matrix) || n.matrix.length !== 16) {
          issues.push(issue('E_NODE_BAD_MATRIX', SEV.ERROR,
            'node ' + ni + ' matrix 必须是 16 个数的数组，实际长度 ' + (Array.isArray(n.matrix) ? n.matrix.length : typeof n.matrix), ntg));
        } else if (n.matrix.some(function (v) { return !isFiniteNumber(v); })) {
          issues.push(issue('E_NODE_BAD_MATRIX', SEV.ERROR, 'node ' + ni + ' matrix 含非有限值', ntg));
        }
        if (n.translation != null || n.rotation != null || n.scale != null) {
          issues.push(issue('E_NODE_TRS_WITH_MATRIX', SEV.ERROR, 'node ' + ni + ' 同时给了 matrix 与 TRS，非法', ntg));
        }
      }
      if (n.translation != null && !vecFinite(n.translation, 3)) {
        issues.push(issue('E_NODE_BAD_TRS', SEV.ERROR,
          'node ' + ni + ' translation 必须是 3 个有限数，实际 ' + JSON.stringify(n.translation), ntg));
      }
      if (n.rotation != null && !vecFinite(n.rotation, 4)) {
        issues.push(issue('E_NODE_BAD_TRS', SEV.ERROR,
          'node ' + ni + ' rotation 必须是 4 个有限数，实际 ' + JSON.stringify(n.rotation), ntg));
      }
      if (n.scale != null && !vecFinite(n.scale, 3)) {
        issues.push(issue('E_NODE_BAD_TRS', SEV.ERROR,
          'node ' + ni + ' scale 必须是 3 个有限数，实际 ' + JSON.stringify(n.scale), ntg));
      }
      if (n.children != null) {
        if (!Array.isArray(n.children)) {
          issues.push(issue('E_NODE_BAD_CHILDREN', SEV.ERROR, 'node ' + ni + ' children 不是数组', ntg));
        } else {
          for (var ci = 0; ci < n.children.length; ci++) {
            var c = n.children[ci];
            if (!isNonNegInt(c) || c >= nodes.length) {
              issues.push(issue('E_BAD_REFERENCE', SEV.ERROR,
                'node ' + ni + '.children[' + ci + ']=' + JSON.stringify(c) + ' 越界', ntg));
            }
          }
        }
      }
      if (n.mesh != null && (!isNonNegInt(n.mesh) || n.mesh >= meshes.length)) {
        issues.push(issue('E_BAD_REFERENCE', SEV.ERROR,
          'node ' + ni + '.mesh=' + JSON.stringify(n.mesh) + ' 越界 [0,' + meshes.length + ')', ntg));
      }
      if (n.skin != null) {
        issues.push(issue('E_UNSUPPORTED_FEATURE', SEV.UNSUPPORTED, 'node ' + ni + ' 含 skin，首版不支持', ntg));
      }
      if (n.weights != null) {
        issues.push(issue('E_UNSUPPORTED_FEATURE', SEV.UNSUPPORTED, 'node ' + ni + ' 含 morph weights，首版不支持', ntg));
      }
    }

    // scenes
    var defaultSceneIndex = null;
    if (scenes.length === 0) {
      issues.push(issue('E_NO_SCENE', SEV.ERROR, '缺少 scenes，无法确定要渲染什么', 'scenes'));
    } else {
      if (json.scene != null) {
        if (!isNonNegInt(json.scene) || json.scene >= scenes.length) {
          issues.push(issue('E_SCENE_BAD_INDEX', SEV.ERROR,
            'gltf.scene=' + JSON.stringify(json.scene) + ' 越界 [0,' + scenes.length + ')', 'scene'));
        } else {
          defaultSceneIndex = json.scene;
        }
      } else {
        defaultSceneIndex = 0;
      }
      for (var si = 0; si < scenes.length; si++) {
        var s = scenes[si];
        if (!isPlainObject(s)) {
          issues.push(issue('E_SCENE_BAD_SHAPE', SEV.ERROR, 'scene ' + si + ' 不是对象', 'scene/' + si));
          continue;
        }
        if (s.nodes != null && !Array.isArray(s.nodes)) {
          issues.push(issue('E_SCENE_BAD_NODES', SEV.ERROR, 'scene ' + si + ' nodes 不是数组', 'scene/' + si));
          continue;
        }
        var sn = s.nodes || [];
        for (var snk = 0; snk < sn.length; snk++) {
          if (!isNonNegInt(sn[snk]) || sn[snk] >= nodes.length) {
            issues.push(issue('E_BAD_REFERENCE', SEV.ERROR,
              'scene ' + si + '.nodes[' + snk + ']=' + JSON.stringify(sn[snk]) + ' 越界', 'scene/' + si));
          }
        }
      }
    }

    // images / textures / samplers
    for (var imi = 0; imi < images.length; imi++) {
      var im = images[imi];
      if (!isPlainObject(im)) {
        issues.push(issue('E_IMAGE_BAD_SHAPE', SEV.ERROR, 'image ' + imi + ' 不是对象', 'image/' + imi));
        continue;
      }
      if (typeof im.uri === 'string') {
        if (im.uri.slice(0, 5) !== 'data:') {
          issues.push(issue('E_NOT_SELF_CONTAINED', SEV.ERROR,
            'image ' + imi + ' 引用外部 URI：' + truncate(im.uri, 80), 'image/' + imi));
        }
      } else if (im.bufferView != null) {
        if (!isNonNegInt(im.bufferView) || im.bufferView >= bufferViews.length) {
          issues.push(issue('E_BAD_REFERENCE', SEV.ERROR,
            'image ' + imi + '.bufferView=' + JSON.stringify(im.bufferView) + ' 越界', 'image/' + imi));
        } else if (!bvInfo[im.bufferView]) {
          // bufferView 已报错
        } else if (bvInfo[im.bufferView].length > limits.imageBytes) {
          issues.push(issue('E_TOO_MANY', SEV.ERROR,
            'image ' + imi + ' 字节数 ' + bvInfo[im.bufferView].length + ' 超过上限 ' + limits.imageBytes, 'image/' + imi));
        }
      } else {
        issues.push(issue('E_IMAGE_NO_SOURCE', SEV.ERROR, 'image ' + imi + ' 既没有 uri 也没有 bufferView', 'image/' + imi));
      }
      if (typeof im.mimeType === 'string' && ['image/png', 'image/jpeg'].indexOf(im.mimeType) === -1) {
        issues.push(issue('E_UNSUPPORTED_FEATURE', SEV.UNSUPPORTED,
          'image ' + imi + ' mimeType=' + im.mimeType + ' 首版仅支持 png/jpeg', 'image/' + imi));
      }
    }
    // materials：首版用到的 5 个 textureInfo 必须逐个校验引用范围。
    // 坏样本：baseColorTexture.index=123 而 textures 根本不存在 —— 以前直接 pass，
    // 到 GLTFLoader 才炸 "Cannot read properties of undefined (reading '123')"。
    for (var mti = 0; mti < materials.length; mti++) {
      var mat = materials[mti];
      if (!isPlainObject(mat)) {
        issues.push(issue('E_MATERIAL_BAD_SHAPE', SEV.ERROR, 'material ' + mti + ' 不是对象', 'material/' + mti));
        continue;
      }
      var mtg = 'material/' + mti;
      if (mat.pbrMetallicRoughness != null) {
        if (!isPlainObject(mat.pbrMetallicRoughness)) {
          issues.push(issue('E_MATERIAL_BAD_SHAPE', SEV.ERROR,
            'material ' + mti + ' pbrMetallicRoughness 必须是对象', mtg));
        } else {
          var pbr = mat.pbrMetallicRoughness;
          checkTextureInfo(pbr.baseColorTexture, 'baseColorTexture', mti, textures.length, issues);
          checkTextureInfo(pbr.metallicRoughnessTexture, 'metallicRoughnessTexture', mti, textures.length, issues);
          if (pbr.baseColorFactor != null && !vecFinite(pbr.baseColorFactor, 4)) {
            issues.push(issue('E_MATERIAL_BAD_FACTOR', SEV.ERROR,
              'material ' + mti + ' baseColorFactor 必须是 4 个有限数', mtg));
          }
          if (pbr.metallicFactor != null && !isFiniteNumber(pbr.metallicFactor)) {
            issues.push(issue('E_MATERIAL_BAD_FACTOR', SEV.ERROR,
              'material ' + mti + ' metallicFactor 必须是有限数', mtg));
          }
          if (pbr.roughnessFactor != null && !isFiniteNumber(pbr.roughnessFactor)) {
            issues.push(issue('E_MATERIAL_BAD_FACTOR', SEV.ERROR,
              'material ' + mti + ' roughnessFactor 必须是有限数', mtg));
          }
        }
      }
      checkTextureInfo(mat.normalTexture, 'normalTexture', mti, textures.length, issues);
      checkTextureInfo(mat.occlusionTexture, 'occlusionTexture', mti, textures.length, issues);
      checkTextureInfo(mat.emissiveTexture, 'emissiveTexture', mti, textures.length, issues);
      if (mat.normalTexture != null && isPlainObject(mat.normalTexture) &&
          mat.normalTexture.scale != null && !isFiniteNumber(mat.normalTexture.scale)) {
        issues.push(issue('E_MATERIAL_BAD_FACTOR', SEV.ERROR, 'material ' + mti + ' normalTexture.scale 必须是有限数', mtg));
      }
      if (mat.occlusionTexture != null && isPlainObject(mat.occlusionTexture) &&
          mat.occlusionTexture.strength != null && !isFiniteNumber(mat.occlusionTexture.strength)) {
        issues.push(issue('E_MATERIAL_BAD_FACTOR', SEV.ERROR, 'material ' + mti + ' occlusionTexture.strength 必须是有限数', mtg));
      }
      if (mat.emissiveFactor != null && !vecFinite(mat.emissiveFactor, 3)) {
        issues.push(issue('E_MATERIAL_BAD_FACTOR', SEV.ERROR, 'material ' + mti + ' emissiveFactor 必须是 3 个有限数', mtg));
      }
      if (mat.alphaMode != null && ['OPAQUE', 'MASK', 'BLEND'].indexOf(mat.alphaMode) === -1) {
        issues.push(issue('E_MATERIAL_BAD_ALPHA_MODE', SEV.ERROR,
          'material ' + mti + ' alphaMode=' + JSON.stringify(mat.alphaMode) + ' 不在 OPAQUE/MASK/BLEND 内', mtg));
      }
    }

    for (var ti = 0; ti < textures.length; ti++) {
      var t = textures[ti];
      if (!isPlainObject(t)) {
        issues.push(issue('E_TEXTURE_BAD_SHAPE', SEV.ERROR, 'texture ' + ti + ' 不是对象', 'texture/' + ti));
        continue;
      }
      if (t.source != null && (!isNonNegInt(t.source) || t.source >= images.length)) {
        issues.push(issue('E_BAD_REFERENCE', SEV.ERROR,
          'texture ' + ti + '.source=' + JSON.stringify(t.source) + ' 越界 [0,' + images.length + ')', 'texture/' + ti));
      }
      if (t.sampler != null && (!isNonNegInt(t.sampler) || t.sampler >= samplers.length)) {
        issues.push(issue('E_BAD_REFERENCE', SEV.ERROR,
          'texture ' + ti + '.sampler=' + JSON.stringify(t.sampler) + ' 越界 [0,' + samplers.length + ')', 'texture/' + ti));
      }
    }

    // 不支持的功能
    if (arr('skins').length) {
      issues.push(issue('E_UNSUPPORTED_FEATURE', SEV.UNSUPPORTED, '含 skins (' + arr('skins').length + ')，首版不支持', 'skins'));
    }
    if (arr('animations').length) {
      issues.push(issue('E_UNSUPPORTED_FEATURE', SEV.UNSUPPORTED, '含 animations (' + arr('animations').length + ')，首版不支持', 'animations'));
    }

    // 扩展
    var used = Array.isArray(json.extensionsUsed) ? json.extensionsUsed : [];
    var required = Array.isArray(json.extensionsRequired) ? json.extensionsRequired : [];
    if (json.extensionsUsed != null && !Array.isArray(json.extensionsUsed)) {
      issues.push(issue('E_BAD_SHAPE', SEV.ERROR, 'extensionsUsed 必须是字符串数组', 'extensionsUsed'));
    }
    if (json.extensionsRequired != null && !Array.isArray(json.extensionsRequired)) {
      issues.push(issue('E_BAD_SHAPE', SEV.ERROR, 'extensionsRequired 必须是字符串数组', 'extensionsRequired'));
    }
    for (var ri = 0; ri < required.length; ri++) {
      if (SUPPORT.allowedExtensions.indexOf(required[ri]) === -1) {
        issues.push(issue('E_UNSUPPORTED_EXTENSION', SEV.UNSUPPORTED,
          '必需扩展 ' + required[ri] + ' 不在首版支持范围', 'extensionsRequired'));
      }
    }
    for (var ui = 0; ui < used.length; ui++) {
      if (SUPPORT.allowedExtensions.indexOf(used[ui]) === -1) {
        if (SUPPORT.rejectedExtensions.indexOf(used[ui]) !== -1) {
          issues.push(issue('E_UNSUPPORTED_EXTENSION', SEV.UNSUPPORTED,
            '使用扩展 ' + used[ui] + '，首版不支持', 'extensionsUsed'));
        } else {
          issues.push(issue('W_UNKNOWN_EXTENSION', SEV.WARNING,
            '使用扩展 ' + used[ui] + '，未做专项处理（若影响几何则结果不可信）', 'extensionsUsed'));
        }
      }
    }

    // 节点图：**全图**校验（所有场景 + 未挂接节点），不只默认场景。
    // Three.js 会解析每一个 scene；默认场景干净而第二场景有环时，GLTFLoader 仍会
    // "Maximum call stack size exceeded"。所以环/深度/多父都必须在整张图上查。
    var graph = analyzeNodeGraph(nodes, issues);

    // 世界矩阵：沿父链合成，每一级都检查有限性。
    // 父子 scale 各 1e308 时输入都是有限数，相乘才溢出——必须在合成时抓。
    var worldMatrices = composeWorldMatrices(nodes, graph.parentOf, issues);

    // 统计与包围盒只用默认场景，但访问顺序必须环安全
    var walk = null;
    if (defaultSceneIndex != null && scenes[defaultSceneIndex] && Array.isArray(scenes[defaultSceneIndex].nodes)) {
      walk = {
        parentOf: graph.parentOf,
        nodeOrder: orderOfScene(nodes, scenes[defaultSceneIndex].nodes),
        defaultSceneIndex: defaultSceneIndex
      };
    }

    return finishAdmit(json, issues, {
      buffers: buffers.length,
      bufferViews: bufferViews.length,
      accessors: accessors.length,
      meshes: meshes.length,
      primitives: primitiveCount,
      nodes: nodes.length,
      scenes: scenes.length,
      materials: materials.length,
      textures: textures.length,
      images: images.length,
      defaultSceneIndex: defaultSceneIndex,
      extensionsUsed: used,
      extensionsRequired: required
    }, bvInfo, accInfo, walk, worldMatrices);
  }

  function finishAdmit(json, issues, summary, bvInfo, accInfo, walk, worldMatrices) {
    var status = 'pass';
    for (var i = 0; i < issues.length; i++) {
      if (issues[i].severity === SEV.ERROR) { status = 'error'; break; }
    }
    if (status === 'pass') {
      for (var j = 0; j < issues.length; j++) {
        if (issues[j].severity === SEV.UNSUPPORTED) { status = 'unsupported'; break; }
      }
    }
    return {
      status: status,
      fatal: status !== 'pass',
      issues: issues,
      summary: summary || null,
      bufferViews: bvInfo || null,
      accessors: accInfo || null,
      parentOf: walk ? walk.parentOf : null,
      nodeOrder: walk ? walk.nodeOrder : null,
      defaultSceneIndex: walk ? walk.defaultSceneIndex : (summary ? summary.defaultSceneIndex : null),
      worldMatrices: worldMatrices || null,
      support: SUPPORT
    };
  }

  // ───────────────────────────────────────────────
  // 节点图（全图，不只是默认场景）
  //
  // glTF 2.0 规定：一个 node 最多只能有一个父节点（children 边不许多父）。
  // 这里一次搞定三件事，全部覆盖「所有场景 + 未挂接节点」：
  //   ① 父表 + 非法多父（同一 child 被两个不同父引用）
  //   ② 环（用显式栈做三色 DFS，避免深链把调用栈打爆）
  //   ③ 深度（从真根 BFS，只对可达节点定深度；环内节点已被 ② 判死）
  // 合法情形必须放行并区分开：
  //   - 两个不同 node 引用同一个 mesh（实例化）——与多父无关
  //   - 同一个 node 作为多个 scene 的根——每场景各自一份引用，不算多父
  // ───────────────────────────────────────────────
  function analyzeNodeGraph(nodes, issues) {
    var n = nodes.length;
    var parentOf = new Array(n);
    var i;
    for (i = 0; i < n; i++) parentOf[i] = -1;

    // ① 父表 + 多父
    var multiParentReported = 0;
    for (i = 0; i < n; i++) {
      var node = nodes[i];
      if (!isPlainObject(node) || !Array.isArray(node.children)) continue;
      for (var k = 0; k < node.children.length; k++) {
        var c = node.children[k];
        if (!isNonNegInt(c) || c >= n) continue;       // 越界由引用校验报
        if (c === i) continue;                          // 自环交给 ② 报，不重复
        if (parentOf[c] === -1) {
          parentOf[c] = i;
        } else if (parentOf[c] !== i) {
          if (multiParentReported < 3) {
            issues.push(issue('E_NODE_MULTI_PARENT', SEV.ERROR,
              '节点 ' + c + ' 同时被父节点 ' + parentOf[c] + ' 与 ' + i + ' 引用（glTF 规定每个节点最多一个父）',
              'node/' + c));
            multiParentReported++;
          }
        }
      }
    }

    // ② 环：0=未访问 1=在栈上 2=已完成
    var state = new Array(n);
    for (i = 0; i < n; i++) state[i] = 0;
    var idxStack = [];
    var childCursor = [];
    var cycleReported = 0;
    for (i = 0; i < n; i++) {
      if (state[i] !== 0) continue;
      if (!isPlainObject(nodes[i])) { state[i] = 2; continue; }
      state[i] = 1;
      idxStack.push(i);
      childCursor.push(0);
      while (idxStack.length) {
        var top = idxStack.length - 1;
        var cur = idxStack[top];
        var ch = Array.isArray(nodes[cur].children) ? nodes[cur].children : [];
        if (childCursor[top] >= ch.length) {
          state[cur] = 2;
          idxStack.pop();
          childCursor.pop();
          continue;
        }
        var c2 = ch[childCursor[top]++];
        if (!isNonNegInt(c2) || c2 >= n) continue;
        if (state[c2] === 1) {
          if (cycleReported < 3) {
            issues.push(issue('E_NODE_CYCLE', SEV.ERROR,
              '节点 ' + c2 + ' 通过父节点 ' + cur + ' 参与循环引用（全图扫描，默认场景之外也算）',
              'node/' + c2));
            cycleReported++;
          }
          continue;
        }
        if (state[c2] === 2) continue;
        if (!isPlainObject(nodes[c2])) { state[c2] = 2; continue; }
        state[c2] = 1;
        idxStack.push(c2);
        childCursor.push(0);
      }
    }

    // ③ 深度：真根（无父）BFS
    var depth = new Array(n);
    for (i = 0; i < n; i++) depth[i] = -1;
    var queue = [];
    for (i = 0; i < n; i++) {
      if (parentOf[i] === -1) { depth[i] = 0; queue.push(i); }
    }
    for (var qi = 0; qi < queue.length; qi++) {
      var qn = queue[qi];
      var qnode = nodes[qn];
      if (!isPlainObject(qnode) || !Array.isArray(qnode.children)) continue;
      for (var qk = 0; qk < qnode.children.length; qk++) {
        var qc = qnode.children[qk];
        if (!isNonNegInt(qc) || qc >= n || depth[qc] !== -1) continue;
        depth[qc] = depth[qn] + 1;
        queue.push(qc);
      }
    }
    var depthReported = 0;
    for (i = 0; i < n; i++) {
      if (depth[i] > LIMITS.nodeDepth) {
        if (depthReported < 3) {
          issues.push(issue('E_NODE_DEPTH', SEV.ERROR,
            '节点 ' + i + ' 层级 ' + depth[i] + ' 超过上限 ' + LIMITS.nodeDepth, 'node/' + i));
          depthReported++;
        }
      }
    }

    return { parentOf: parentOf, depth: depth, cycleFound: cycleReported > 0, multiParentFound: multiParentReported > 0 };
  }

  // 默认场景访问顺序：只用它做统计；visited 保证遇到环也不会死循环
  function orderOfScene(nodes, roots) {
    var order = [];
    var seen = Object.create(null);
    var stack = [];
    for (var r = roots.length - 1; r >= 0; r--) stack.push(roots[r]);
    while (stack.length) {
      var idx = stack.pop();
      if (!isNonNegInt(idx) || idx >= nodes.length || seen[idx]) continue;
      var node = nodes[idx];
      if (!isPlainObject(node)) continue;
      seen[idx] = 1;
      order.push(idx);
      var ch = Array.isArray(node.children) ? node.children : [];
      for (var k = ch.length - 1; k >= 0; k--) {
        var c = ch[k];
        if (isNonNegInt(c) && c < nodes.length && !seen[c]) stack.push(c);
      }
    }
    return order;
  }

  // ───────────────────────────────────────────────
  // 世界矩阵（列主序，与 glTF 一致）
  // ───────────────────────────────────────────────
  function matrixFromTRS(t, r, s) {
    var x = r[0], y = r[1], z = r[2], w = r[3];
    var sx = s[0], sy = s[1], sz = s[2];
    var xx = x * x, yy = y * y, zz = z * z;
    var xy = x * y, xz = x * z, yz = y * z;
    var wx = w * x, wy = w * y, wz = w * z;
    return [
      (1 - 2 * (yy + zz)) * sx, 2 * (xy + wz) * sx, 2 * (xz - wy) * sx, 0,
      2 * (xy - wz) * sy, (1 - 2 * (xx + zz)) * sy, 2 * (yz + wx) * sy, 0,
      2 * (xz + wy) * sz, 2 * (yz - wx) * sz, (1 - 2 * (xx + yy)) * sz, 0,
      t[0], t[1], t[2], 1
    ];
  }

  function mulMatrix(a, b) {
    var out = new Array(16);
    for (var i = 0; i < 4; i++) {
      for (var j = 0; j < 4; j++) {
        var s = 0;
        for (var k = 0; k < 4; k++) s += a[k * 4 + j] * b[i * 4 + k];
        out[i * 4 + j] = s;
      }
    }
    return out;
  }

  function localMatrixOf(node) {
    if (Array.isArray(node.matrix) && node.matrix.length === 16) return node.matrix.slice();
    return matrixFromTRS(
      Array.isArray(node.translation) ? node.translation : [0, 0, 0],
      Array.isArray(node.rotation) ? node.rotation : [0, 0, 0, 1],
      Array.isArray(node.scale) ? node.scale : [1, 1, 1]
    );
  }

  function composeWorldMatrices(nodes, parentOf, issues) {
    var n = nodes.length;
    var world = new Array(n);
    var done = new Array(n);
    for (var i = 0; i < n; i++) { world[i] = null; done[i] = false; }

    for (var s = 0; s < n; s++) {
      if (done[s]) continue;
      var chain = [];
      var cur = s;
      var guard = 0;
      while (cur != null && cur >= 0 && !done[cur] && guard <= n) {
        chain.push(cur);
        var p = parentOf ? parentOf[cur] : -1;
        if (p === cur) break;              // 自环，交给环检测
        cur = (p == null ? -1 : p);
        guard++;
      }
      for (var k = chain.length - 1; k >= 0; k--) {
        var idx = chain[k];
        if (done[idx]) continue;
        var node = nodes[idx];
        var local = isPlainObject(node) ? localMatrixOf(node) : null;
        if (!local) { world[idx] = null; done[idx] = true; continue; }
        var par = parentOf ? parentOf[idx] : -1;
        var m = (par != null && par >= 0 && done[par] && world[par]) ? mulMatrix(world[par], local) : local;
        world[idx] = m;
        done[idx] = true;
      }
    }

    // 世界矩阵必须逐元素有限；否则任何下游包围盒/相机计算都不可信
    var reported = 0, skipped = Object.create(null);
    for (var wi = 0; wi < n; wi++) {
      var wm = world[wi];
      if (!wm) continue;
      var badAt = -1;
      for (var e = 0; e < 16; e++) {
        if (!isFiniteNumber(wm[e])) { badAt = e; break; }
      }
      if (badAt >= 0) {
        world[wi] = null;
        if (reported < 3) {
          issues.push(issue('E_WORLD_MATRIX_NON_FINITE', SEV.ERROR,
            'node ' + wi + ' 的世界矩阵第 ' + badAt + ' 项非有限（父子变换相乘后溢出），包围盒不可信',
            'node/' + wi));
          reported++;
        }
      }
    }
    return world;
  }


  // ───────────────────────────────────────────────
  // 数据段：真正读 BIN，验证索引范围、顶点有限性、世界变换有限性，并顺带算出
  // 精确世界包围盒（逐顶点变换）。
  //
  // 为什么包围盒放在这里而不是 inspect 里：
  //   否则会出现「准入 pass、但包围盒某个分量是 null」的自相矛盾状态。
  //   现在是：算不出来 / 溢出 → 直接 error，状态与数据不可能打架。
  // ───────────────────────────────────────────────
  function validateData(json, accInfo, binBytes, parentOf, nodeOrder, worldMatrices, issues) {
    var dv = new DataView(binBytes.buffer, binBytes.byteOffset, binBytes.byteLength);
    var meshes = Array.isArray(json.meshes) ? json.meshes : [];
    var nodes = Array.isArray(json.nodes) ? json.nodes : [];
    var posCache = Object.create(null);
    var meshLocal = new Array(meshes.length);
    var meshPosAcc = new Array(meshes.length);

    function readPos(ai) {
      if (posCache[ai] !== undefined) return posCache[ai];
      var info = accInfo[ai];
      var out = new Float32Array(info.count * 3);
      for (var k = 0; k < info.count; k++) {
        var base = info.offset + k * info.stride;
        out[k * 3] = dv.getFloat32(base, true);
        out[k * 3 + 1] = dv.getFloat32(base + 4, true);
        out[k * 3 + 2] = dv.getFloat32(base + 8, true);
      }
      posCache[ai] = out;
      return out;
    }

    // ① 逐 mesh：读顶点一次，验证有限性，算本地 AABB
    for (var mi = 0; mi < meshes.length; mi++) {
      var mesh = meshes[mi];
      if (!isPlainObject(mesh) || !Array.isArray(mesh.primitives)) { meshLocal[mi] = null; meshPosAcc[mi] = []; continue; }
      var lmin = [Infinity, Infinity, Infinity];
      var lmax = [-Infinity, -Infinity, -Infinity];
      var hasLocal = false;
      var accs = [];
      for (var pi = 0; pi < mesh.primitives.length; pi++) {
        var p = mesh.primitives[pi];
        if (!isPlainObject(p) || !isPlainObject(p.attributes) || p.attributes.POSITION == null) continue;
        var posIdx = p.attributes.POSITION;
        var pos = accInfo ? accInfo[posIdx] : null;
        if (!pos) continue;
        var tg = 'mesh/' + (mesh.name || mi) + '/prim/' + pi;
        accs.push(posIdx);

        var v = readPos(posIdx);
        var bad = 0;
        for (var k = 0; k < v.length; k += 3) {
          var x = v[k], y = v[k + 1], z = v[k + 2];
          if (!isFiniteNumber(x) || !isFiniteNumber(y) || !isFiniteNumber(z)) {
            if (bad < 3) {
              issues.push(issue('E_POSITION_NON_FINITE', SEV.ERROR,
                'POSITION 第 ' + (k / 3) + ' 个顶点含 NaN/Infinity，几何与世界包围盒不可信', tg));
              bad++;
            }
            continue;
          }
          hasLocal = true;
          if (x < lmin[0]) lmin[0] = x; if (x > lmax[0]) lmax[0] = x;
          if (y < lmin[1]) lmin[1] = y; if (y > lmax[1]) lmax[1] = y;
          if (z < lmin[2]) lmin[2] = z; if (z > lmax[2]) lmax[2] = z;
        }

        // 索引必须落在顶点数范围内
        if (p.indices != null) {
          var ia = accInfo ? accInfo[p.indices] : null;
          if (ia) {
            var reported = 0;
            for (var k2 = 0; k2 < ia.count; k2++) {
              var b2 = ia.offset + k2 * ia.stride;
              var iv = ia.componentType === 5121 ? dv.getUint8(b2)
                : ia.componentType === 5123 ? dv.getUint16(b2, true)
                  : dv.getUint32(b2, true);
              if (iv >= pos.count) {
                if (reported < 3) {
                  issues.push(issue('E_INDICES_OUT_OF_RANGE', SEV.ERROR,
                    '索引 ' + iv + ' >= POSITION.count ' + pos.count + '（第 ' + k2 + ' 个索引）', tg));
                  reported++;
                }
              }
            }
          }
        }
      }
      meshLocal[mi] = hasLocal ? { min: lmin, max: lmax } : null;
      meshPosAcc[mi] = accs;
    }

    // ② 逐实例：世界变换 + 结果有限性 + 精确/保守包围盒
    var world = { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] };
    var cons = { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] };
    var hasWorld = false, hasCons = false;
    var overflowReported = 0;
    var order = Array.isArray(nodeOrder) ? nodeOrder : [];

    for (var oi = 0; oi < order.length; oi++) {
      var nIdx = order[oi];
      var node = nodes[nIdx];
      if (!isPlainObject(node) || !isNonNegInt(node.mesh) || node.mesh >= meshes.length) continue;
      var mi2 = node.mesh;
      var w = worldMatrices ? worldMatrices[nIdx] : null;
      if (!w) continue;   // 世界矩阵非有限，已在合成阶段报错

      var accs2 = meshPosAcc[mi2] || [];
      for (var ai2 = 0; ai2 < accs2.length; ai2++) {
        var v2 = readPos(accs2[ai2]);
        for (var k3 = 0; k3 < v2.length; k3 += 3) {
          var vx = v2[k3], vy = v2[k3 + 1], vz = v2[k3 + 2];
          if (!isFiniteNumber(vx) || !isFiniteNumber(vy) || !isFiniteNumber(vz)) continue; // 已报
          var wx = w[0] * vx + w[4] * vy + w[8] * vz + w[12];
          var wy = w[1] * vx + w[5] * vy + w[9] * vz + w[13];
          var wz = w[2] * vx + w[6] * vy + w[10] * vz + w[14];
          if (!isFiniteNumber(wx) || !isFiniteNumber(wy) || !isFiniteNumber(wz)) {
            if (overflowReported < 3) {
              issues.push(issue('E_WORLD_POSITION_NON_FINITE', SEV.ERROR,
                'node ' + nIdx + ' 的第 ' + (k3 / 3) + ' 个顶点经世界变换后非有限（变换放大后溢出），精确包围盒不可信',
                'node/' + nIdx));
              overflowReported++;
            }
            continue;
          }
          if (wx < world.min[0]) world.min[0] = wx; if (wx > world.max[0]) world.max[0] = wx;
          if (wy < world.min[1]) world.min[1] = wy; if (wy > world.max[1]) world.max[1] = wy;
          if (wz < world.min[2]) world.min[2] = wz; if (wz > world.max[2]) world.max[2] = wz;
          hasWorld = true;
        }
      }

      var lb = meshLocal[mi2];
      if (lb) {
        for (var ci2 = 0; ci2 < 8; ci2++) {
          var cx = (ci2 & 1) ? lb.max[0] : lb.min[0];
          var cy = (ci2 & 2) ? lb.max[1] : lb.min[1];
          var cz = (ci2 & 4) ? lb.max[2] : lb.min[2];
          var cx2 = w[0] * cx + w[4] * cy + w[8] * cz + w[12];
          var cy2 = w[1] * cx + w[5] * cy + w[9] * cz + w[13];
          var cz2 = w[2] * cx + w[6] * cy + w[10] * cz + w[14];
          if (!isFiniteNumber(cx2) || !isFiniteNumber(cy2) || !isFiniteNumber(cz2)) continue;
          if (cx2 < cons.min[0]) cons.min[0] = cx2; if (cx2 > cons.max[0]) cons.max[0] = cx2;
          if (cy2 < cons.min[1]) cons.min[1] = cy2; if (cy2 > cons.max[1]) cons.max[1] = cy2;
          if (cz2 < cons.min[2]) cons.min[2] = cz2; if (cz2 > cons.max[2]) cons.max[2] = cz2;
          hasCons = true;
        }
      }
    }

    // 端点有限不代表派生范围有限：max-min 或 min+max 仍可能溢出。
    // Three.js 的 Box3.getCenter/getSize 使用同样运算，必须在加载前拦住。
    var boundSets = [{ name: 'computed', value: world, present: hasWorld },
      { name: 'conservative', value: cons, present: hasCons }];
    for (var bsi = 0; bsi < boundSets.length; bsi++) {
      var bs = boundSets[bsi];
      if (!bs.present) continue;
      for (var axis = 0; axis < 3; axis++) {
        var extent = bs.value.max[axis] - bs.value.min[axis];
        var center = (bs.value.min[axis] + bs.value.max[axis]) / 2;
        if (!isFiniteNumber(extent) || !isFiniteNumber(center)) {
          issues.push(issue('E_WORLD_BOUNDS_NON_FINITE', SEV.ERROR,
            bs.name + ' 包围盒轴 ' + axis + ' 的中心或范围计算溢出，无法可靠统计或预览',
            'bounds/' + bs.name));
          break;
        }
      }
    }

    return {
      computed: hasWorld ? { min: world.min, max: world.max } : null,
      conservative: hasCons ? { min: cons.min, max: cons.max } : null,
      meshLocal: meshLocal
    };
  }

  function truncate(s, n) { s = String(s); return s.length <= n ? s : s.slice(0, n) + '…'; }

  // ───────────────────────────────────────────────
  // 一站式：字节 → 是否准入
  // ───────────────────────────────────────────────
  function check(bytes) {
    var c = parseContainer(bytes);
    if (!c.ok) {
      return {
        status: c.status, fatal: true, issues: c.issues,
        json: null, byteLength: bytes.length,
        binOffset: 0, binLength: 0, binPresent: false,
        jsonChunkBytes: 0, binChunkBytes: 0,
        container: { magicOk: false, version: null, jsonChunkBytes: 0, binChunkBytes: 0, binPresent: false, externalReferences: [] },
        summary: null, parentOf: null, nodeOrder: null, defaultSceneIndex: null,
        accessors: null, bufferViews: null, worldBounds: null,
        support: SUPPORT
      };
    }
    var a = admit(c.json, c.binLength);
    var issues = c.issues.concat(a.issues);
    var status = a.status;
    if (status === 'pass') {
      // 容器段的 issue 若为 error，也必须降级
      for (var i = 0; i < c.issues.length; i++) {
        if (c.issues[i].severity === SEV.ERROR) { status = 'error'; break; }
      }
    }
    // 只有结构全过才读 BIN 做数据段校验（两端共用，避免浏览器与 CLI 结论分叉）
    var geom = null;
    if (status === 'pass' && a.accessors) {
      var dataIssues = [];
      geom = validateData(c.json, a.accessors, bytes.subarray(c.binOffset, c.binOffset + c.binLength),
        a.parentOf, a.nodeOrder, a.worldMatrices, dataIssues);
      if (dataIssues.length) {
        issues = issues.concat(dataIssues);
        status = 'error';
      }
    }
    return {
      status: status,
      fatal: status !== 'pass',
      issues: issues,
      json: c.json,
      byteLength: c.byteLength,
      binOffset: c.binOffset,
      binLength: c.binLength,
      binPresent: c.binPresent,
      jsonChunkBytes: c.jsonChunkBytes,
      binChunkBytes: c.binChunkBytes,
      container: c.container,
      summary: a.summary,
      parentOf: a.parentOf,
      nodeOrder: a.nodeOrder,
      defaultSceneIndex: a.defaultSceneIndex != null ? a.defaultSceneIndex : (a.summary ? a.summary.defaultSceneIndex : null),
      accessors: a.accessors,
      bufferViews: a.bufferViews,
      // 只有 pass 才给包围盒：不存在"通过准入但精确包围盒不可用"的状态
      worldBounds: status === 'pass' ? geom : null,
      support: SUPPORT
    };
  }

  function statusText(status) {
    if (status === 'pass') return '通过';
    if (status === 'unsupported') return '不支持';
    return '错误';
  }

  return {
    SUPPORT: SUPPORT,
    LIMITS: LIMITS,
    SEV: SEV,
    elementBytes: elementBytes,
    parseContainer: parseContainer,
    admit: admit,
    check: check,
    statusText: statusText,
    issue: issue
  };
});
