/* 比较项目：完整样本和视图一起保存，校验成功后由界面一次应用。 */
(function (root) {
  'use strict';
  const C = typeof module === 'object' && module.exports ? require('./core.js') : root.CityCore;
  const S = typeof module === 'object' && module.exports ? require('./samples.js') : root.CitySamples;
  const FORMAT = 'city-texture-project', MAX_BYTES = 32 * 1024 * 1024, MAX_SAMPLES = S.MAX_CUSTOM + 2;
  function invalid(message) { throw new Error(message); }
  function validateProject(value, builtins) {
    if (!value || value.format !== FORMAT || value.version !== 1) invalid('请选择城市纹理比较项目文件（不是统计报告或单个样本包）');
    if (!Array.isArray(value.samples) || !value.samples.length || value.samples.length > MAX_SAMPLES) invalid('比较项目须包含 1–5 份样本');
    const known = new Map(builtins.map(pack => [pack.city.id, pack])), ids = new Set();
    const samples = value.samples.map(raw => {
      // 单份仍使用同一套 8 MiB、几何、来源和资源数量校验。
      const pack = S.parseSample(JSON.stringify(raw)), id = pack.city.id;
      if (ids.has(id)) invalid('比较项目中有重复的样本 ID');
      ids.add(id);
      if (known.has(id) && JSON.stringify(pack) !== JSON.stringify(S.validateSample(known.get(id)))) {
        invalid('项目中的内置样本与当前程序不一致，请使用保存时的程序版本，或为修改过的样本使用独立 ID');
      }
      return pack;
    });
    const customSamples = samples.filter(pack => !known.has(pack.city.id));
    if (customSamples.length > S.MAX_CUSTOM) invalid('比较项目最多包含 3 份导入样本');
    // 左右样本必须真实包含在文件中，不能从当前页面的导入状态补齐。
    const state = C.parseView(value.view, [...ids]);
    const selected = [state.left, state.right].map(id => samples.find(pack => pack.city.id === id));
    state.offset = C.clampOffset(state.offset, C.panBounds(selected.flatMap(pack => [pack.city, { ...pack.city, bbox: pack.buildings.bbox }]), state.side));
    return { project: { format: FORMAT, version: 1, view: C.stateHash(state), samples }, state, customSamples };
  }
  function parseProject(input, builtins) {
    if (typeof input !== 'string' || new TextEncoder().encode(input).byteLength > MAX_BYTES) invalid('比较项目不能超过 32 MiB');
    let value; try { value = JSON.parse(input.replace(/^\uFEFF/, '')); } catch (_) { invalid('文件不是有效的 JSON 比较项目'); }
    return validateProject(value, builtins);
  }
  function createProject(state, customSamples, builtins) {
    const selected = new Set([state.left, state.right]);
    const value = { format: FORMAT, version: 1, view: C.stateHash(state),
      samples: [...builtins.filter(pack => selected.has(pack.city.id)), ...customSamples] };
    const result = validateProject(value, builtins).project;
    if (new TextEncoder().encode(JSON.stringify(result)).byteLength > MAX_BYTES) invalid('比较项目不能超过 32 MiB');
    return result;
  }
  const api = { FORMAT, MAX_BYTES, MAX_SAMPLES, validateProject, parseProject, createProject };
  if (typeof module === 'object' && module.exports) module.exports = api; else root.CityProjects = api;
})(globalThis);
