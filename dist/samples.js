/* 离线样本包：只解析 JSON，验证后重建允许字段，不执行输入内容。 */
(function (root) {
  'use strict';
  const C = typeof module === 'object' && module.exports ? require('./core.js') : root.CityCore;
  const FORMAT = 'city-texture-sample', MAX_BYTES = 8 * 1024 * 1024, MAX_CUSTOM = 3;
  function invalid(message) { throw new Error(message); }
  function object(value, label) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) invalid(`${label}格式无效`);
    return value;
  }
  function text(value, label, max = 80, multiline = false) {
    if (typeof value !== 'string' || !value.trim() || value.length > max || (multiline ? /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/ : /[\x00-\x1f\x7f]/).test(value)) invalid(`${label}无效或过长`);
    return value.trim();
  }
  function url(value, label) {
    const result = text(value, label, 500);
    try { const u = new URL(result); if (!['https:', 'http:'].includes(u.protocol) || u.username || u.password) invalid('url'); }
    catch (_) { invalid(`${label}须为不含账号密码的 HTTP(S) 地址`); }
    return result;
  }
  function source(value) {
    const s = object(value, '来源');
    if (s.name !== 'OpenStreetMap contributors' || s.license !== 'ODbL-1.0') invalid('此版本仅支持注明 OpenStreetMap contributors / ODbL-1.0 的样本');
    const fetchedAt = text(s.fetchedAt, '抓取时间', 50);
    if (!/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(fetchedAt) || !Number.isFinite(Date.parse(fetchedAt))) invalid('抓取时间须包含日期、时间和时区');
    if (typeof s.rawSha256 !== 'string' || !/^[a-f0-9]{64}$/i.test(s.rawSha256)) invalid('缺少原始数据 SHA-256');
    return { name: s.name, license: s.license, url: url(s.url, '来源地址'), endpoint: url(s.endpoint, '数据接口'),
      query: text(s.query, '原始查询', 12000, true), fetchedAt, rawSha256: s.rawSha256.toLowerCase(),
      snapshotToken: text(s.snapshotToken, '接口快照标识', 100), limitations: text(s.limitations, '数据限制', 2000, true) };
  }
  function validateSample(value) {
    const pack = object(value, '样本包');
    if (pack.format !== FORMAT || pack.version !== 1) invalid('请选择城市纹理样本包 v1（不是统计报告、GeoJSON 或原始 Overpass 文件）');
    const raw = object(pack.city, '城区'), data = object(pack.buildings, '建筑');
    if (typeof raw.id !== 'string' || !/^[a-z][a-z0-9-]{0,47}$/.test(raw.id) || ['constructor', 'prototype'].includes(raw.id)) invalid('样本 ID 须为小写字母开头的字母、数字或短横线，最多 48 字符');
    if (!Number.isFinite(raw.lon) || Math.abs(raw.lon) > 180 || !Number.isFinite(raw.lat) || Math.abs(raw.lat) > 85) invalid('样本中心须为有效经纬度，纬度在 ±85° 内');
    if (typeof raw.color !== 'string' || !/^#[a-f0-9]{6}$/i.test(raw.color)) invalid('样本颜色须为六位十六进制色值');
    const city = { id: raw.id, name: text(raw.name, '城市名', 24), english: text(raw.english, '外文名', 48),
      district: text(raw.district, '城区名', 60), country: text(raw.country, '国家或地区', 32), lat: raw.lat, lon: raw.lon, color: raw.color };
    function bbox(value) {
      if (!Array.isArray(value) || value.length !== 4 || !value.every(Number.isFinite) || value[0] < -85 || value[2] > 85 || value[1] < -180 || value[3] > 180 || value[0] >= value[2] || value[1] >= value[3]) invalid('下载框须为有效的 [南纬度, 西经度, 北纬度, 东经度]');
      const lower = C.project(value[1], value[0], city), upper = C.project(value[3], value[2], city);
      if (lower.some(v => v > -0.501001) || upper.some(v => v < 0.501001)) invalid('道路和建筑下载框均须在中心四周覆盖至少 501.001 米');
      if (upper[0] - lower[0] > 20 || upper[1] - lower[1] > 20) invalid('此版本下载框宽高各不能超过 20 公里');
      return [...value];
    }
    city.bbox = bbox(raw.bbox); city.source = source(raw.source);
    let points = 0;
    function point(value) {
      if (++points > 200000) invalid('样本坐标总数不能超过 200,000');
      if (!Array.isArray(value) || value.length !== 2 || !value.every(Number.isFinite) || Math.abs(value[0]) > 180 || Math.abs(value[1]) > 85) invalid('坐标须为有效的 [经度, 纬度]');
      if (C.project(...value, city).some(v => Math.abs(v) > 25)) invalid('坐标须位于样本中心东/北各 25 公里内');
      return [...value];
    }
    if (!Array.isArray(raw.roads) || !raw.roads.length || raw.roads.length > 15000) invalid('道路数量须为 1–15,000');
    const ways = new Set(), nodes = new Map();
    city.roads = raw.roads.map(r => {
      object(r, '道路');
      if (!Number.isSafeInteger(r.id) || r.id <= 0 || ways.has(r.id)) invalid('OSM 道路 ID 须为不重复的正安全整数');
      ways.add(r.id);
      if (typeof r.type !== 'string' || !/^[a-z_]{1,40}$/.test(r.type)) invalid('道路类型无效');
      if (!Array.isArray(r.points) || r.points.length < 2 || r.points.length > 4096 || !Array.isArray(r.nodes) || r.nodes.length !== r.points.length) invalid('道路节点与坐标须一一对应，每条 2–4,096 个点');
      const coordinates = r.points.map(point);
      const ids = r.nodes.map((id, i) => {
        if (!Number.isSafeInteger(id) || id <= 0) invalid('OSM 节点 ID 须为正安全整数');
        const previous = nodes.get(id), p = coordinates[i];
        if (previous && previous.some((v, axis) => v !== p[axis])) invalid('同一 OSM 节点出现了不同坐标');
        nodes.set(id, p); return id;
      });
      return { id: r.id, type: r.type, nodes: ids, points: coordinates };
    });
    if (!city.roads.some(r => C.DRIVING.has(r.type) || C.WALKING.has(r.type))) invalid('样本中没有受支持的道路类型');
    if (data.cityId !== city.id) invalid('建筑 cityId 与样本 ID 不一致');
    if (!Array.isArray(data.features) || data.features.length > 10000) invalid('建筑轮廓要素不能超过 10,000');
    const featureIds = new Set();
    const features = data.features.map(f => {
      object(f, '建筑要素');
      if (typeof f.id !== 'string' || !/^(?:way|relation)\/[1-9]\d{0,15}$/.test(f.id) || featureIds.has(f.id)) invalid('建筑 ID 须为不重复的 way/数字 或 relation/数字');
      featureIds.add(f.id);
      if (!Array.isArray(f.outers) || !f.outers.length || !Array.isArray(f.inners) || f.outers.length + f.inners.length > 128) invalid('建筑外环、内环格式无效或过多');
      let featurePoints = 0;
      function ring(r) {
        if (!Array.isArray(r) || r.length < 4 || r.length > 4096 || (featurePoints += r.length) > 8192) invalid('建筑环须有 4–4,096 个点，单要素总点数不超过 8,192');
        const p = r.map(point);
        if (p[0][0] !== p.at(-1)[0] || p[0][1] !== p.at(-1)[1]) invalid('建筑轮廓必须闭合');
        if (C.ringArea(p.map(q => C.project(...q, city))) <= 1e-12) invalid('建筑轮廓面积须大于零');
        return p;
      }
      return { id: f.id, outers: f.outers.map(ring), inners: f.inners.map(ring), kind: text(f.kind, '建筑类型', 80) };
    });
    const conversion = object(data.conversion, '转换记录');
    if (!Array.isArray(conversion.skipped) || conversion.skipped.length > 10000) invalid('跳过记录格式无效或过多');
    // 保留转换器原本的跳过记录结构，同时限制其文本大小。
    const skipped = conversion.skipped.map(entry => {
      if (typeof entry === 'string') return text(entry, '跳过记录', 500);
      object(entry, '跳过记录'); return { id: text(entry.id, '跳过要素 ID', 80), reason: text(entry.reason, '跳过原因', 500) };
    });
    const buildings = { cityId: city.id, bbox: bbox(data.bbox), features, source: source(data.source),
      conversion: { featureCount: features.length, relations: features.filter(f => f.id.startsWith('relation/')).length,
        innerRings: features.reduce((n, f) => n + f.inners.length, 0), skipped } };
    // 所有标准尺度都必须可用；建筑和道路各自的下载框都参与约束。
    C.panBounds([city, { ...city, bbox: buildings.bbox }], 1);
    return { format: FORMAT, version: 1, city, buildings };
  }
  function parseSample(input) {
    if (typeof input !== 'string' || new TextEncoder().encode(input).byteLength > MAX_BYTES) invalid('样本包不能超过 8 MiB');
    let value; try { value = JSON.parse(input.replace(/^\uFEFF/, '')); } catch (_) { invalid('文件不是有效的 JSON 样本包'); }
    return validateSample(value);
  }
  const api = { FORMAT, MAX_BYTES, MAX_CUSTOM, validateSample, parseSample };
  if (typeof module === 'object' && module.exports) module.exports = api; else root.CitySamples = api;
})(globalThis);
