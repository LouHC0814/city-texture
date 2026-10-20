// 建筑工作台的数据边界；Node 检查和浏览器打包共用，不依赖 DOM 或服务器。
'use strict';
const admission = require('../tools/模型体检/lib/gltf-admission.js');
const LIMITS = Object.freeze({ file: 8 * 1024 * 1024, total: 16 * 1024 * 1024, count: 3, project: 24 * 1024 * 1024, images: 16, dimension: 4096, pixels: 16 * 1024 * 1024 });
const FORMAT = 'city-texture-model-workspace';
function fail(message) { throw new Error(message); }
function text(value, fallback, max) {
  if (value === undefined || value === '') return fallback;
  if (typeof value !== 'string' || value.length > max || /[\u0000-\u001f\u007f]/.test(value)) fail('建筑资料包含超长或无效文字');
  return value.trim() || fallback;
}
function metadata(value = {}) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail('建筑资料格式无效');
  const result = { name: text(value.name, '本地建筑', 80), place: text(value.place, '本地模型', 80),
    author: text(value.author, '未声明作者', 100), license: text(value.license, '未声明许可', 100),
    source: text(value.source, '', 500), note: text(value.note, '本地导入；模型身份、署名与许可由提供者声明，展示缩放不用于测量。', 600) };
  if (result.source) {
    let url; try { url = new URL(result.source); } catch { fail('来源链接必须是完整的 HTTPS 地址'); }
    if (url.protocol !== 'https:' || url.username || url.password) fail('来源链接必须是无账号信息的 HTTPS 地址');
    result.source = url.href;
  }
  return result;
}
function quota(entries, candidate) {
  const list = [...entries];
  if (candidate) {
    if (list.some(item => item.id === candidate.id)) fail('这份模型已经在工作台中');
    list.push(candidate);
  }
  if (list.length > LIMITS.count) fail('最多同时加入 3 份本地模型');
  if (list.reduce((sum, item) => sum + item.bytes.byteLength, 0) > LIMITS.total) fail('本地模型总量不能超过 16 MiB');
}
async function inspect(input, info) {
  if (!(input instanceof Uint8Array) || input.byteLength === 0 || input.byteLength > LIMITS.file) fail('请选择不超过 8 MiB 的自包含 GLB 文件');
  const bytes = input.slice(), checked = admission.check(bytes);
  if (checked.status !== 'pass') {
    const issue = checked.issues.find(item => item.severity === 'error' || item.severity === 'unsupported');
    fail(`模型无法加入：${issue?.message || checked.status}`);
  }
  const images = checked.json.images || [];
  if (images.length > LIMITS.images) fail('每份模型最多包含 16 张图片');
  let pixels = 0;
  for (const image of images) {
    let content, declared = image.mimeType;
    if (typeof image.uri === 'string') {
      if (image.bufferView !== undefined) fail('模型图片不能同时声明两种来源');
      const header = /^data:(image\/(?:png|jpeg));base64,/i.exec(image.uri);
      if (!header) fail('模型图片必须是内嵌 PNG/JPEG');
      content = fromBase64(image.uri.slice(header[0].length));
      if (declared && declared !== header[1].toLowerCase()) fail('图片类型声明与实际内容不符');
      declared = header[1].toLowerCase();
    } else {
      const view = checked.json.bufferViews[image.bufferView], start = checked.binOffset + (view.byteOffset || 0);
      content = bytes.subarray(start, start + view.byteLength);
    }
    const dimensions = imageDimensions(content);
    if (declared && declared !== dimensions.mime) fail('图片类型声明与实际内容不符');
    if (dimensions.width > LIMITS.dimension || dimensions.height > LIMITS.dimension) fail('单张贴图不能超过 4096 × 4096');
    pixels += dimensions.width * dimensions.height;
    if (pixels > LIMITS.pixels) fail('单份模型贴图总像素不能超过 16 Mi 像素');
  }
  const bounds = checked.worldBounds?.computed;
  if (!bounds || !bounds.min.every(Number.isFinite) || !bounds.max.every(Number.isFinite) || !bounds.max.some((n, i) => n > bounds.min[i])) fail('模型没有可观察的有限三维范围');
  let triangles = 0;
  for (const mesh of checked.json.meshes || []) for (const primitive of mesh.primitives) {
    const n = checked.json.accessors[primitive.indices ?? primitive.attributes.POSITION].count;
    triangles += primitive.mode === 5 || primitive.mode === 6 ? Math.max(0, n - 2) : primitive.mode === undefined || primitive.mode === 4 ? Math.floor(n / 3) : 0;
  }
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  const sha256 = Array.from(new Uint8Array(digest), x => x.toString(16).padStart(2, '0')).join('');
  return { ...metadata(info), id: 'local-' + sha256, sha256, bytes, triangles,
    copyright: typeof checked.json.asset.copyright === 'string' ? checked.json.asset.copyright.slice(0, 600) : '',
    builtin: false, warnings: checked.issues.filter(issue => issue.severity === 'warning').length };
}
function imageDimensions(bytes) {
  const data = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (bytes.length >= 24 && [137, 80, 78, 71, 13, 10, 26, 10].every((value, i) => bytes[i] === value) && data.getUint32(12) === 0x49484452) {
    const width = data.getUint32(16), height = data.getUint32(20);
    if (width && height) return { width, height, mime: 'image/png' };
  } else if (bytes.length > 4 && bytes[0] === 255 && bytes[1] === 216) {
    let offset = 2;
    while (offset + 3 < bytes.length) {
      if (bytes[offset++] !== 255) break;
      while (bytes[offset] === 255) offset++;
      const marker = bytes[offset++];
      if (marker === 0xd9 || marker === 0xda) break;
      if (marker === 1 || marker >= 0xd0 && marker <= 0xd7) continue;
      if (offset + 2 > bytes.length) break;
      const length = data.getUint16(offset);
      if (length < 2 || offset + length > bytes.length) break;
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker) && length >= 8) {
        const height = data.getUint16(offset + 3), width = data.getUint16(offset + 5);
        if (width && height) return { width, height, mime: 'image/jpeg' };
      }
      offset += length;
    }
  }
  fail('图片头无效，无法核对解码尺寸');
}
function toBase64(bytes) {
  let binary = ''; for (let i = 0; i < bytes.length; i += 32768) binary += String.fromCharCode(...bytes.subarray(i, i + 32768));
  return btoa(binary);
}
function fromBase64(value) {
  if (typeof value !== 'string' || value.length > Math.ceil(LIMITS.file / 3) * 4 || value.length % 4 || /[^A-Za-z0-9+/=]/.test(value)) fail('工作台内的模型编码无效或超过上限');
  let binary; try { binary = atob(value); } catch { fail('工作台内的模型编码无效'); }
  const bytes = Uint8Array.from(binary, x => x.charCodeAt(0));
  if (toBase64(bytes) !== value) fail('工作台模型编码不规范');
  return bytes;
}
function registry(entries, builtin) {
  const result = Object.create(null); result[builtin.id] = builtin;
  for (const entry of entries) result[entry.id] = entry;
  return result;
}
function checkViews(raw, entries, builtin, V) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw) || Object.keys(raw).length > LIMITS.count + 1) fail('工作台视角列表无效');
  const known = registry(entries, builtin), result = new Map();
  for (const [id, value] of Object.entries(raw)) {
    if (!Object.hasOwn(known, id) || value?.modelId !== id) fail('工作台视角与对应模型不一致');
    V.validateView(value, known); result.set(id, value);
  }
  return result;
}
function serialize(entries, views, activeId, builtin, V) {
  quota(entries);
  if (!Object.hasOwn(registry(entries, builtin), activeId)) fail('当前建筑不在工作台内');
  const rawViews = Object.fromEntries(views); checkViews(rawViews, entries, builtin, V);
  const models = entries.map(entry => ({ id: entry.id, metadata: metadata(entry), data: toBase64(entry.bytes) }));
  const output = JSON.stringify({ format: FORMAT, version: 1, activeId, models, views: rawViews });
  if (new TextEncoder().encode(output).byteLength > LIMITS.project) fail('工作台文件超过 24 MiB');
  return output;
}
async function parse(input, builtin, V) {
  if (typeof input !== 'string' || new TextEncoder().encode(input).byteLength > LIMITS.project) fail('工作台文件不能超过 24 MiB');
  let raw; try { raw = JSON.parse(input.replace(/^\uFEFF/, '')); } catch { fail('工作台不是有效 JSON'); }
  if (!raw || raw.format !== FORMAT || raw.version !== 1) fail('请选择城市纹理建筑工作台文件，不能使用比较项目或单独视角');
  if (Object.keys(raw).some(key => !['format', 'version', 'activeId', 'models', 'views'].includes(key))) fail('工作台包含未知字段');
  if (!Array.isArray(raw.models) || raw.models.length > LIMITS.count) fail('工作台最多包含 3 份本地模型');
  const entries = [];
  for (const model of raw.models) {
    if (!model || typeof model !== 'object') fail('工作台模型结构无效');
    const bytes = fromBase64(model.data);
    // 在完整检查前先限制累积字节数，避免大包反复分配。
    quota(entries, { id: model.id, bytes });
    const entry = await inspect(bytes, model.metadata);
    if (entry.id !== model.id) fail('模型校验值与工作台记录不符');
    entries.push(entry);
  }
  const known = registry(entries, builtin);
  if (typeof raw.activeId !== 'string' || !Object.hasOwn(known, raw.activeId)) fail('工作台选中的建筑不存在');
  const views = checkViews(raw.views, entries, builtin, V);
  return { entries, views, activeId: raw.activeId };
}
module.exports = { LIMITS, FORMAT, metadata, quota, inspect, serialize, parse };
