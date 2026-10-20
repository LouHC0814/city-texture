import L from './model-library.cjs';
const $ = id => document.getElementById(id);

export function createWorkbench({ builtin, V, getState, capture, install, download }) {
  let entries = new Map(), views = new Map(), selection = 0, importGeneration = 0, workspaceGeneration = 0;
  let importStage = null, workspaceStage = null;
  const importDialog = $('model-import-dialog'), workspaceDialog = $('workspace-dialog');
  const all = () => [builtin, ...entries.values()];
  const current = () => all().find(item => item.id === getState().modelId) || builtin;
  const message = text => { $('workbench-message').textContent = text; };
  function remember() {
    if (getState().loaded && !getState().failed) views.set(getState().modelId, JSON.parse(capture()));
  }
  function register(entry) { V.registerModel(entry.id, { label: entry.name, author: entry.author, license: entry.license }); }
  function render() {
    const entry = current(), picker = $('model-select');
    picker.replaceChildren(...all().map(item => { const option = document.createElement('option'); option.value = item.id; option.textContent = `${item.name} · ${item.builtin ? '内置' : item.place}`; return option; }));
    picker.value = entry.id;
    $('model-name').textContent = entry.name;
    $('model-place').textContent = entry.builtin ? 'EIFFEL TOWER · ' + entry.place : entry.place;
    $('model-description').textContent = entry.builtin ? '从四座塔脚向上，看钢架、平台与塔身如何连成一体。拖动建筑，找一个你喜欢的角度。' : '转动、拉近，再从正面和俯视观察。切换建筑会保留各自的构图；保存工作台后可下次继续。';
    $('model-badge').textContent = entry.builtin ? '完整三维模型 · 钢架结构细节' : '本地导入 · 来源由提供者声明';
    const credit = $('model-credit'); credit.textContent = `模型作者：${entry.author}。许可：${entry.license}。`;
    if (entry.builtin) {
      for (const [href, label] of [[entry.authorUrl, '作者主页'], [entry.licenseUrl, '许可全文']]) {
        const link = document.createElement('a'); link.href = href; link.target = '_blank'; link.rel = 'noreferrer'; link.textContent = label; credit.append(' ', link);
      }
    }
    if (entry.source) {
      const link = document.createElement('a'); link.href = entry.source; link.target = '_blank'; link.rel = 'noreferrer'; link.textContent = '查看原始来源 ↗'; credit.append(' ', link);
    }
    if (entry.copyright) { const copyright = document.createElement('p'); copyright.textContent = '文件内声明：' + entry.copyright; credit.append(copyright); }
    $('model-scope').textContent = entry.note;
    $('model-stage-label').textContent = '3D / ' + (entry.builtin ? 'EIFFEL TOWER' : entry.name);
    $('landmark-canvas').setAttribute('aria-label', `可旋转和缩放的${entry.name}三维模型`);
    $('model-caption').textContent = `${entry.name} · ${entry.author} · ${entry.license}\n${entry.builtin ? '模型随程序保存，断网可用。' : '本地文件仅在当前页面保留；请保存工作台。身份与许可尚未经程序核实。'}`;
    $('model-remove').hidden = entry.builtin;
  }
  async function choose(entry, { valid = () => true, saved = views.get(entry.id), commit = () => {}, keep = true } = {}) {
    const ticket = ++selection;
    if (keep) remember();
    message('正在准备 ' + entry.name + '…');
    try {
      const applied = await install(entry, { saved, valid: () => ticket === selection && valid(), commit });
      if (!applied) return false;
      render(); message(`正在观察 ${entry.name} · 本地收藏 ${entries.size}/3；各建筑视角独立保留。`); return true;
    } catch (error) {
      if (ticket === selection && valid()) { render(); message('模型未切换：' + error.message); }
      throw error;
    }
  }
  $('model-select').addEventListener('change', () => {
    const entry = all().find(item => item.id === $('model-select').value);
    if (entry) choose(entry).catch(() => {});
  });
  $('model-remove').addEventListener('click', async () => {
    const entry = current(); if (entry.builtin) return;
    try {
      if (!await choose(builtin)) return;
      entries.delete(entry.id); views.delete(entry.id); V.unregisterModel(entry.id); render(); message('已移除 ' + entry.name + '；原始本地文件不受影响。');
    } catch { /* install 已保留旧场景并显示错误。 */ }
  });
  function clearImport() { importStage = null; $('model-import-apply').disabled = true; $('model-import-preview').textContent = ''; }
  $('model-import').addEventListener('click', () => {
    importGeneration++; clearImport(); $('model-import-error').textContent = ''; $('model-import-form').reset(); importDialog.showModal();
  });
  $('model-import-close').addEventListener('click', () => importDialog.close());
  importDialog.addEventListener('close', () => { if (importDialog.open) return; importGeneration++; selection++; clearImport(); });
  $('model-file').addEventListener('change', async () => {
    const generation = ++importGeneration, file = $('model-file').files[0]; clearImport(); $('model-import-error').textContent = '';
    if (!file) return;
    $('model-import-preview').textContent = '正在检查模型结构与范围…';
    try {
      if (file.size > L.LIMITS.file) throw new Error('每份模型不能超过 8 MiB');
      const bytes = new Uint8Array(await file.arrayBuffer()); if (generation !== importGeneration) return;
      const entry = await L.inspect(bytes, { name: file.name.replace(/\.glb$/i, '') }); if (generation !== importGeneration) return;
      L.quota(entries.values(), entry); importStage = entry; $('model-input-name').value = entry.name;
      $('model-import-preview').textContent = `${entry.triangles.toLocaleString('zh-CN')} 个网格三角面 · ${(entry.bytes.length / 1048576).toFixed(2)} MiB · SHA-256 ${entry.sha256.slice(0, 12)}…${entry.warnings ? ` · ${entry.warnings} 项提示` : ''}`;
      $('model-import-apply').disabled = false;
    } catch (error) { if (generation === importGeneration) { clearImport(); $('model-import-error').textContent = error.message; } }
  });
  $('model-import-form').addEventListener('submit', async event => {
    event.preventDefault(); if (!importStage) return;
    const generation = importGeneration;
    $('model-import-apply').disabled = true; $('model-import-error').textContent = '';
    try {
      const entry = { ...importStage, ...L.metadata(Object.fromEntries(['name', 'place', 'author', 'license', 'source'].map(key => [key, $('model-input-' + key).value]))) };
      L.quota(entries.values(), entry);
      const applied = await choose(entry, { valid: () => importDialog.open && generation === importGeneration, commit: () => { register(entry); entries.set(entry.id, entry); } });
      if (applied) importDialog.close();
    } catch (error) { if (generation === importGeneration) $('model-import-error').textContent = error.message; }
    finally { if (generation === importGeneration) $('model-import-apply').disabled = !importStage; }
  });
  $('workspace-save').addEventListener('click', () => {
    try {
      remember(); const json = L.serialize([...entries.values()], views, current().id, builtin, V);
      download(new Blob([json], { type: 'application/json' }), '城市纹理-建筑工作台.json'); message('工作台已下载，包含本地模型、来源声明与各建筑视角；可换设备后重新打开。');
    } catch (error) { message('工作台未保存：' + error.message); }
  });
  function clearWorkspace() { workspaceStage = null; $('workspace-apply').disabled = true; $('workspace-preview').textContent = ''; }
  $('workspace-open').addEventListener('click', () => {
    workspaceGeneration++; clearWorkspace(); $('workspace-error').textContent = ''; $('workspace-file').value = ''; workspaceDialog.showModal();
  });
  $('workspace-close').addEventListener('click', () => workspaceDialog.close());
  workspaceDialog.addEventListener('close', () => { if (workspaceDialog.open) return; workspaceGeneration++; selection++; clearWorkspace(); });
  $('workspace-file').addEventListener('change', async () => {
    const generation = ++workspaceGeneration, file = $('workspace-file').files[0]; clearWorkspace(); $('workspace-error').textContent = '';
    if (!file) return;
    $('workspace-preview').textContent = '正在核对工作台、模型校验值与视角…';
    try {
      if (file.size > L.LIMITS.project) throw new Error('工作台文件不能超过 24 MiB');
      const input = await file.text(); if (generation !== workspaceGeneration) return;
      const staged = await L.parse(input, builtin, V); if (generation !== workspaceGeneration) return;
      workspaceStage = staged;
      const selected = [builtin, ...staged.entries].find(entry => entry.id === staged.activeId);
      $('workspace-preview').textContent = `内置铁塔 + ${staged.entries.length} 份本地模型：${staged.entries.map(entry => entry.name).join('、') || '无'}。打开后观察 ${selected.name}，替换现有收藏与保存视角。`;
      $('workspace-apply').disabled = false;
    } catch (error) { if (generation === workspaceGeneration) { clearWorkspace(); $('workspace-error').textContent = error.message; } }
  });
  $('workspace-form').addEventListener('submit', async event => {
    event.preventDefault(); if (!workspaceStage) return;
    const staged = workspaceStage, generation = workspaceGeneration;
    const entry = [builtin, ...staged.entries].find(item => item.id === staged.activeId);
    $('workspace-apply').disabled = true;
    try {
      const applied = await choose(entry, { keep: false, saved: staged.views.get(entry.id), valid: () => workspaceDialog.open && generation === workspaceGeneration,
        commit: () => {
          for (const id of entries.keys()) V.unregisterModel(id);
          for (const item of staged.entries) register(item);
          entries = new Map(staged.entries.map(item => [item.id, item])); views = new Map(staged.views);
        } });
      if (applied) workspaceDialog.close();
    } catch (error) { if (generation === workspaceGeneration) $('workspace-error').textContent = error.message; }
    finally { if (generation === workspaceGeneration) $('workspace-apply').disabled = !workspaceStage; }
  });
  return {
    render,
    ready() { for (const id of ['model-import', 'workspace-save', 'workspace-open']) $(id).disabled = false; render(); },
    state: () => ({ models: all().map(entry => ({ id: entry.id, name: entry.name, builtin: entry.builtin, bytes: entry.bytes?.length || builtin.glbBytes })), localCount: entries.size }),
    remember
  };
}
