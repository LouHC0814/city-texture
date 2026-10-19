// 城市纹理 · 报告 HTML 渲染（v0.5.0）
// 离线可用、不依赖 CDN；status 三档（pass/error/unsupported）与 unknown 必须一眼可见
'use strict';

function fmtVec(v) {
  if (!Array.isArray(v)) return '—';
  return '[' + v.map(x => (typeof x === 'number' ? fmtNum(x) : '—')).join(', ') + ']';
}
function fmtNum(x) {
  if (typeof x !== 'number' || !isFinite(x)) return '—';
  const a = Math.abs(x);
  if (a !== 0 && (a < 1e-4 || a >= 1e7)) return x.toExponential(4);
  return x.toFixed(6).replace(/0+$/, '').replace(/\.$/, '');
}
function n(v) { return (v == null) ? '—' : v; }

function renderHTML(report, source) {
  const status = report.status || (report.fatal ? 'error' : 'pass');
  const cls = status === 'pass' ? 'ok' : (status === 'unsupported' ? 'warn' : 'fatal');
  const label = status === 'pass' ? '通过' : (status === 'unsupported' ? '不支持' : '错误');
  const issues = report.issues || [];
  const errs = issues.filter(i => i.severity === 'error');
  const unsup = issues.filter(i => i.severity === 'unsupported');
  const warns = issues.filter(i => i.severity === 'warning');

  const issueRows = issues.map(i =>
    `<tr class="${i.severity}"><td><code>${esc(i.code)}</code></td><td>${esc(i.severity)}</td><td>${esc(i.message)}</td><td><code>${esc(i.target || '')}</code></td></tr>`
  ).join('');

  const geo = report.geometry || {};
  const bd = report.bounds || {};
  const str = report.structure || null;
  const imgs = report.images || null;

  const sourceBlock = source
    ? `<h2>9. 来源 / 许可</h2><pre>${esc(JSON.stringify(source, null, 2))}</pre>
       <p class="note">来源字段只做原样展示，工具不验证真实性。</p>`
    : '';

  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8">
<title>${esc(report.input && report.input.name || 'GLB')} · 体检报告</title>
<style>
  body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Microsoft YaHei",sans-serif;max-width:1100px;margin:24px auto;padding:0 16px;color:#1c1c1c;line-height:1.55}
  h1{margin-bottom:4px}h2{border-bottom:2px solid #ddd;padding-bottom:4px;margin-top:30px;font-size:17px}
  .status{display:inline-block;padding:6px 14px;border-radius:6px;font-weight:700;margin-right:10px}
  .status.ok{background:#e3f4e0;color:#156c2d}.status.warn{background:#fff1c9;color:#7a5200}.status.fatal{background:#fde2e2;color:#a01919}
  table{border-collapse:collapse;width:100%;margin:8px 0}
  th,td{border:1px solid #ddd;padding:6px 8px;text-align:left;font-size:13px;vertical-align:top}
  th{background:#f4f4f4}
  code{background:#f4f4f4;padding:1px 5px;border-radius:3px;font-size:12px}
  .note{color:#777;font-size:12px}.row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
  .pill{background:#eef;padding:2px 8px;border-radius:10px;font-size:12px}
  pre{background:#f4f4f4;padding:8px;overflow-x:auto;border-radius:4px;font-size:12px}
  .warnbox{background:#fff8e6;border-left:4px solid #e0a800;padding:8px 12px;margin:8px 0;font-size:13px}
  tr.error td{background:#fff5f5}tr.unsupported td{background:#fffaf0}tr.warning td{background:#fffef5}
  .na{color:#aaa}
</style></head><body>
<h1>${esc(report.input && report.input.name || 'GLB')} · 体检报告</h1>
<p class="note">${esc((report.run && report.run.finishedAt) || '')} · ${n(report.run && report.run.durationMs)} ms · ${esc((report.run && report.run.tool) || '')} ${esc((report.run && report.run.toolVersion) || '')}</p>

<div class="row">
  <span class="status ${cls}">${label}</span>
  <span class="pill">status <code>${esc(status)}</code></span>
  <span class="pill">errors ${errs.length}</span>
  <span class="pill">unsupported ${unsup.length}</span>
  <span class="pill">warnings ${warns.length}</span>
  <span class="pill">bytes ${n(report.input && report.input.bytes)}</span>
  <span class="pill">sha256 <code>${esc(((report.input && report.input.sha256) || '—').slice(0, 16))}…</code></span>
</div>

${report.reason ? `<div class="warnbox"><b>未通过原因：</b>${esc(report.reason)}</div>` : ''}
${geo.unknown ? `<div class="warnbox"><b>几何指标不可用（unknown）：</b>${esc((geo.unknownReasons || []).join('、') || '未知原因')}<br>
  <span class="note">本节所有数值均未计算，报告不输出"看似可信"的数字。</span></div>` : ''}

<h2>1. 准入判定</h2>
<table><tr><th>项</th><th>值</th></tr>
<tr><td>status</td><td><code>${esc(status)}</code></td></tr>
<tr><td>fatal</td><td>${report.fatal ? 'true' : 'false'}</td></tr>
${report.admission ? `<tr><td>容器</td><td>${esc(report.admission.support.container)}</td></tr>
<tr><td>自包含</td><td>${esc(report.admission.support.selfContained)}</td></tr>
<tr><td>几何范围</td><td>${esc(report.admission.support.geometry)}</td></tr>
<tr><td>允许扩展</td><td>${report.admission.support.allowedExtensions.length === 0 ? '无（全部拒绝）' : esc(report.admission.support.allowedExtensions.join(', '))}</td></tr>
<tr><td>不支持特性</td><td>${esc(report.admission.support.rejectedFeatures.join('、'))}</td></tr>` : ''}
</table>

<h2>2. 容器</h2>
<table><tr><th>字段</th><th>值</th></tr>
<tr><td>magic / version</td><td>${esc(report.container && report.container.magicOk ? 'glTF' : '未通过')} / ${n(report.container && report.container.version)}</td></tr>
<tr><td>JSON chunk 字节</td><td>${n(report.container && report.container.jsonChunkBytes)}</td></tr>
<tr><td>BIN chunk 字节</td><td>${n(report.container && report.container.binChunkBytes)}</td></tr>
<tr><td>外部引用</td><td>${((report.container && report.container.externalReferences) || []).length === 0 ? '无' : '有'}</td></tr>
</table>

<h2>3. 结构</h2>
${str ? `<table><tr><th>字段</th><th>值</th></tr>
${Object.keys(str).map(k => `<tr><td>${esc(k)}</td><td>${n(str[k])}</td></tr>`).join('')}
</table>` : '<p class="na">未解析到结构数据</p>'}

<h2>4. 几何</h2>
<table><tr><th>字段</th><th>值</th></tr>
<tr><td>positionRecords</td><td>${geo.unknown ? '<span class="na">unknown</span>' : n(geo.positionRecords)}</td></tr>
<tr><td>uniqueGeometries</td><td>${geo.unknown ? '<span class="na">unknown</span>' : n(geo.uniqueGeometries)}</td></tr>
<tr><td>geometryTriangles</td><td>${geo.unknown ? '<span class="na">unknown</span>' : `<b>${n(geo.geometryTriangles)}</b>`}</td></tr>
<tr><td>sceneInstancesTriangles</td><td>${geo.unknown ? '<span class="na">unknown</span>' : `<b>${n(geo.sceneInstancesTriangles)}</b>`}</td></tr>
<tr><td>byMode</td><td>${geo.unknown ? '<span class="na">unknown</span>' : `<pre>${esc(JSON.stringify(geo.byMode || {}))}</pre>`}</td></tr>
<tr><td>meshGeometryTriangles</td><td>${geo.unknown ? '<span class="na">unknown</span>' : `<pre>${esc(JSON.stringify(geo.meshGeometryTriangles || []))}</pre>`}</td></tr>
<tr><td>meshInstanceCount</td><td>${geo.unknown ? '<span class="na">unknown</span>' : `<pre>${esc(JSON.stringify(geo.meshInstanceCount || []))}</pre>`}</td></tr>
</table>

<h2>5. 包围盒</h2>
${bd.computed ? `
<table><tr><th>类型</th><th>min</th><th>max</th><th>size</th></tr>
<tr><td><b>世界范围（逐顶点实算）</b></td><td>${fmtVec(bd.computed.min)}</td><td>${fmtVec(bd.computed.max)}</td><td>${fmtVec(bd.computed.size)}</td></tr>
<tr><td>保守 AABB（8 角点变换）</td><td>${fmtVec(bd.conservative && bd.conservative.min)}</td><td>${fmtVec(bd.conservative && bd.conservative.max)}</td><td>${fmtVec(bd.conservative && bd.conservative.size)}</td></tr>
</table>
<p class="note">${esc(bd.note || '')}</p>` : `<p class="na">${esc(bd.note || '未计算包围盒')}</p>`}
${bd.selfReported && Object.keys(bd.selfReported).length ? `
<p>本地空间：自报 min/max</p>
<table><tr><th>mesh</th><th>自报 min</th><th>自报 max</th></tr>
${Object.keys(bd.selfReported).map(k => `<tr><td>${esc(k)}</td><td>${fmtVec(bd.selfReported[k].min)}</td><td>${fmtVec(bd.selfReported[k].max)}</td></tr>`).join('')}
</table>` : ''}

<h2>6. 材质</h2>
${report.materials ? `<pre>${esc(JSON.stringify(report.materials))}</pre>` : '<p class="na">—</p>'}

<h2>7. 图片</h2>
${imgs ? `<table><tr><th>index</th><th>mime</th><th>width</th><th>height</th><th>bytes</th><th>refCount</th></tr>
${(imgs.list || []).map(im => `<tr><td>${im.index}</td><td>${esc(im.mime)}</td><td>${n(im.width)}</td><td>${n(im.height)}</td><td>${n(im.bytes)}</td><td>${n(im.refCount)}</td></tr>`).join('') || '<tr><td colspan="6">无</td></tr>'}
</table><p class="note">byMime <code>${esc(JSON.stringify(imgs.byMime || {}))}</code> · uniqueImageCount=${n(imgs.uniqueImageCount)}</p>`
    : '<p class="na">未读取（准入未通过）</p>'}

<h2>8. 扩展</h2>
<pre>${esc(JSON.stringify(report.extensions || { used: [], required: [] }))}</pre>

${sourceBlock}

<h2>问题清单（${issues.length}）</h2>
${issues.length === 0 ? '<p>无问题。</p>' :
    `<table><tr><th>code</th><th>severity</th><th>message</th><th>target</th></tr>${issueRows}</table>`}

<p class="note">同批次产物：<code>${esc((report.input && report.input.name || '') + '.gltf-inspect.json')}</code> / <code>.issues.json</code></p>
</body></html>`;
}

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

module.exports = { renderHTML };
