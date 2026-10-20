/* 三维视角文件：保存当前经典建筑 3D 的相机位置、观察目标、投影参数与线框状态。
   应用前严格校验，不支持跨模型，不接受损坏或越界输入；不依赖当前展台状态。 */
(function (root) {
  'use strict';
  const FORMAT = 'city-texture-view', VERSION = 1;
  // 文件只保存几个三元组与四个数值，16 KiB 足够且能阻止恶意大文件。
  const MAX_BYTES = 16 * 1024;
  // 已知模型：写入时把当前模型 ID 与作者/许可一起核验；跨模型视角禁止共用，避免错位到不同形状上。
  const KNOWN_MODELS = Object.assign(Object.create(null), {
    'eiffel-tower': { author: 'SDC', license: 'CC-BY-4.0', label: '埃菲尔铁塔' }
  });
  function registerModel(id, metadata) {
    if (typeof id !== 'string' || !/^local-[a-f0-9]{64}$/.test(id)) invalid('本地模型标识必须包含文件 SHA-256');
    if (!metadata || !['author', 'license', 'label'].every(key => typeof metadata[key] === 'string' && metadata[key].length > 0 && metadata[key].length <= 160)) invalid('模型署名信息无效');
    KNOWN_MODELS[id] = Object.freeze({ author: metadata.author, license: metadata.license, label: metadata.label });
  }
  function unregisterModel(id) { if (id !== 'eiffel-tower') delete KNOWN_MODELS[id]; }
  const VALID_PRESETS = ['iso', 'front', 'top', 'custom'];
  function invalid(message) { throw new Error(message); }
  function isFiniteNumber(value) { return typeof value === 'number' && Number.isFinite(value); }
  function checkTriple(name, value) {
    if (!Array.isArray(value) || value.length !== 3) invalid(`视角${name}必须是三元数组`);
    for (let i = 0; i < 3; i++) {
      if (!isFiniteNumber(value[i])) invalid(`视角${name}包含非有限数值`);
      if (Math.abs(value[i]) > 1e4) invalid(`视角${name}数值超出 ±10000 范围`);
    }
  }
  function checkNumber(name, value, min, max) {
    if (!isFiniteNumber(value)) invalid(`视角${name}必须为有限数值`);
    if (value < min || value > max) invalid(`视角${name}超出 ${min}–${max} 范围`);
  }
  function validateView(value, knownModels = KNOWN_MODELS) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) invalid('文件不是有效的三维视角');
    // 顶层字段同样严格白名单，避免悄悄接受带附加属性的对象。
    const topAllowed = ['format', 'version', 'modelId', 'view', 'wireframe'];
    for (const key of Object.keys(value)) if (!topAllowed.includes(key)) invalid('视角文件包含未知字段：' + key);
    if (value.format !== FORMAT) invalid('请使用城市纹理三维视角文件格式（不是比较项目或样本包）');
    if (value.version !== VERSION) invalid('三维视角文件版本不匹配，请使用当前版本的程序');
    const model = typeof value.modelId === 'string' && Object.hasOwn(knownModels, value.modelId) && knownModels[value.modelId];
    if (!model) invalid('视角对应的模型与当前展台不一致，三维视角不能跨模型使用');
    if (!value.view || typeof value.view !== 'object' || Array.isArray(value.view)) invalid('视角数据缺失或结构错误');
    const view = value.view;
    // 严格白名单：拒绝任何未声明字段，避免悄悄接受未知结构。
    const allowed = ['view', 'camera', 'target', 'fov', 'near', 'far'];
    for (const key of Object.keys(view)) if (!allowed.includes(key)) invalid('视角数据包含未知字段：' + key);
    if (view.view !== undefined && !VALID_PRESETS.includes(view.view)) invalid('视角预设名称必须为 iso/front/top/custom 之一');
    checkTriple('相机位置', view.camera);
    checkTriple('观察目标', view.target);
    const dx = view.camera[0] - view.target[0], dy = view.camera[1] - view.target[1], dz = view.camera[2] - view.target[2];
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (distance < 1) invalid('视角相机过于接近观察目标，无法恢复构图');
    if (distance > 1e4) invalid('视角相机与目标距离超过 10000');
    checkNumber('FOV', view.fov, 10, 90);
    checkNumber('near', view.near, 1e-3, 10);
    // 远裁剪面必须越过目标：相机到目标距离在目标之后都应可见，否则模型必然被裁掉。
    if (view.far < distance) invalid('视角远裁剪面小于相机到观察目标距离，模型无法完整显示');
    checkNumber('far', view.far, view.near + 0.1, 10000);
    if (value.wireframe !== undefined && typeof value.wireframe !== 'boolean') invalid('视角线框字段必须是布尔值');
    return {
      modelId: value.modelId, wireframe: Boolean(value.wireframe),
      view: { view: view.view || 'custom', camera: view.camera.slice(), target: view.target.slice(),
        fov: view.fov, near: view.near, far: view.far, distance }
    };
  }
  function parseView(input, knownModels = KNOWN_MODELS) {
    if (typeof input !== 'string') invalid('视角文件必须是字符串');
    const stripped = input.replace(/^\uFEFF/, '');
    const bytes = new TextEncoder().encode(stripped).byteLength;
    if (bytes > MAX_BYTES) invalid(`视角文件不能超过 ${MAX_BYTES} 字节`);
    let value; try { value = JSON.parse(stripped); } catch (_) { invalid('文件不是有效的 JSON 视角文件'); }
    return validateView(value, knownModels);
  }
  function createView(modelId, view, wireframe) {
    if (!Object.hasOwn(KNOWN_MODELS, modelId)) invalid('当前模型尚未注册到三维视角文件');
    const value = {
      format: FORMAT, version: VERSION, modelId, wireframe: Boolean(wireframe),
      view: { view: view.view || 'custom', camera: view.camera.slice(), target: view.target.slice(),
        fov: view.fov, near: view.near, far: view.far }
    };
    validateView(value);
    const json = JSON.stringify(value);
    if (new TextEncoder().encode(json).byteLength > MAX_BYTES) invalid(`视角文件不能超过 ${MAX_BYTES} 字节`);
    return value;
  }
  const api = { FORMAT, VERSION, MAX_BYTES, KNOWN_MODELS, VALID_PRESETS, validateView, parseView, createView, registerModel, unregisterModel };
  if (typeof module === 'object' && module.exports) module.exports = api; else root.CityView = api;
})(globalThis);
