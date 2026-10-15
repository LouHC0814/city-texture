(function () {
  'use strict';
  const C = window.CityCore, cities = window.CITY_DATA || [], $ = id => document.getElementById(id);
  let noticeTimer;
  function notice(message, persistent = false) { clearTimeout(noticeTimer); $('status').textContent = message; if (!persistent) noticeTimer = setTimeout(() => { $('status').textContent = ''; }, 4500); }
  if (!C || cities.length < 2) { notice('城区数据加载失败。请完整解压项目后打开 dist/index.html，或使用单文件预览版。', true); return; }
  const ids = cities.map(c => c.id), byId = Object.fromEntries(cities.map(c => [c.id, c]));
  let state = C.readState(location.hash, ids), prepared, results = {}, limits, drag = null, panFrame;
  try { prepared = Object.fromEntries(cities.map(c => [c.id, C.prepare(c)])); }
  catch (error) { notice('地图数据无法解析：' + error.message, true); return; }
  const fixed = (v, digits = 2) => v.toFixed(digits);
  const date = city => new Date(city.source.fetchedAt).toISOString().slice(0, 10);
  const describe = r => {
    if (!r.lengthKm) return '当前筛选下没有道路。';
    const bin = r.bins.indexOf(Math.max(...r.bins)), start = bin * 10;
    return `最长的一组方向位于 ${start}–${start + 10}°（从北顺时针，反向合并）。`;
  };
  function context(canvas, logicalSize) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(logicalSize * dpr); canvas.height = Math.round(logicalSize * dpr);
    const ctx = canvas.getContext('2d'); ctx.scale(dpr, dpr); return ctx;
  }
  function drawMap(ctx, size, result, color) {
    ctx.save(); ctx.fillStyle = '#f2f3e8'; ctx.fillRect(0, 0, size, size);
    const scale = size / result.sideKm, mid = size / 2;
    ctx.strokeStyle = '#dfe3d5'; ctx.lineWidth = 0.55;
    for (let t = 1; t < 8; t++) { const p = size * t / 8; ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, size); ctx.moveTo(0, p); ctx.lineTo(size, p); ctx.stroke(); }
    const groups = [
      { test: t => C.WALKING.has(t), width: 0.65, alpha: 0.4, dash: [2.2, 2.1] },
      { test: t => ['residential', 'unclassified', 'living_street', 'service'].includes(t), width: 1.05, alpha: 0.65, dash: [] },
      { test: t => C.DRIVING.has(t) && !['residential', 'unclassified', 'living_street', 'service'].includes(t), width: 2, alpha: 0.9, dash: [] }
    ];
    ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.strokeStyle = color;
    for (const group of groups) {
      ctx.beginPath();
      for (const segment of result.segments) if (group.test(segment.type)) {
        ctx.moveTo(mid + segment.a[0] * scale, mid - segment.a[1] * scale);
        ctx.lineTo(mid + segment.b[0] * scale, mid - segment.b[1] * scale);
      }
      ctx.lineWidth = group.width * Math.max(0.75, size / 500); ctx.globalAlpha = group.alpha; ctx.setLineDash(group.dash); ctx.stroke();
    }
    ctx.globalAlpha = 1; ctx.setLineDash([]);
    // 北箭头与比例尺直接绘入图像，导出时仍保留。
    ctx.fillStyle = '#f2f3e8ed'; ctx.fillRect(size - 44, 9, 34, 55);
    ctx.fillStyle = '#5e6e5e'; ctx.font = '10px Consolas,monospace'; ctx.textAlign = 'center'; ctx.fillText('N', size - 27, 24);
    ctx.beginPath(); ctx.moveTo(size - 27, 32); ctx.lineTo(size - 32, 47); ctx.lineTo(size - 27, 43); ctx.lineTo(size - 22, 47); ctx.closePath(); ctx.fill();
    const meters = result.sideKm * 1000 / 4, bar = size / 4;
    ctx.fillStyle = '#f2f3e8ed'; ctx.fillRect(12, size - 41, bar + 20, 32);
    ctx.strokeStyle = '#68775f'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(20, size - 26); ctx.lineTo(20, size - 21); ctx.lineTo(20 + bar, size - 21); ctx.lineTo(20 + bar, size - 26); ctx.stroke();
    ctx.textAlign = 'left'; ctx.font = '9px Consolas,monospace'; ctx.fillStyle = '#68775f'; ctx.fillText(`${meters} m`, 20, size - 30);
    ctx.restore();
  }
  function drawRose(canvas, r, color) {
    const ctx = context(canvas, 124), cx = 62, cy = 62, radius = 42;
    ctx.clearRect(0, 0, 124, 124); ctx.strokeStyle = '#dce0d2'; ctx.lineWidth = 0.6;
    for (const rad of [21, 42]) { ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(cx - radius, cy); ctx.lineTo(cx + radius, cy); ctx.moveTo(cx, cy - radius); ctx.lineTo(cx, cy + radius); ctx.stroke();
    const max = Math.max(...r.bins, 0.001);
    for (let i = 0; i < 36; i++) {
      const value = r.bins[i % 18] / max * radius;
      const start = i * Math.PI / 18 - Math.PI / 2, end = start + Math.PI / 18;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, value, start + 0.01, end - 0.01); ctx.closePath(); ctx.globalAlpha = 0.73; ctx.fillStyle = color; ctx.fill();
    }
    ctx.globalAlpha = 1; ctx.fillStyle = '#89937e'; ctx.font = '8px Consolas,monospace'; ctx.textAlign = 'center';
    ctx.fillText('N', cx, 10); ctx.fillText('S', cx, 120); ctx.fillText('W', 6, cy + 3); ctx.fillText('E', 118, cy + 3);
  }
  function metric(label, value, unit) {
    const item = document.createElement('div'), name = document.createElement('div'), number = document.createElement('div'), suffix = document.createElement('small');
    name.className = 'metric-label'; name.textContent = label; number.className = 'metric-value'; number.textContent = value;
    suffix.textContent = unit; number.append(suffix); item.append(name, number); return item;
  }
  function paintMaps() {
    for (const slot of ['left', 'right']) {
      const canvas = $(slot + '-map'), size = canvas.parentElement.clientWidth;
      drawMap(context(canvas, size), size, results[slot], byId[state[slot]].color);
      drawRose($(slot + '-rose'), results[slot], byId[state[slot]].color);
    }
  }
  function render(writeHash = true) {
    limits = C.panBounds([byId[state.left], byId[state.right]], state.side);
    state.offset = C.clampOffset(state.offset, limits);
    for (const slot of ['left', 'right']) {
      const city = byId[state[slot]], result = C.analyze(prepared[city.id], state.side, state.walking, state.offset); results[slot] = result;
      const [lon, lat] = C.unproject(...state.offset, city);
      $(slot + '-card').style.setProperty('--accent', city.color);
      $(slot + '-city').value = city.id; $(slot + '-country').textContent = city.country;
      $(slot + '-district').textContent = city.district; $(slot + '-english').textContent = city.english;
      $(slot + '-coordinates').textContent = `${lat.toFixed(4)}° N  ${lon.toFixed(4)}° E`;
      $(slot + '-metrics').replaceChildren(metric('窗口内道路总长', fixed(result.lengthKm), 'km'), metric('路网密度', fixed(result.density, 1), 'km/km²'), metric('方向多样性', result.diversity === null ? '—' : fixed(result.diversity, 1), '/ 100'));
      $(slot + '-reading').textContent = describe(result);
      $(slot + '-map').setAttribute('aria-label', `${city.name}${city.district}，宽${state.side * 1000}米，道路总长${fixed(result.lengthKm)}公里`);
    }
    $('walking').checked = state.walking;
    const [x, y] = state.offset, centered = x === 0 && y === 0;
    $('center').disabled = centered;
    $('position-label').textContent = centered ? '观察位置：样本中心' : `相对样本中心：${x >= 0 ? '东' : '西'} ${Math.abs(x * 1000).toFixed(1)} m · ${y >= 0 ? '北' : '南'} ${Math.abs(y * 1000).toFixed(1)} m`;
    const atEdge = Math.abs(x - limits.minX) < 1e-6 || Math.abs(x - limits.maxX) < 1e-6 || Math.abs(y - limits.minY) < 1e-6 || Math.abs(y - limits.maxY) < 1e-6;
    $('boundary-hint').textContent = atEdge ? '已到样本边界；缩小窗口可探索更多位置。' : '仅在已下载的样本内移动';
    document.querySelectorAll('[data-pan]').forEach(button => {
      const direction = button.dataset.pan.split(',').map(Number);
      const next = C.clampOffset(state.offset.map((v, i) => v + direction[i] * state.side / 10), limits);
      button.disabled = next.every((v, i) => v === state.offset[i]);
    });
    document.querySelectorAll('[data-side]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.side) === state.side)));
    document.querySelectorAll('.window-label').forEach(label => { label.textContent = `${state.side * 1000} × ${state.side * 1000} m`; });
    $('area-label').textContent = `每侧 ${fixed(state.side * state.side, 4).replace(/0+$/, '').replace(/\.$/, '')} km²`;
    if (writeHash) { try { history.replaceState(null, '', C.stateHash(state)); } catch (_) { /* file:// 限制不影响核心体验 */ } }
    paintMaps();
  }
  for (const slot of ['left', 'right']) {
    const select = $(slot + '-city');
    for (const city of cities) { const option = document.createElement('option'); option.value = city.id; option.textContent = city.name; select.append(option); }
    select.addEventListener('change', () => { state[slot] = select.value; render(); });
  }
  document.querySelectorAll('[data-side]').forEach(button => button.addEventListener('click', () => {
    const previous = state.offset; state.side = Number(button.dataset.side); render();
    if (state.offset.some((v, i) => v !== previous[i])) notice('已调整观察位置，让更大的窗口完整落在样本内。');
  }));
  $('walking').addEventListener('change', () => { state.walking = $('walking').checked; render(); });
  $('swap').addEventListener('click', () => { [state.left, state.right] = [state.right, state.left]; render(); });
  $('reset').addEventListener('click', () => { state = C.readState('', ids); render(); notice('已恢复默认双城观察。'); });
  function finishDrag(writeHash = true) {
    cancelAnimationFrame(panFrame);
    if (drag) { const old = drag; drag = null; old.canvas.classList.remove('dragging'); if (old.canvas.hasPointerCapture(old.id)) old.canvas.releasePointerCapture(old.id); render(writeHash); }
  }
  function shiftView(dx, dy) { finishDrag(); state.offset = [state.offset[0] + dx * state.side / 10, state.offset[1] + dy * state.side / 10]; render(); }
  document.querySelectorAll('[data-pan]').forEach(button => button.addEventListener('click', () => shiftView(...button.dataset.pan.split(',').map(Number))));
  $('center').addEventListener('click', () => { finishDrag(); state.offset = [0, 0]; render(); });
  for (const slot of ['left', 'right']) {
    const canvas = $(slot + '-map');
    canvas.addEventListener('pointerdown', event => {
      if (event.button !== 0 || !event.isPrimary) return;
      finishDrag(); canvas.focus({ preventScroll: true });
      drag = { id: event.pointerId, x: event.clientX, y: event.clientY, offset: [...state.offset], canvas, size: canvas.getBoundingClientRect().width };
      canvas.setPointerCapture(event.pointerId); canvas.classList.add('dragging');
    });
    canvas.addEventListener('pointermove', event => {
      if (!drag || drag.id !== event.pointerId || drag.canvas !== canvas) return;
      const factor = state.side / drag.size;
      state.offset = C.clampOffset([drag.offset[0] - (event.clientX - drag.x) * factor, drag.offset[1] + (event.clientY - drag.y) * factor], limits);
      cancelAnimationFrame(panFrame); panFrame = requestAnimationFrame(() => render(false));
    });
    for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) canvas.addEventListener(name, event => { if (drag && event.pointerId === drag.id) finishDrag(); });
    canvas.addEventListener('keydown', event => {
      const keys = { ArrowUp: [0, 1], ArrowDown: [0, -1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
      if (keys[event.key]) { event.preventDefault(); shiftView(...keys[event.key]); }
      if (event.key === 'Home') { event.preventDefault(); finishDrag(); state.offset = [0, 0]; render(); }
      if (event.key === 'Escape') finishDrag();
    });
  }
  window.addEventListener('blur', finishDrag);
  window.addEventListener('hashchange', () => { finishDrag(false); state = C.readState(location.hash, ids); render(false); });
  let resizeFrame; const observer = new ResizeObserver(() => { cancelAnimationFrame(resizeFrame); resizeFrame = requestAnimationFrame(paintMaps); });
  observer.observe($('left-map').parentElement); observer.observe($('right-map').parentElement);
  const dialog = $('about-dialog');
  for (const city of cities) {
    const p = document.createElement('p'); p.textContent = `${city.name}：抓取于 ${date(city)}（UTC）；接口快照标识 ${city.source.snapshotToken}。该标识不是日期。`; $('data-details').append(p);
  }
  $('about').addEventListener('click', () => dialog.showModal()); $('close-dialog').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if (e.target === dialog && (e.clientX < dialog.getBoundingClientRect().left || e.clientX > dialog.getBoundingClientRect().right || e.clientY < dialog.getBoundingClientRect().top || e.clientY > dialog.getBoundingClientRect().bottom)) dialog.close(); });
  function download(blob, name) {
    const url = URL.createObjectURL(blob), link = document.createElement('a'); link.href = url; link.download = name; link.click(); setTimeout(() => URL.revokeObjectURL(url), 30000);
  }
  const viewDialog = $('view-dialog');
  function openView(code = '', manualCopy = false) {
    finishDrag(); $('view-error').textContent = ''; $('view-code').value = code;
    $('view-title').textContent = manualCopy ? '保存这份观察' : '恢复一份观察';
    $('view-description').textContent = manualCopy ? '浏览器未能自动复制。请选中并复制下面的参数，在另一份城市纹理中使用“恢复视图”。' : '粘贴城市纹理生成的视图参数，恢复城市、尺度、筛选和观察位置。';
    $('apply-view').hidden = manualCopy; viewDialog.showModal(); $('view-code').focus(); $('view-code').select();
  }
  $('close-view').addEventListener('click', () => viewDialog.close());
  $('restore-view').addEventListener('click', () => openView());
  $('copy-view').addEventListener('click', async () => {
    finishDrag(); const code = C.stateHash(state);
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      let timer;
      try { await Promise.race([navigator.clipboard.writeText(code), new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('Copy timeout')), 1600); })]); }
      finally { clearTimeout(timer); }
      notice('已复制视图参数。在同版本预览中点“恢复视图”即可打开。');
    } catch (_) { openView(code, true); }
  });
  $('view-form').addEventListener('submit', event => {
    event.preventDefault();
    try {
      const restored = C.parseView($('view-code').value, ids), requested = restored.offset;
      finishDrag(); state = restored; render(); viewDialog.close();
      notice(state.offset.some((v, i) => v !== requested[i]) ? '已恢复比较，并将观察位置限制在样本范围内。' : '已恢复城市、尺度、筛选和观察位置。');
    } catch (error) { $('view-error').textContent = error.message; }
  });
  $('report').addEventListener('click', () => {
    const reports = ['left', 'right'].map(slot => C.report(byId[state[slot]], results[slot], state.walking));
    download(new Blob([JSON.stringify({ version: 2, app: '城市纹理', appVersion: '0.2.0', view: C.stateHash(state), createdAt: new Date().toISOString(), samples: reports }, null, 2)], { type: 'application/json' }), '城市纹理-双城数据报告.json'); notice('数据报告已生成，包含范围、口径和数据来源。');
  });
  $('export').addEventListener('click', () => {
    const button = $('export'); button.disabled = true;
    try {
      const canvas = document.createElement('canvas'); canvas.width = 1600; canvas.height = 1200; const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#f6f5ef'; ctx.fillRect(0, 0, 1600, 1200); ctx.fillStyle = '#253b34'; ctx.font = '36px "Microsoft YaHei",sans-serif'; ctx.fillText('城市纹理 / 双城观察卡', 60, 65);
      ctx.font = '17px "Microsoft YaHei",sans-serif'; ctx.fillStyle = '#758078'; ctx.fillText(`同尺度 ${state.side * 1000} × ${state.side * 1000} m · 统一朝北 · ${state.walking ? '含步行与骑行道路' : '机动车道路（含 service）'}`, 60, 106);
      ['left', 'right'].forEach((slot, index) => {
        const city = byId[state[slot]], r = results[slot], x = 60 + index * 780, [lon, lat] = C.unproject(...r.offsetKm, city);
        ctx.fillStyle = city.color; ctx.font = '30px "Microsoft YaHei",sans-serif'; ctx.fillText(city.name, x, 170);
        ctx.fillStyle = '#758078'; ctx.font = '16px "Microsoft YaHei",sans-serif'; ctx.fillText(city.district, x, 203);
        ctx.save(); ctx.translate(x, 225); drawMap(ctx, 700, r, city.color); ctx.restore();
        ctx.fillStyle = city.color; ctx.font = '20px "Microsoft YaHei",sans-serif'; ctx.fillText(`道路 ${fixed(r.lengthKm)} km    密度 ${fixed(r.density, 1)} km/km²`, x, 965);
        ctx.fillStyle = '#758078'; ctx.font = '16px "Microsoft YaHei",sans-serif'; ctx.fillText(`方向多样性 ${r.diversity === null ? '—' : fixed(r.diversity, 1)} / 100    抓取 ${date(city)} UTC`, x, 1000);
        ctx.fillText(`中心 ${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E`, x, 1030);
      });
      ctx.fillStyle = '#758078'; ctx.font = '16px "Microsoft YaHei",sans-serif'; ctx.fillText('局部城区快照，不能代表全市；方向多样性不是城市品质评分。局部等距圆柱近似。', 60, 1090);
      ctx.fillText('© OpenStreetMap contributors · ODbL 1.0 · https://www.openstreetmap.org/copyright', 60, 1124);
      ctx.fillText('程序：城市纹理 v0.2 · https://github.com/LouHC0814/city-texture', 60, 1158);
      canvas.toBlob(blob => { button.disabled = false; if (!blob) { notice('生成图片失败，请下载数据报告。'); return; } download(blob, '城市纹理-双城观察卡.png'); notice('双城观察卡已生成。'); }, 'image/png');
    } catch (error) { button.disabled = false; notice('导出失败：' + error.message); }
  });
  render();
})();
