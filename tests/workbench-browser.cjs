// 建筑工作台真实文件、WebGL、下载、恢复与手机检查；亦由完整应用验收调用。
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { pathToFileURL } = require('node:url');
const { CDP, until, delay } = require('./browser-driver.cjs');
const ROOT = path.resolve(__dirname, '..');

async function run({ cdp, runtime, screenshotDir }) {
  await cdp.call('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1100, deviceScaleFactor: 1, mobile: false });
  await cdp.call('Emulation.setTouchEmulationEnabled', { enabled: false });
  const folder = await fs.mkdtemp(path.join(runtime, 'workbench-'));
  const fixture = name => path.join(ROOT, 'tools/模型体检/反例', name);
  const pngPath = path.join(folder, '有效PNG测试.glb'), jpegPath = path.join(folder, '有效JPEG测试.glb');
  await fs.writeFile(pngPath, require('./model-fixtures.cjs').textured());
  const jpegURL = await cdp.evaluate("(()=>{const c=document.createElement('canvas');c.width=c.height=16;const x=c.getContext('2d');x.fillStyle='#b36b4b';x.fillRect(0,0,16,16);return c.toDataURL('image/jpeg')})()");
  await fs.writeFile(jpegPath, require('./model-fixtures.cjs').textured(Buffer.from(jpegURL.split(',')[1], 'base64'), 'image/jpeg'));
  const state = () => cdp.evaluate('CityLandmarks.getState()');
  const click = id => cdp.evaluate(`document.getElementById(${JSON.stringify(id)}).click()`);
  const screenshot = async name => { const shot = await cdp.call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false }); await fs.writeFile(path.join(screenshotDir, name), Buffer.from(shot.data, 'base64')); };
  async function selectFile(selector, file) {
    const doc = await cdp.call('DOM.getDocument');
    const node = await cdp.call('DOM.querySelector', { nodeId: doc.root.nodeId, selector });
    await cdp.call('DOM.setFileInputFiles', { nodeId: node.nodeId, files: [file] });
  }
  async function openShowcase() {
    await cdp.evaluate("document.querySelector('[data-observation=landmark]').click()");
    await until(async () => (await state()).loaded, '工作台三维展台就绪', 30000);
  }
  async function choose(id) {
    await cdp.evaluate(`document.getElementById('model-select').value=${JSON.stringify(id)};document.getElementById('model-select').dispatchEvent(new Event('change'))`);
    await until(async () => { const s = await state(); return s.modelId === id && s.renderedModelId === id && !s.switching; }, '切换建筑并实际绘制 ' + id, 30000); await delay(150);
  }
  async function importModel(file, name) {
    await click('model-import'); await selectFile('#model-file', file);
    await until(() => cdp.evaluate("!document.getElementById('model-import-apply').disabled || document.getElementById('model-import-error').textContent"), '模型准入预览', 20000);
    assert.equal(await cdp.evaluate("document.getElementById('model-import-error').textContent"), '');
    await cdp.evaluate(`document.getElementById('model-input-name').value=${JSON.stringify(name)};document.getElementById('model-input-place').value='人工样本 · 非真实建筑';document.getElementById('model-input-author').value='工作台验收';document.getElementById('model-input-license').value='仅供功能测试';document.getElementById('model-input-source').value='https://example.org/test-model'`);
    const rendersBefore = (await state()).renders;
    await click('model-import-apply');
    await until(() => cdp.evaluate("!document.getElementById('model-import-dialog').open || document.getElementById('model-import-error').textContent"), '真实导入并观察', 30000);
    assert.equal(await cdp.evaluate("document.getElementById('model-import-error').textContent"), '');
    await cdp.evaluate("document.getElementById('landmark-canvas').scrollIntoView({block:'center'})");
    await until(async () => { const s = await state(); return s.renders > rendersBefore && s.renderedModelId === s.modelId; }, '导入模型实际完成新一帧绘制', 20000);
    return state();
  }
  function equalView(actual, expected) {
    for (const key of ['camera', 'target']) for (let i = 0; i < 3; i++) assert.ok(Math.abs(actual[key][i] - expected[key][i]) < 1e-6, `${key}[${i}] 恢复`);
    assert.equal(actual.wireframe, expected.wireframe); assert.equal(actual.view, expected.view);
    for (const key of ['fov', 'near', 'far']) assert.equal(actual[key], expected[key]);
  }
  let downloadIndex = 0;
  async function download(id) {
    const dir = path.join(folder, 'download-' + ++downloadIndex); await fs.mkdir(dir);
    await cdp.call('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: dir, eventsEnabled: true });
    await click(id);
    const file = await until(async () => {
      const names = (await fs.readdir(dir)).filter(name => !name.endsWith('.crdownload'));
      if (names.length !== 1) return false;
      const target = path.join(dir, names[0]);
      const a = await fs.stat(target); await delay(120); const b = await fs.stat(target);
      if (!a.size || a.size !== b.size) return false;
      const handle = await fs.open(target); await handle.close(); return target;
    }, '工作台真实下载 ' + id, 25000);
    return file;
  }
  async function previewWorkspace(file) {
    await click('workspace-open'); await selectFile('#workspace-file', file);
    await until(() => cdp.evaluate("!document.getElementById('workspace-apply').disabled || document.getElementById('workspace-error').textContent"), '工作台文件预览', 30000);
  }
  const requests = [];
  const unsubscribe = cdp.subscribe('Network.requestWillBeSent', event => { if (/^https?:/.test(event.request.url)) requests.push(event.request.url); });
  await openShowcase(); await cdp.evaluate("document.querySelector('[data-camera=front]').click()"); await delay(220);
  const eiffel = await state();
  const first = await importModel(pngPath, '贴图测试立方体');
  assert.match(first.modelId, /^local-[a-f0-9]{64}$/); assert.equal(first.library.localCount, 1); assert.equal(first.triangles, 12);
  assert.equal(await cdp.evaluate("document.getElementById('model-name').textContent"), '贴图测试立方体');
  const texturedPixels = await cdp.evaluate("(()=>{const c=document.getElementById('landmark-canvas'),g=c.getContext('webgl2'),p=new Uint8Array(c.width*c.height*4);g.readPixels(0,0,c.width,c.height,g.RGBA,g.UNSIGNED_BYTE,p);let colored=0;for(let i=0;i<p.length;i+=4)if(p[i+1]>p[i]*1.12&&p[i+1]>p[i+2]*1.03)colored++;return colored})()");
  await cdp.evaluate("document.querySelector('.model-toolbar').scrollIntoView({block:'start'})"); await screenshot('PNG贴图实测.png');
  const pixelSummary = await cdp.evaluate("(()=>{const c=document.getElementById('landmark-canvas'),g=c.getContext('webgl2'),p=new Uint8Array(c.width*c.height*4);g.readPixels(0,0,c.width,c.height,g.RGBA,g.UNSIGNED_BYTE,p);const colors={};let d=-255;for(let i=0;i<p.length;i+=4){const k=[p[i],p[i+1],p[i+2]].join(',');colors[k]=(colors[k]||0)+1;d=Math.max(d,p[i+1]-p[i])}return{maxGreenDifference:d,colors:Object.entries(colors).sort((a,b)=>b[1]-a[1]).slice(0,8),state:CityLandmarks.getState()}})()");
  assert.ok(texturedPixels > 100, '实际 WebGL 像素含绿色 PNG 贴图，而非仅加载标记：' + JSON.stringify(pixelSummary));
  const card = await download('landmark-export'), image = await fs.readFile(card);
  assert.equal(image.readUInt32BE(16), 1600); assert.equal(image.readUInt32BE(20), 1200);
  await fs.copyFile(card, path.join(screenshotDir, '建筑工作台观察卡.png'));
  await cdp.evaluate("document.querySelector('[data-camera=top]').click();document.getElementById('landmark-in').click();document.getElementById('landmark-wireframe').click()"); await delay(200);
  const firstView = await state();
  await choose('eiffel-tower'); equalView(await state(), eiffel);
  await choose(first.modelId); equalView(await state(), firstView);
  const glb = await download('landmark-download'); assert.deepEqual(await fs.readFile(glb), await fs.readFile(pngPath));
  const savedView = await download('save-view'); const viewJSON = JSON.parse(await fs.readFile(savedView)); assert.equal(viewJSON.modelId, first.modelId);
  await choose('eiffel-tower'); await click('open-view'); await selectFile('#view-file', savedView);
  await until(() => cdp.evaluate("document.getElementById('view-file-error').textContent.length > 0"), '跨模型视角拒绝');
  assert.equal((await state()).modelId, 'eiffel-tower'); await click('close-view-dialog');
  await choose(first.modelId);
  for (const file of ['06-bad-magic.glb', '08-external-image.glb', '09-unsupported-extension.glb']) {
    const before = await state(); await click('model-import'); await selectFile('#model-file', fixture(file));
    await until(() => cdp.evaluate("document.getElementById('model-import-error').textContent.length > 0"), '错误模型保留现有观察');
    equalView(await state(), before); assert.equal((await state()).modelId, before.modelId); await click('model-import-close');
  }
  // 旧人工 PNG 的头部合法、实际压缩流损坏：准入能过，但真实解码必须拒绝并保留场景。
  const beforeTexture = await state(); await click('model-import'); await selectFile('#model-file', fixture('10-embedded-png-real.glb'));
  await until(() => cdp.evaluate("!document.getElementById('model-import-apply').disabled"), '贴图头部检查');
  await click('model-import-apply'); await until(() => cdp.evaluate("document.getElementById('model-import-error').textContent.includes('贴图')"), '损坏贴图真实解码失败');
  equalView(await state(), beforeTexture); assert.equal((await state()).modelId, beforeTexture.modelId); await click('model-import-close');
  await click('model-import'); await selectFile('#model-file', pngPath);
  await until(() => cdp.evaluate("document.getElementById('model-import-error').textContent.includes('已经')"), '重复模型拒绝'); await click('model-import-close');
  // 真实慢文件读取后关闭并重开面板，迟到结果不得覆盖新预览。
  await cdp.evaluate("window.__modelArrayBuffer=File.prototype.arrayBuffer;File.prototype.arrayBuffer=async function(){await new Promise(r=>setTimeout(r,650));return __modelArrayBuffer.call(this)}");
  const beforeCancel = await state(); await click('model-import'); await selectFile('#model-file', fixture('21-real-jpeg.glb'));
  await click('model-import-close'); await click('model-import'); await delay(850);
  assert.equal(await cdp.evaluate("document.getElementById('model-import-apply').disabled"), true); equalView(await state(), beforeCancel);
  await cdp.evaluate('File.prototype.arrayBuffer=window.__modelArrayBuffer'); await click('model-import-close');
  const second = await importModel(jpegPath, 'JPEG 贴图测试');
  const third = await importModel(fixture('01-normal-indexed.glb'), '人工平面网格');
  assert.equal(third.library.localCount, 3);
  await click('model-import'); await selectFile('#model-file', fixture('02-normal-nonindexed.glb'));
  await until(() => cdp.evaluate("document.getElementById('model-import-error').textContent.includes('3 份')"), '模型数量上限'); await click('model-import-close');
  await choose(first.modelId); equalView(await state(), firstView);
  await cdp.evaluate("document.querySelector('[data-camera=iso]').click();document.getElementById('landmark-wireframe').checked=false;document.getElementById('landmark-wireframe').dispatchEvent(new Event('change'))"); await delay(220);
  await cdp.evaluate("document.querySelector('.model-toolbar').scrollIntoView({block:'start'})"); await screenshot('建筑工作台桌面.png');
  await click('open-view'); await selectFile('#view-file', savedView);
  await until(() => cdp.evaluate("!document.getElementById('apply-view-file').disabled"), '恢复截图前的独立视角');
  await click('apply-view-file'); await delay(180); equalView(await state(), firstView);
  const saved = await download('workspace-save'); const project = JSON.parse(await fs.readFile(saved, 'utf8'));
  assert.equal(project.models.length, 3); assert.equal(project.activeId, first.modelId);
  assert.equal(project.views[first.modelId].modelId, first.modelId); assert.equal(project.models[0].metadata.author, '工作台验收');
  const snapshot = await state();
  await previewWorkspace(saved); assert.equal(await cdp.evaluate("document.getElementById('workspace-apply').disabled"), false);
  assert.equal((await state()).modelId, snapshot.modelId); await screenshot('建筑工作台恢复预览.png'); await click('workspace-close'); equalView(await state(), snapshot);
  const damaged = path.join(folder, '损坏工作台.json'), bad = structuredClone(project); bad.models[0].id = 'local-' + '0'.repeat(64);
  await fs.writeFile(damaged, JSON.stringify(bad)); await previewWorkspace(damaged);
  assert.ok(await cdp.evaluate("document.getElementById('workspace-error').textContent.length > 0")); equalView(await state(), snapshot); await click('workspace-close');
  await cdp.evaluate("window.__workspaceText=File.prototype.text;File.prototype.text=async function(){await new Promise(r=>setTimeout(r,650));return __workspaceText.call(this)}");
  await click('workspace-open'); await selectFile('#workspace-file', saved); await click('workspace-close'); await click('workspace-open'); await delay(900);
  assert.equal(await cdp.evaluate("document.getElementById('workspace-apply').disabled"), true); equalView(await state(), snapshot);
  await cdp.evaluate('File.prototype.text=window.__workspaceText'); await click('workspace-close');
  // 真正刷新后重新打开；不是只在同一内存对象里来回设置。
  await cdp.call('Page.reload'); await until(() => cdp.evaluate('Boolean(window.CityLandmarks)'), '刷新后的工作台'); await openShowcase();
  assert.equal((await state()).library.localCount, 0);
  await previewWorkspace(saved); await click('workspace-apply');
  await until(() => cdp.evaluate("!document.getElementById('workspace-dialog').open || document.getElementById('workspace-error').textContent"), '完整工作台恢复', 30000);
  assert.equal(await cdp.evaluate("document.getElementById('workspace-error').textContent"), '');
  assert.equal((await state()).library.localCount, 3); equalView(await state(), firstView);
  await choose('eiffel-tower'); equalView(await state(), eiffel); await choose(first.modelId);
  const memory = (await state()).memory;
  for (let i = 0; i < 3; i++) { await choose(second.modelId); await choose(first.modelId); }
  const afterMemory = (await state()).memory;
  assert.ok(afterMemory.geometries <= memory.geometries + 1, '重复切换释放旧几何');
  assert.ok(afterMemory.textures <= memory.textures + 1, '重复切换释放旧纹理');
  // 原生贴图加载故意延迟，快速切换时只允许最后一次操作生效。
  await cdp.evaluate("window.__bitmap=createImageBitmap;window.createImageBitmap=async function(...args){await new Promise(r=>setTimeout(r,180));return __bitmap(...args)}");
  await cdp.evaluate(`for(const id of ${JSON.stringify([second.modelId, first.modelId, 'eiffel-tower'])}){const s=document.getElementById('model-select');s.value=id;s.dispatchEvent(new Event('change'))}`);
  await until(async () => { const s = await state(); return s.modelId === 'eiffel-tower' && !s.switching; }, '快速切换最后选择生效', 30000); await delay(500);
  assert.equal((await state()).modelId, 'eiffel-tower'); await cdp.evaluate('window.createImageBitmap=window.__bitmap');
  await choose(third.modelId);
  await cdp.call('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await cdp.call('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 }); await delay(220);
  assert.equal(await cdp.evaluate('document.documentElement.scrollWidth<=innerWidth'), true);
  await cdp.evaluate("document.getElementById('landmark-canvas').scrollIntoView({block:'center'})");
  const point = await cdp.evaluate("(()=>{const r=document.getElementById('landmark-canvas').getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()");
  const touchBefore = (await state()).camera;
  await cdp.call('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: point.x, y: point.y, id: 1 }] });
  await cdp.call('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: point.x + 40, y: point.y + 20, id: 1 }] });
  await cdp.call('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await delay(250);
  assert.notDeepEqual((await state()).camera, touchBefore);
  await cdp.evaluate("document.querySelector('.model-toolbar').scrollIntoView({block:'start'})"); await screenshot('建筑工作台手机.png');
  await click('model-remove'); await until(async () => (await state()).library.localCount === 2, '移除模型并回到铁塔');
  assert.equal((await state()).modelId, 'eiffel-tower');
  assert.equal(await cdp.evaluate(`Object.hasOwn(CityView.KNOWN_MODELS,${JSON.stringify(third.modelId)})`), false);
  assert.deepEqual(requests, [], '模型导入、贴图、切换与恢复不请求网络'); unsubscribe();
  assert.equal(cdp.errors.length, 0, JSON.stringify(cdp.errors));
  console.log('建筑工作台浏览器检查通过：GLB/PNG/JPEG、文件校验、来源与下载、独立视角、完整保存刷新恢复、慢读取取消、快速切换、资源释放、手机触摸、移除与断网。');
}

async function standalone() {
  const runtimeRoot = path.join(ROOT, '.runtime'); await fs.mkdir(runtimeRoot, { recursive: true });
  const runtime = await fs.mkdtemp(path.join(runtimeRoot, 'workbench-browser-'));
  const screenshotDir = process.env.BROWSER_SCREENSHOT_DIR || path.join(runtimeRoot, '建筑工作台截图'); await fs.mkdir(screenshotDir, { recursive: true });
  const chrome = [process.env.CHROME_PATH, 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', '/usr/bin/google-chrome', '/usr/bin/chromium',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].filter(Boolean).find(file => require('node:fs').existsSync(file));
  if (!chrome) throw new Error('请安装 Chrome/Edge，或设置 CHROME_PATH');
  const profile = path.join(runtime, 'profile');
  const browser = spawn(chrome, ['--headless=new', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', ...(process.getuid?.() === 0 ? ['--no-sandbox'] : []), '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] });
  let cdp, logs = ''; browser.stderr.on('data', data => { logs = (logs + data).slice(-5000); });
  try {
    const port = await until(async () => { try { return Number((await fs.readFile(path.join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]); } catch { return false; } }, '工作台检查浏览器启动', 30000);
    const page = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(item => item.type === 'page');
    cdp = new CDP(page.webSocketDebuggerUrl); await cdp.call('Page.enable'); await cdp.call('Runtime.enable'); await cdp.call('Network.enable');
    await cdp.call('Network.setBlockedURLs', { urls: ['http://*', 'https://*'] });
    const html = process.env.CITY_RELEASE_HTML || await require('../scripts/build-standalone.cjs').build();
    await cdp.call('Page.navigate', { url: pathToFileURL(html).href }); await until(() => cdp.evaluate('Boolean(window.CityLandmarks)'), '离线工作台页面');
    await run({ cdp, runtime, screenshotDir });
  } catch (error) { console.error(logs); throw error; }
  finally { cdp?.socket.close(); if (browser.exitCode === null) browser.kill(); }
}
module.exports = { run };
if (require.main === module) standalone().catch(error => { console.error(error); process.exitCode = 1; });
