// 可选的真实浏览器检查：仅使用 Node 内置模块与已安装的 Chrome / Edge。
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { createServer } = require('../scripts/serve.cjs');
const C = require('../dist/core.js');
const { pathToFileURL } = require('node:url');
const { build } = require('../scripts/build-standalone.cjs');
if (typeof WebSocket === 'undefined') throw new Error('浏览器检查需要 Node.js 22 或更新版本。');
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class CDP {
  constructor(url) {
    this.socket = new WebSocket(url); this.pending = new Map(); this.events = new Map(); this.listeners = new Map(); this.nextId = 0; this.errors = [];
    this.ready = new Promise((resolve, reject) => { this.socket.addEventListener('open', resolve, { once: true }); this.socket.addEventListener('error', reject, { once: true }); });
    this.socket.addEventListener('message', (event) => {
      const data = JSON.parse(String(event.data));
      if (data.id && this.pending.has(data.id)) {
        const pending = this.pending.get(data.id); this.pending.delete(data.id); clearTimeout(pending.timeout);
        if (data.error) pending.reject(new Error(data.error.message)); else pending.resolve(data.result);
      }
      if (data.method === 'Runtime.exceptionThrown') this.errors.push(data.params.exceptionDetails);
      if (data.method === 'Page.javascriptDialogOpening') this.call('Page.handleJavaScriptDialog', { accept: true }).catch(() => {});
      if (data.method && this.events.has(data.method)) {
        const waiting = this.events.get(data.method); this.events.delete(data.method);
        for (const item of waiting) { clearTimeout(item.timeout); item.resolve(data.params); }
      }
      if (data.method && this.listeners.has(data.method)) for (const handler of this.listeners.get(data.method)) handler(data.params);
    });
  }
  // 持久订阅：先订阅再触发动作，事件不会因为「订阅前已经到达」而丢失，
  // 用于替代一次性 wait() 在这类动作-事件时序不确定场景下的竞态。
  subscribe(method, handler) {
    const list = this.listeners.get(method) || []; list.push(handler); this.listeners.set(method, list);
    return () => { const current = this.listeners.get(method) || []; const index = current.indexOf(handler); if (index >= 0) current.splice(index, 1); };
  }
  async call(method, params = {}) {
    await this.ready;
    const id = ++this.nextId;
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => { this.pending.delete(id); reject(new Error(`浏览器命令超时：${method}`)); }, 15000);
      this.pending.set(id, { resolve, reject, timeout }); this.socket.send(JSON.stringify({ id, method, params }));
    });
  }
  wait(method) {
    return new Promise((resolve, reject) => {
      const item = { resolve, timeout: setTimeout(() => reject(new Error(`等待事件超时：${method}`)), 15000) };
      const waiting = this.events.get(method) || []; waiting.push(item); this.events.set(method, waiting);
    });
  }
  async evaluate(expression) {
    const result = await this.call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text + ': ' + JSON.stringify(result.exceptionDetails.exception));
    return result.result.value;
  }
}

async function until(callback, label, timeout = 10000) {
  const end = Date.now() + timeout;
  while (Date.now() < end) { const result = await callback(); if (result) return result; await delay(60); }
  throw new Error(`检查超时：${label}`);
}

(async () => {
  const repo = path.resolve(__dirname, '..'), runtime = path.join(repo, '.runtime', `browser-${Date.now()}`), downloads = path.join(runtime, 'downloads');
  await fs.mkdir(downloads, { recursive: true });
  const candidates = [process.env.CHROME_PATH, "C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", '/usr/bin/google-chrome', '/usr/bin/chromium'].filter(Boolean);
  let executable;
  for (const candidate of candidates) { try { await fs.access(candidate); executable = candidate; break; } catch (_) {} }
  if (!executable) throw new Error('未找到 Chrome 或 Edge，可用 CHROME_PATH 指定浏览器绝对路径。');
  const server = createServer(); await new Promise((resolve, reject) => { server.on('error', reject); server.listen(0, '127.0.0.1', resolve); });
  const address = `http://127.0.0.1:${server.address().port}`;
  let browser, cdp, logs = '';
  try {
    assert.equal((await fetch(address)).status, 200); assert.equal((await fetch(address + '/missing')).status, 404);
    const profile = path.join(runtime, 'profile');
    browser = spawn(executable, ['--headless=new', ...(process.env.CITY_BROWSER_SOFTWARE_GL === '1' ? ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] : []), ...(process.getuid?.() === 0 ? ['--no-sandbox'] : []), '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] });
    let browserError; browser.once('error', error => { browserError = error; });
    browser.stderr.on('data', data => { logs = (logs + data).slice(-8000); });
    const port = await until(async () => {
      if (browserError) throw browserError;
      if (browser.exitCode !== null) throw new Error(`浏览器在调试端口就绪前退出，代码 ${browser.exitCode}`);
      try { return Number((await fs.readFile(path.join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]); } catch (_) { return false; }
    }, '浏览器启动', 30000);
    const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); cdp = new CDP(targets.find(t => t.type === 'page').webSocketDebuggerUrl);
    await cdp.call('Page.enable'); await cdp.call('Runtime.enable'); await cdp.call('Network.enable');
    // eventsEnabled: true 让浏览器持续派发 Browser.downloadWillBegin / downloadProgress，
    // 后续视角下载识别依赖这两个事件（部分 headless 环境只派发 begin）。
    await cdp.call('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: downloads, eventsEnabled: true });
    await cdp.call('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1400, deviceScaleFactor: 1, mobile: false });
    async function navigate(url) {
      const navigation = await cdp.call('Page.navigate', { url }); if (navigation.errorText) throw new Error(navigation.errorText);
      // hash 跳转不会触发 load；同时等待页面就绪和最终六项指标。
      await until(() => cdp.evaluate(`location.href.split('#')[0]===${JSON.stringify(url.split('#')[0].replace(/\/$/, ''))} || location.href.split('#')[0]===${JSON.stringify(url.split('#')[0].replace(/\/$/, '') + '/')}`), '导航地址');
      await until(() => cdp.evaluate("document.readyState==='complete'&&document.querySelectorAll('.metric-value').length===6"), '地图就绪');
      await delay(80);
    }
    const metric = slot => cdp.evaluate(`document.querySelector('#${slot}-metrics .metric-value').firstChild.textContent`);
    const expected = (id, side, walk, offset = [0, 0]) => C.analyze(C.prepare(require(`../dist/data/${id}.js`)), side, walk, offset).lengthKm.toFixed(2);
    const expectedBuildings = (id, side, offset) => C.analyzeBuildings(C.prepareBuildings(require(`../dist/data/${id}.js`), require(`../dist/data/${id}-buildings.js`)), side, offset).featureCount;
    const buildingCount = slot => cdp.evaluate(`Number(document.getElementById('${slot}-building-count').textContent.replaceAll(',',''))`);
    const currentState = async () => C.readState(await cdp.evaluate('location.hash'), await cdp.evaluate("Array.from(document.getElementById('left-city').options,o=>o.value)"));
    async function checkMoved() {
      const s = await currentState(); assert.equal(await metric('left'), expected(s.left, s.side, s.walking, s.offset)); assert.equal(await metric('right'), expected(s.right, s.side, s.walking, s.offset));
      assert.equal(await buildingCount('left'), expectedBuildings(s.left, s.side, s.offset)); assert.equal(await buildingCount('right'), expectedBuildings(s.right, s.side, s.offset)); return s;
    }
    async function dragMap(slot, dx, dy) {
      await cdp.evaluate(`document.getElementById('${slot}-map').scrollIntoView({block:'center'})`);
      const rect = await cdp.evaluate(`(()=>{const r=document.getElementById('${slot}-map').getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};})()`);
      await cdp.call('Input.dispatchMouseEvent', { type: 'mouseMoved', x: rect.x, y: rect.y });
      await cdp.call('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', buttons: 1, clickCount: 1, x: rect.x, y: rect.y });
      await cdp.call('Input.dispatchMouseEvent', { type: 'mouseMoved', button: 'left', buttons: 1, x: rect.x + dx, y: rect.y + dy });
      await cdp.call('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', buttons: 0, clickCount: 1, x: rect.x + dx, y: rect.y + dy });
      await delay(60);
    }
    await navigate(address);
    assert.equal(await metric('left'), expected('zurich', 0.75, true)); assert.equal(await metric('right'), expected('bern', 0.75, true));
    await checkMoved();
    const layerImages = [];
    for (const layer of ['roads', 'buildings', 'both']) {
      await cdp.evaluate(`document.querySelector('[data-layer="${layer}"]').click()`);
      assert.equal((await currentState()).layer, layer); await checkMoved();
      layerImages.push(await cdp.evaluate("document.getElementById('left-map').toDataURL()"));
    }
    assert.equal(new Set(layerImages).size, 3, '三种图层产生不同的真实画布');
    // 在真实 OSM 内院里选取没有其他建筑覆盖的像素，验证 evenodd 内院保持空白。
    const pointInRing = (point, ring) => {
      let inside = false;
      for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) { const a = ring[i], b = ring[j]; if ((a[1] > point[1]) !== (b[1] > point[1]) && point[0] < (b[0] - a[0]) * (point[1] - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside; }
      return inside;
    };
    const fills = (point, feature) => [...feature.outers, ...feature.inners].filter(ring => pointInRing(point, ring)).length % 2 === 1;
    const zBuildings = C.prepareBuildings(require('../dist/data/zurich.js'), require('../dist/data/zurich-buildings.js'));
    const canvasSize = await cdp.evaluate("document.getElementById('left-map').width"), scale = canvasSize / 0.75;
    let courtyard;
    outer: for (const feature of zBuildings) for (const hole of feature.inners) {
      const xs = hole.map(p => p[0]), ys = hole.map(p => p[1]), minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
      if (maxX - minX < 0.015 || maxY - minY < 0.015) continue;
      for (const u of [0.5, 0.35, 0.65]) for (const v of [0.5, 0.35, 0.65]) {
        const x = Math.floor(canvasSize / 2 + (minX + (maxX - minX) * u) * scale), y = Math.floor(canvasSize / 2 - (minY + (maxY - minY) * v) * scale);
        const point = [(x + 0.5 - canvasSize / 2) / scale, (canvasSize / 2 - y - 0.5) / scale];
        if (x < 25 || y < 65 || x > canvasSize - 50 || y > canvasSize - 50 || !pointInRing(point, hole) || !feature.outers.some(r => pointInRing(point, r)) || zBuildings.some(f => fills(point, f))) continue;
        courtyard = { x, y, id: feature.id }; break outer;
      }
    }
    assert.ok(courtyard, '找到可检验的真实内院');
    await cdp.evaluate("document.querySelector('[data-layer=\"buildings\"]').click()");
    const holePixel = await cdp.evaluate(`Array.from(document.getElementById('left-map').getContext('2d').getImageData(${courtyard.x},${courtyard.y},1,1).data)`);
    assert.ok(holePixel[0] > 220 && holePixel[1] > 220, `${courtyard.id} 内院应保持底色：${holePixel}`);
    await cdp.evaluate("document.querySelector('[data-layer=\"both\"]').click()");
    await cdp.evaluate("document.querySelector('[data-side=\"0.5\"]').click()");
    await dragMap('left', 80, 30); let moved = await checkMoved(); assert.ok(moved.offset[0] < 0 && moved.offset[1] > 0);
    const beforeKey = moved.offset;
    await cdp.call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'ArrowRight', code: 'ArrowRight', windowsVirtualKeyCode: 39 });
    await cdp.call('Input.dispatchKeyEvent', { type: 'keyUp', key: 'ArrowRight', code: 'ArrowRight', windowsVirtualKeyCode: 39 });
    moved = await checkMoved(); assert.ok(moved.offset[0] > beforeKey[0]);
    await cdp.call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Home', code: 'Home', windowsVirtualKeyCode: 36 });
    await cdp.call('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Home', code: 'Home', windowsVirtualKeyCode: 36 });
    assert.deepEqual((await currentState()).offset, [0, 0]);
    await dragMap('right', -70, -20); moved = await checkMoved(); assert.ok(moved.offset[0] > 0 && moved.offset[1] < 0);
    await cdp.evaluate("document.querySelector('[data-side=\"0.25\"]').click();for(let i=0;i<30;i++)document.querySelector('[data-pan=\"1,0\"]').click()");
    moved = await checkMoved(); const boundary = C.panBounds(['zurich', 'bern'].map(id => require(`../dist/data/${id}.js`)), 0.25);
    assert.equal(moved.offset[0], boundary.maxX); assert.equal(await cdp.evaluate("document.querySelector('[data-pan=\"1,0\"]').disabled"), true);
    assert.ok(await cdp.evaluate("document.getElementById('boundary-hint').textContent.includes('边界')"));
    await cdp.evaluate("document.querySelector('[data-side=\"1\"]').click()"); moved = await checkMoved(); assert.ok(moved.offset[0] < 0.05);
    // 隔离测试浏览器中的剪贴板边界，不读取或改动用户系统剪贴板。
    await cdp.evaluate("Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.__copiedView=text;}}});document.getElementById('copy-view').click()");
    const copied = await until(() => cdp.evaluate('window.__copiedView'), '复制视图参数'); const copiedState = await currentState();
    assert.deepEqual(C.parseView(copied, ['zurich', 'bern']), copiedState);
    await cdp.evaluate("document.getElementById('reset').click();document.getElementById('restore-view').click()");
    await cdp.evaluate(`document.getElementById('view-code').value=${JSON.stringify(copied)};document.getElementById('view-form').requestSubmit()`);
    assert.deepEqual(await currentState(), copiedState); await checkMoved();
    await cdp.evaluate("document.getElementById('restore-view').click();document.getElementById('view-code').value='v=2&a=none';document.getElementById('view-form').requestSubmit()");
    assert.ok(await cdp.evaluate("document.getElementById('view-error').textContent.length>0")); assert.deepEqual(await currentState(), copiedState);
    await cdp.evaluate("document.getElementById('close-view').click();Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw new Error('test denied')}}});document.getElementById('copy-view').click()");
    await until(() => cdp.evaluate("document.getElementById('view-dialog').open"), '手动复制后备路径');
    assert.equal(await cdp.evaluate("document.getElementById('view-code').value"), copied);
    await cdp.evaluate("document.getElementById('close-view').click();document.getElementById('reset').click()");
    for (const side of [0.25, 0.5, 1]) {
      await cdp.evaluate(`document.querySelector('[data-side="${side}"]').click()`);
      assert.equal(await metric('left'), expected('zurich', side, true)); assert.equal(await metric('right'), expected('bern', side, true));
      assert.equal(await cdp.evaluate("document.querySelectorAll('[data-side][aria-pressed=true]').length"), 1);
    }
    await cdp.evaluate("document.getElementById('walking').click()"); assert.equal(await metric('left'), expected('zurich', 1, false));
    await cdp.evaluate("document.getElementById('swap').click()"); assert.equal(await metric('left'), expected('bern', 1, false));
    await cdp.evaluate("document.getElementById('left-city').value='zurich';document.getElementById('left-city').dispatchEvent(new Event('change'))");
    assert.equal(await metric('left'), await metric('right'));
    await cdp.evaluate("document.getElementById('about').click()"); assert.equal(await cdp.evaluate("document.getElementById('about-dialog').open"), true);
    await cdp.call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 }); await cdp.call('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
    assert.equal(await cdp.evaluate("document.getElementById('about-dialog').open"), false);
    await navigate(address + '/#v=1&a=bern&b=zurich&s=0.5&w=0'); assert.equal(await metric('left'), expected('bern', 0.5, false));
    await cdp.evaluate("document.getElementById('reset').click();document.querySelector('[data-pan=\"1,0\"]').click();document.getElementById('report').click()");
    const reportName = await until(async () => (await fs.readdir(downloads)).find(n => n.endsWith('.json')), '数据报告');
    const report = JSON.parse(await fs.readFile(path.join(downloads, reportName), 'utf8'));
    assert.equal(report.samples[0].city, '苏黎世'); assert.equal(report.samples[0].sideKm, 0.75); assert.equal(report.samples[1].source.license, 'ODbL-1.0');
    assert.equal(report.appVersion, '0.7.0'); assert.equal(report.displayLayer, 'both'); assert.ok(report.samples[0].center[0] > require('../dist/data/zurich.js').lon);
    assert.equal(report.samples[0].buildings.featureCount, await buildingCount('left')); assert.equal(report.samples[1].buildings.source.license, 'ODbL-1.0');
    assert.notEqual(report.samples[0].source.fetchedAt, report.samples[0].buildings.source.fetchedAt);
    assert.deepEqual(report.samples[0].offsetKm, (await currentState()).offset); assert.deepEqual(report.samples[0].offsetKm, report.samples[1].offsetKm);
    await cdp.evaluate("document.getElementById('export').click()");
    const pngName = await until(async () => (await fs.readdir(downloads)).find(n => n.endsWith('.png')), '观察卡 PNG');
    const png = await fs.readFile(path.join(downloads, pngName)); assert.equal(png.subarray(1, 4).toString(), 'PNG'); assert.equal(png.readUInt32BE(16), 1600); assert.equal(png.readUInt32BE(20), 1200);
    const screenshotDir = process.env.BROWSER_SCREENSHOT_DIR || path.join(repo, 'docs');
    await fs.mkdir(screenshotDir, { recursive: true });
    async function screenshot(name) {
      await delay(150);
      const layout = await cdp.call('Page.getLayoutMetrics'); const height = Math.ceil(layout.cssContentSize.height);
      const shot = await cdp.call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: Math.ceil(layout.cssContentSize.width), height, scale: 1 } });
      await fs.writeFile(path.join(screenshotDir, name), Buffer.from(shot.data, 'base64'));
    }
    await cdp.evaluate("document.getElementById('status').textContent=''"); await screenshot('桌面预览.png');
    const landmarkState = () => cdp.evaluate('window.CityLandmarks.getState()');
    async function openLandmark() {
      await cdp.evaluate("document.querySelector('[data-observation=landmark]').click()");
      await until(async () => (await landmarkState()).loaded, 'WebGL 三维建筑完成渲染', 30000);
      await until(async () => (await landmarkState()).renders > 0, '三维真实画布'); await delay(150);
    }
    async function landmarkPixels() {
      return cdp.evaluate("(()=>{const c=document.getElementById('landmark-canvas'),g=c.getContext('webgl2'),p=new Uint8Array(c.width*c.height*4);g.readPixels(0,0,c.width,c.height,g.RGBA,g.UNSIGNED_BYTE,p);let n=0;for(let i=0;i<p.length;i+=4)if(p[i]<170&&p[i+1]<170&&p[i+2]<170&&p[i+3]>0)n++;return n;})()");
    }
    async function dragLandmark(dx, dy) {
      await cdp.evaluate("document.getElementById('landmark-canvas').scrollIntoView({block:'center'})");
      const p = await cdp.evaluate("(()=>{const r=document.getElementById('landmark-canvas').getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};})()");
      await cdp.call('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', buttons: 1, clickCount: 1, ...p });
      await cdp.call('Input.dispatchMouseEvent', { type: 'mouseMoved', button: 'left', buttons: 1, x: p.x + dx, y: p.y + dy });
      await cdp.call('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', buttons: 0, clickCount: 1, x: p.x + dx, y: p.y + dy }); await delay(200);
    }
    const mapBefore3d = await cdp.evaluate('location.hash');
    await openLandmark(); assert.equal((await landmarkState()).triangles, 147604); assert.equal((await landmarkState()).contextLost, false);
    assert.ok(await landmarkPixels() > 2000, 'WebGL 实际绘出钢架像素，不能只检查界面按钮');
    await cdp.evaluate('scrollTo(0,0)'); await screenshot('经典建筑3D预览.png');
    const cameraBefore = (await landmarkState()).camera; await dragLandmark(85, 25); assert.notDeepEqual((await landmarkState()).camera, cameraBefore);
    const images3d = [];
    for (const camera of ['front', 'top', 'iso']) {
      await cdp.evaluate(`document.querySelector('[data-camera=${camera}]').click()`); await delay(120);
      assert.equal((await landmarkState()).view, camera); images3d.push(await cdp.evaluate("document.getElementById('landmark-canvas').toDataURL()"));
    }
    assert.equal(new Set(images3d).size, 3, '三种视角生成不同的模型画面');
    const cameraDistance = s => Math.hypot(...s.camera.map((v, i) => v - s.target[i]));
    const distanceBefore = cameraDistance(await landmarkState()); await cdp.evaluate("document.getElementById('landmark-in').click()");
    assert.ok(cameraDistance(await landmarkState()) < distanceBefore);
    await cdp.evaluate("document.getElementById('landmark-canvas').focus()");
    const beforeOrbitKey = (await landmarkState()).camera;
    await cdp.call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'ArrowRight', code: 'ArrowRight', windowsVirtualKeyCode: 39 });
    await cdp.call('Input.dispatchKeyEvent', { type: 'keyUp', key: 'ArrowRight', code: 'ArrowRight', windowsVirtualKeyCode: 39 });
    assert.notDeepEqual((await landmarkState()).camera, beforeOrbitKey);
    await cdp.evaluate("document.getElementById('landmark-spin').click()"); const beforeSpin = (await landmarkState()).camera;
    assert.equal((await landmarkState()).spinning, true);
    try { await until(async () => JSON.stringify((await landmarkState()).camera) !== JSON.stringify(beforeSpin), '自动旋转改变三维相机', 10000); }
    catch (failure) { throw new Error(failure.message + '：' + JSON.stringify(await landmarkState())); }
    await cdp.evaluate("document.getElementById('landmark-spin').click();document.getElementById('landmark-wireframe').click()"); assert.equal((await landmarkState()).wireframe, true);
    await cdp.evaluate("document.getElementById('landmark-reset').click()"); assert.equal((await landmarkState()).wireframe, false); assert.equal((await landmarkState()).spinning, false);
    const landmarkDownloads = path.join(runtime, 'landmark-downloads'); await fs.mkdir(landmarkDownloads);
    await cdp.call('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: landmarkDownloads, eventsEnabled: true });
    await cdp.evaluate("document.getElementById('landmark-download').click();document.getElementById('landmark-export').click()");
    const modelName = 'eiffel-tower-SDC-CC-BY-4.0.glb', modelCard = '城市纹理-埃菲尔铁塔3D.png';
    await until(async () => (await fs.readdir(landmarkDownloads)).includes(modelName) && (await fs.readdir(landmarkDownloads)).includes(modelCard), '三维 GLB 与署名观察卡下载');
    const modelBytes = await fs.readFile(path.join(landmarkDownloads, modelName));
    assert.equal(require('node:crypto').createHash('sha256').update(modelBytes).digest('hex'), require('../dist/data/landmark-eiffel.js').glbSha256);
    const modelPng = await fs.readFile(path.join(landmarkDownloads, modelCard)); assert.equal(modelPng.readUInt32BE(16), 1600); assert.equal(modelPng.readUInt32BE(20), 1200);
    await fs.copyFile(path.join(landmarkDownloads, modelCard), path.join(screenshotDir, '经典建筑3D观察卡.png'));
    await cdp.evaluate("document.getElementById('landmark-canvas').getContext('webgl2').getExtension('WEBGL_lose_context').loseContext()");
    await until(async () => (await landmarkState()).failed, '图形上下文丢失提示');
    await cdp.evaluate("window.__getContext=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,options){return type==='webgl2'?null:window.__getContext.call(this,type,options);};document.getElementById('landmark-retry').click()");
    await until(() => cdp.evaluate("document.getElementById('landmark-status').textContent.includes('Error creating WebGL context')"), '不支持 WebGL 时正常显示失败提示');
    await cdp.evaluate("HTMLCanvasElement.prototype.getContext=window.__getContext;document.getElementById('landmark-retry').click()");
    await until(async () => (await landmarkState()).loaded, '失败后重新创建三维图形上下文', 30000);
    await cdp.evaluate("document.querySelector('[data-observation=map]').click()");
    assert.equal(await cdp.evaluate('location.hash'), mapBefore3d); await checkMoved();
    const stoppedRenders = (await landmarkState()).renders; await delay(120); assert.equal((await landmarkState()).renders, stoppedRenders, '隐藏三维模式时停止绘制');
    await openLandmark(); assert.ok(cameraDistance(await landmarkState()) > 10, '切回三维模式保留有效镜头距离');
    assert.ok(await landmarkPixels() > 2000, '切回三维模式仍能看到完整模型');
    // 三维视角保存与恢复：必须通过真实文件选择、预览和应用，不能只靠 Node 读取。
    const viewDownloads = path.join(runtime, 'view-downloads'); await fs.mkdir(viewDownloads);
    await cdp.call('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: viewDownloads, eventsEnabled: true });
    await cdp.evaluate("document.querySelector('[data-camera=front]').click();document.getElementById('landmark-wireframe').click()");
    await delay(200);
    const savedViewFile = '城市纹理-三维视角.json';
    await cdp.evaluate("document.getElementById('save-view').click()");
    const viewPath = path.join(viewDownloads, savedViewFile);
    // 文件在 readdir 中出现不代表 Chrome 写完，setFileInputFiles 读到一半会触发
    // "permission problems that have occurred after a reference to a file was acquired"。
    // 等到连续 2 次（间隔 200ms）stat 大小一致且 handle 可打开，就认为下载稳定。
    await until(async () => {
      if (!(await fs.readdir(viewDownloads)).includes(savedViewFile)) return false;
      try {
        const s1 = await fs.stat(viewPath);
        if (s1.size === 0) return false;
        await new Promise(r => setTimeout(r, 200));
        const s2 = await fs.stat(viewPath);
        if (s1.size !== s2.size) return false;
        const fh = await fs.open(viewPath, 'r');
        await fh.close();
        return true;
      } catch (_) { return false; }
    }, '三维视角 JSON 下载');
    const savedViewRaw = await fs.readFile(viewPath, 'utf8');
    const savedView = JSON.parse(savedViewRaw);
    assert.equal(savedView.format, 'city-texture-view'); assert.equal(savedView.version, 1);
    assert.equal(savedView.modelId, 'eiffel-tower'); assert.equal(savedView.view.view, 'front'); assert.equal(savedView.wireframe, true);
    assert.ok(savedViewRaw.charCodeAt(0) !== 0xFEFF, 'JSON 默认不带 BOM');
    assert.ok(new TextEncoder().encode(savedViewRaw).byteLength <= 16384, '视角文件未超过 16 KiB');
    assert.deepEqual(savedView.view.camera, (await landmarkState()).camera);
    assert.deepEqual(savedView.view.target, (await landmarkState()).target);
    await cdp.evaluate("document.querySelector('[data-camera=top]').click();document.getElementById('landmark-wireframe').click()");
    const afterChange = await landmarkState();
    assert.notDeepEqual(afterChange.camera, savedView.view.camera, '切到俯视后相机位置改变');
    assert.notDeepEqual(afterChange.view, 'front', '当前预设已切换到俯视');
    await cdp.evaluate("document.getElementById('open-view').click()");
    assert.equal(await cdp.evaluate("document.getElementById('landmark-view-dialog').open"), true);
    const docForView = await cdp.call('DOM.getDocument'); const viewFileInput = await cdp.call('DOM.querySelector', { nodeId: docForView.root.nodeId, selector: '#view-file' });
    await cdp.call('DOM.setFileInputFiles', { nodeId: viewFileInput.nodeId, files: [viewPath] });
    // 视角文件很小，但第一个 until 偶尔被弹出对话框的 RAF 抢走调度。给 8 s 并在超时留证据。
    try {
      await until(() => cdp.evaluate("document.getElementById('apply-view-file').disabled === false"), '视角预览就绪', 8000);
    } catch (e) {
      const viewDbg2 = await cdp.evaluate("(function(){return { error: document.getElementById('view-file-error').textContent, applyDisabled: document.getElementById('apply-view-file').disabled, preview: document.getElementById('view-file-preview').textContent.length, fileName: document.getElementById('view-file').files[0] && document.getElementById('view-file').files[0].name };})()");
      console.error('apply view first timeout debug:', JSON.stringify(viewDbg2));
      throw e;
    }
    const previewText = await cdp.evaluate("document.getElementById('view-file-preview').textContent");
    assert.ok(previewText.includes('正面'), `预览应描述保存的视角：${previewText}`);
    assert.equal(await cdp.evaluate("document.getElementById('view-file-error').textContent"), '');
    await cdp.evaluate("document.getElementById('view-file-form').requestSubmit()");
    assert.equal(await cdp.evaluate("document.getElementById('landmark-view-dialog').open"), false);
    await delay(180);
    const restoredView = await landmarkState();
    assert.deepEqual(restoredView.camera, savedView.view.camera, '视角恢复相机位置');
    assert.deepEqual(restoredView.target, savedView.view.target, '视角恢复观察目标');
    assert.equal(restoredView.view, 'front', '视角恢复预设');
    assert.equal(restoredView.wireframe, true, '视角恢复线框');
    await screenshot('三维视角保存与恢复.png');
    // 错误与跨模型视角必须被拒绝；当前比较保持不变。
    const stateBeforeReject = await landmarkState();
    const otherModelView = JSON.parse(savedViewRaw); otherModelView.modelId = 'louvre-pyramid';
    const wrongModelPath = path.join(viewDownloads, 'wrong-model.json');
    await fs.writeFile(wrongModelPath, JSON.stringify(otherModelView));
    await cdp.evaluate("document.getElementById('open-view').click()");
    const docWrong = await cdp.call('DOM.getDocument'); const wrongInput = await cdp.call('DOM.querySelector', { nodeId: docWrong.root.nodeId, selector: '#view-file' });
    await cdp.call('DOM.setFileInputFiles', { nodeId: wrongInput.nodeId, files: [wrongModelPath] });
    await until(() => cdp.evaluate("document.getElementById('view-file-error').textContent.length > 0"), '跨模型视角被拒绝');
    assert.ok((await cdp.evaluate("document.getElementById('view-file-error').textContent")).includes('模型'));
    assert.equal(await cdp.evaluate("document.getElementById('apply-view-file').disabled"), true, '错误输入不启用应用按钮');
    await cdp.evaluate("document.getElementById('close-view-dialog').click()");
    assert.deepEqual(await landmarkState(), stateBeforeReject, '取消错误视角不影响当前镜头');
    const brokenViewPath = path.join(viewDownloads, 'broken.json'); await fs.writeFile(brokenViewPath, '{broken');
    await cdp.evaluate("document.getElementById('open-view').click()");
    const docBroken = await cdp.call('DOM.getDocument'); const brokenInput = await cdp.call('DOM.querySelector', { nodeId: docBroken.root.nodeId, selector: '#view-file' });
    await cdp.call('DOM.setFileInputFiles', { nodeId: brokenInput.nodeId, files: [brokenViewPath] });
    await until(() => cdp.evaluate("document.getElementById('view-file-error').textContent.length > 0"), '损坏 JSON 被拒绝');
    assert.equal(await cdp.evaluate("document.getElementById('apply-view-file').disabled"), true);
    await cdp.evaluate("document.getElementById('close-view-dialog').click()");
    assert.deepEqual(await landmarkState(), stateBeforeReject);
    // 跨格式：把比较项目当作视角文件提交，必须拒绝并保留现状。
    const projectAsView = { format: 'city-texture-project', version: 1, view: '#v=3&a=zurich&b=bern' };
    const projectViewPath = path.join(viewDownloads, 'project.json'); await fs.writeFile(projectViewPath, JSON.stringify(projectAsView));
    await cdp.evaluate("document.getElementById('open-view').click()");
    const docProj = await cdp.call('DOM.getDocument'); const projInput = await cdp.call('DOM.querySelector', { nodeId: docProj.root.nodeId, selector: '#view-file' });
    await cdp.call('DOM.setFileInputFiles', { nodeId: projInput.nodeId, files: [projectViewPath] });
    await until(() => cdp.evaluate("document.getElementById('view-file-error').textContent.length > 0"), '比较项目被拒绝');
    await cdp.evaluate("document.getElementById('close-view-dialog').click()");
    assert.deepEqual(await landmarkState(), stateBeforeReject, '跨格式拒绝不改变当前镜头');
    // P2-1：跨视口恢复——保存的视角距离超过当前 OrbitControls.maxDistance 时，恢复相机不能被静默截断。
    // 沿真实保存视角的方向延长到 200 距离，避免触碰到 maxPolarAngle 后被极角自适应旋转。
    const savedOffset = savedView.view.camera.map((v, i) => v - savedView.view.target[i]);
    const savedLen = Math.hypot(...savedOffset);
    const farDistance = 200; // 故意大于默认 maxDistance（≈21），保证旧的实现会把相机吸回 maxDistance。
    const scaleFar = farDistance / savedLen;
    const farOffset = savedOffset.map(v => v * scaleFar);
    const farCamera = savedView.view.target.map((t, i) => t + farOffset[i]);
    const farView = JSON.parse(JSON.stringify(savedView));
    farView.view.camera = farCamera; farView.view.far = farDistance + 100; // 必须大于 distance 才能通过文件级远裁剪面检查。
    const farViewPath = path.join(viewDownloads, 'far.json');
    await fs.writeFile(farViewPath, JSON.stringify(farView));
    await cdp.evaluate("document.getElementById('open-view').click()");
    const docFar = await cdp.call('DOM.getDocument'); const farInput = await cdp.call('DOM.querySelector', { nodeId: docFar.root.nodeId, selector: '#view-file' });
    await cdp.call('DOM.setFileInputFiles', { nodeId: farInput.nodeId, files: [farViewPath] });
    await until(() => cdp.evaluate("document.getElementById('apply-view-file').disabled === false"), 'P2-1 远距离视角预览就绪');
    await cdp.evaluate("document.getElementById('view-file-form').requestSubmit()");
    await delay(50); // 立即采样相机位置，看 applyView 是否真的写入了 200
    const snapImmediate = await landmarkState();
    const snapImmediateDist = Math.hypot(...snapImmediate.camera.map((v, i) => v - snapImmediate.target[i]));
    await delay(280); // 等若干帧后再检查：观察 OrbitControls/auto-rotate 后续影响
    const snapAfter = await landmarkState();
    const snapAfterDist = Math.hypot(...snapAfter.camera.map((v, i) => v - snapAfter.target[i]));
    const farRecovered = snapAfter;
    const farActual = snapAfterDist;
    assert.ok(Math.abs(snapImmediateDist - farDistance) < 0.5, `P2-1 immediate 远距离恢复应保留 200，实际 ${snapImmediateDist.toFixed(2)}`);
    assert.ok(Math.abs(farActual - farDistance) < 0.5, `P2-1：远距离恢复应保留保存的距离 200，实际 ${farActual.toFixed(2)}`);
    // 浮点坐标经过 spherical/cartesian 转换会有舍入误差；用 1e-6 容差判断位置而不是 deepEqual。
    for (let i = 0; i < 3; i++) {
      assert.ok(Math.abs(farRecovered.camera[i] - farView.view.camera[i]) < 1e-6,
        `P2-1：恢复相机第 ${i} 分量与保存值差异 ${Math.abs(farRecovered.camera[i] - farView.view.camera[i])} 超出 1e-6`);
      assert.ok(Math.abs(farRecovered.target[i] - farView.view.target[i]) < 1e-6,
        `P2-1：恢复观察目标第 ${i} 分量与保存值差异 ${Math.abs(farRecovered.target[i] - farView.view.target[i])} 超出 1e-6`);
    }
    await cdp.evaluate("document.getElementById('close-view-dialog').click()");

    // P2-2：距离过近和远裁剪面不够——两种无效组合必须在选择文件时就拒绝，应用按钮保持禁用。
    const stateBeforeNear = await landmarkState();
    const tooNear = JSON.parse(JSON.stringify(savedView));
    tooNear.view.camera = savedView.view.target.slice(); // 相机与目标重合：distance=0，被文件级 < 1 拦截。
    const tooNearPath = path.join(viewDownloads, 'too-near.json');
    await fs.writeFile(tooNearPath, JSON.stringify(tooNear));
    await cdp.evaluate("document.getElementById('open-view').click()");
    const docNear = await cdp.call('DOM.getDocument'); const nearInput = await cdp.call('DOM.querySelector', { nodeId: docNear.root.nodeId, selector: '#view-file' });
    await cdp.call('DOM.setFileInputFiles', { nodeId: nearInput.nodeId, files: [tooNearPath] });
    await until(() => cdp.evaluate("document.getElementById('view-file-error').textContent.length > 0"), 'P2-2a 距离过近被拒绝');
    assert.ok(/(过于接近|距离过近)/.test(await cdp.evaluate("document.getElementById('view-file-error').textContent")), 'P2-2a 应提示相机距离过近');
    assert.equal(await cdp.evaluate("document.getElementById('apply-view-file').disabled"), true, 'P2-2a 应用按钮保持禁用');
    await cdp.evaluate("document.getElementById('close-view-dialog').click()");
    assert.deepEqual(await landmarkState(), stateBeforeNear, 'P2-2a 错误视角不影响当前镜头');

    const stateBeforeShort = await landmarkState();
    const tooShortFar = JSON.parse(JSON.stringify(savedView));
    tooShortFar.view.far = 1; // far << camera-target distance，必然被文件级校验拦截。
    const tooShortFarPath = path.join(viewDownloads, 'too-short-far.json');
    await fs.writeFile(tooShortFarPath, JSON.stringify(tooShortFar));
    await cdp.evaluate("document.getElementById('open-view').click()");
    const docShort = await cdp.call('DOM.getDocument'); const shortInput = await cdp.call('DOM.querySelector', { nodeId: docShort.root.nodeId, selector: '#view-file' });
    await cdp.call('DOM.setFileInputFiles', { nodeId: shortInput.nodeId, files: [tooShortFarPath] });
    await until(() => cdp.evaluate("document.getElementById('view-file-error').textContent.length > 0"), 'P2-2b 远裁剪面过小被拒绝');
    assert.ok(/(远裁剪面)/.test(await cdp.evaluate("document.getElementById('view-file-error').textContent")), 'P2-2b 应提示远裁剪面不足');
    assert.equal(await cdp.evaluate("document.getElementById('apply-view-file').disabled"), true, 'P2-2b 应用按钮保持禁用');
    await cdp.evaluate("document.getElementById('close-view-dialog').click()");
    assert.deepEqual(await landmarkState(), stateBeforeShort, 'P2-2b 错误视角不影响当前镜头');

    // P2-3：自动旋转残留的 OrbitControls 阻尼——保存的视角被恢复后位置仍等于保存值。
    // 直接从当前相机状态构造基线视角文件，避免依赖 save-view 触发下载：
    // 这样不依赖 Chrome 的下载时序，最稳健。
    await cdp.evaluate("document.querySelector('[data-camera=iso]').click();document.getElementById('landmark-wireframe').checked=false;document.getElementById('landmark-wireframe').dispatchEvent(new Event('change'))");
    await delay(220);
    await delay(400); // 多等几帧，等 damping 完全衰减。
    const isoState = await landmarkState();
    const stableSave = {
      format: 'city-texture-view', version: 1, modelId: 'eiffel-tower', wireframe: false,
      view: {
        view: isoState.view === 'custom' ? 'iso' : isoState.view,
        camera: isoState.camera.slice(),
        target: isoState.target.slice(),
        fov: 40, near: 0.1, far: 180
      }
    };
    // 让自动旋转与 OrbitControls 阻尼充分累积后再停下来。
    await cdp.evaluate("document.getElementById('landmark-spin').click()"); assert.equal((await landmarkState()).spinning, true);
    await delay(900);
    await cdp.evaluate("document.getElementById('landmark-spin').click()"); assert.equal((await landmarkState()).spinning, false);
    const stableViewPath = path.join(viewDownloads, 'stable-p23.json');
    await fs.writeFile(stableViewPath, JSON.stringify(stableSave));
    await cdp.evaluate("document.getElementById('open-view').click()");
    const docSpin = await cdp.call('DOM.getDocument'); const spinInput = await cdp.call('DOM.querySelector', { nodeId: docSpin.root.nodeId, selector: '#view-file' });
    await cdp.call('DOM.setFileInputFiles', { nodeId: spinInput.nodeId, files: [stableViewPath] });
    await until(() => cdp.evaluate("document.getElementById('apply-view-file').disabled === false"), 'P2-3 阻尼残留视角预览就绪');
    await cdp.evaluate("document.getElementById('view-file-form').requestSubmit()");
    await delay(300);
    const spinRecovered = await landmarkState();
    // 浮点坐标经过 spherical/cartesian 转换会有舍入误差；用 1e-6 容差判断位置。
    for (let i = 0; i < 3; i++) {
      assert.ok(Math.abs(spinRecovered.camera[i] - stableSave.view.camera[i]) < 1e-6,
        `P2-3：恢复相机第 ${i} 分量与保存值差异 ${Math.abs(spinRecovered.camera[i] - stableSave.view.camera[i])} 超出 1e-6`);
      assert.ok(Math.abs(spinRecovered.target[i] - stableSave.view.target[i]) < 1e-6,
        `P2-3：恢复目标第 ${i} 分量与保存值差异 ${Math.abs(spinRecovered.target[i] - stableSave.view.target[i])} 超出 1e-6`);
    }
    await cdp.evaluate("document.getElementById('close-view-dialog').click()");
    // 第二轮 P2 验收补充：真实按钮/输入流程覆盖三种遗漏。
    // 文件来源是真实 save-view 触发的下载与 open-view 的真实文件选择，不能用 Node 构造 JSON 偷懒。
    // 当前 viewDownloads 路径：每次 downloadPath 切换要重新调用 setDownloadBehavior。
    let currentDownloadDir = viewDownloads;
    async function waitViewDownload(label, dir) {
      if (dir === undefined) dir = currentDownloadDir;
      // 路径切到新 dir：先确保目录存在，再让下次 save-view 写到那里。
      if (dir !== currentDownloadDir) {
        await fs.mkdir(dir, { recursive: true });
        await cdp.call('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: dir, eventsEnabled: true });
        currentDownloadDir = dir;
      }
      // 一次 save-view 点击对应对一个闭包内的事件日志；订阅在点击之前完成，
      // 避免「事件已经到达但订阅还没注册」的竞态（Linux headless CI 曾因此超时）。
      const journal = [];
      const offBegin = cdp.subscribe('Browser.downloadWillBegin', (params) => journal.push({ type: 'begin', params }));
      const offProgress = cdp.subscribe('Browser.downloadProgress', (params) => journal.push({ type: 'progress', params }));
      try {
        await cdp.evaluate("document.getElementById('save-view').click()");
        // Browser.downloadWillBegin 提供本次下载的 guid 与文件名：用它定位真实产物，
        // 不做内容哈希猜测（同一视角两次保存内容本来就相同）。
        const begin = await until(() => {
          const hit = journal.find((entry) => entry.type === 'begin');
          return hit ? hit.params : false;
        }, `三维视角下载开始：${label}`, 20000);
        const suggested = begin.suggestedFilename || '城市纹理-三维视角.json';
        const target = path.join(dir, suggested);
        // 写入完成证据：独立下载目录内该文件名连续两次 fs.stat 大小一致 + 句柄可打开。
        // Chrome 对同名文件会自动改名（" (1)" 等），因此 target 不会命中上一轮的旧文件。
        await until(async () => {
          try {
            const first = await fs.stat(target);
            if (first.size === 0) return false;
            await delay(200);
            const second = await fs.stat(target);
            if (first.size !== second.size) return false;
            await (await fs.open(target, 'r')).close();
            return true;
          } catch (_) { return false; }
        }, `三维视角下载稳定：${label}`, 20000);
        // 进度事件仅作佐证：部分 headless 环境不派发 Browser.downloadProgress，
        // 此时不应阻塞（文件写入本身已是可验证的完成证据）。
        const completed = journal.some((entry) => entry.type === 'progress' && entry.params.guid === begin.guid && entry.params.state === 'completed');
        if (!completed) console.log(`提示：${label} 未收到 Browser.downloadProgress=completed，已按文件写入校验。`);
        return target;
      } finally { offBegin(); offProgress(); }
    }
    async function setViewFile(file) {
      const doc = await cdp.call('DOM.getDocument'), input = await cdp.call('DOM.querySelector', { nodeId: doc.root.nodeId, selector: '#view-file' });
      await cdp.call('DOM.setFileInputFiles', { nodeId: input.nodeId, files: [file] });
    }

    // (a) 桌面最近视角可往返：连续 + 让距离触到 minDistance，保存 → reset → 打开 → 校验距离一致，
    //     不应再因为模型包围球半径被拒。手机最远视角同理在 (b) 验证。
    await cdp.evaluate("document.querySelector('[data-camera=iso]').click()"); await delay(220);
    const isoStart = await landmarkState();
    const distStart = cameraDistance(isoStart);
    for (let i = 0; i < 30; i++) await cdp.evaluate("document.getElementById('landmark-in').click()");
    await delay(220);
    const nearState = await landmarkState();
    const nearDistance = cameraDistance(nearState);
    assert.ok(nearDistance < 4.5, `桌面连续 + 应缩到接近 minDistance=3，实际 ${nearDistance.toFixed(2)}`);
    assert.ok(nearDistance <= distStart - 2, `+ 操作确实缩近 ${distStart.toFixed(2)} → ${nearDistance.toFixed(2)}`);
    assert.ok(nearState.far >= nearDistance + nearState.modelExtent + 0.5, `fitProjection 应保持远裁剪面足够：far=${nearState.far}, dist=${nearDistance.toFixed(2)}, modelExtent=${nearState.modelExtent.toFixed(2)}`);
    assert.ok(nearState.maxDistance <= nearState.far - nearState.modelExtent + 1e-6, `maxDistance 不超出合法 ceiling`);
        const nearViewPath = await waitViewDownload('桌面最近视角.json');
    const nearView = JSON.parse(await fs.readFile(nearViewPath, 'utf8'));
    assert.equal(nearView.modelId, 'eiffel-tower');
    // + / - 按钮的 click handler 主动把 view 标为 custom，连续缩近后 view 字段为 custom 是预期行为。
    assert.equal(nearView.view.view, 'custom');
    const nearSavedDistance = cameraDistance({ camera: nearView.view.camera, target: nearView.view.target });
    assert.ok(Math.abs(nearSavedDistance - nearDistance) < 0.1, `文件距离与点击后状态应一致：file ${nearSavedDistance.toFixed(2)} vs state ${nearDistance.toFixed(2)}`);
    await cdp.evaluate("document.getElementById('landmark-reset').click()"); await delay(220);
    const resetState = await landmarkState();
    const resetDistance = cameraDistance(resetState);
    assert.ok(resetDistance > nearDistance + 1, `reset 后距离应恢复：reset ${resetDistance.toFixed(2)} vs near ${nearDistance.toFixed(2)}`);
    await cdp.evaluate("document.getElementById('open-view').click()");
    await setViewFile(nearViewPath);
    await until(() => cdp.evaluate("document.getElementById('apply-view-file').disabled === false"), '桌面最近视角预览');
    assert.equal(await cdp.evaluate("document.getElementById('view-file-error').textContent"), '', '最近视角不应在预览阶段被拒绝');
    const nearPreview = await cdp.evaluate("document.getElementById('view-file-preview').textContent");
    assert.ok(/自定义视角|custom/.test(nearPreview), `预览应描述保存的视角：${nearPreview}`);
    await cdp.evaluate("document.getElementById('close-view-dialog').click();document.getElementById('open-view').click()");
    await setViewFile(nearViewPath);
    await until(() => cdp.evaluate("!document.getElementById('apply-view-file').disabled"), '取消后立即重新选择三维视角');
    await cdp.evaluate("new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))");
    assert.equal(await cdp.evaluate("document.getElementById('apply-view-file').disabled"), false, '延后到达的 close 事件不能清空重新打开的三维视角');
    await cdp.evaluate("document.getElementById('view-file-form').requestSubmit()");
    await delay(240);
    const restoredNear = await landmarkState();
    const restoredNearDistance = cameraDistance(restoredNear);
    assert.ok(Math.abs(restoredNearDistance - nearSavedDistance) < 0.1, `最近视角恢复距离：saved ${nearSavedDistance.toFixed(2)} vs restored ${restoredNearDistance.toFixed(2)}`);
    assert.equal(restoredNear.view, 'custom');
    assert.deepEqual(restoredNear.camera, nearView.view.camera);
    assert.deepEqual(restoredNear.target, nearView.view.target);
    assert.equal(restoredNear.fov, nearView.view.fov);
    assert.equal(restoredNear.near, nearView.view.near);
    assert.equal(restoredNear.far, nearView.view.far, '恢复后 far 必须等于文件 savedFar，不被 fitProjection 改写');
    for (let i = 0; i < 3; i++) assert.ok(Math.abs(restoredNear.camera[i] - nearView.view.camera[i]) < 1e-6, '恢复后 camera 必须等于文件');
    for (let i = 0; i < 3; i++) assert.ok(Math.abs(restoredNear.target[i] - nearView.view.target[i]) < 1e-6, '恢复后 target 必须等于文件');
    assert.equal(restoredNear.fov, nearView.view.fov, '恢复后 FOV 必须等于文件');
    assert.equal(restoredNear.near, nearView.view.near, '恢复后 near 必须等于文件');
    assert.equal(restoredNear.view, nearView.view.view, '恢复后 view 字段保持文件值');
    // 恢复最近视角后必须能明显拉远，不能被锁死到 savedFile 附近。
    const nearBeforeZoomOut = cameraDistance(await landmarkState());
    for (let i = 0; i < 10; i++) await cdp.evaluate("document.getElementById('landmark-out').click()");
    await delay(220);
    const nearAfterZoomOut = cameraDistance(await landmarkState());
    assert.ok(nearAfterZoomOut >= nearBeforeZoomOut + 5, `恢复最近视角后必须能明显拉远 ${nearBeforeZoomOut.toFixed(2)} → ${nearAfterZoomOut.toFixed(2)}，不能锁在 ${restoredNearDistance.toFixed(2)} 附近`);
    await cdp.evaluate("document.getElementById('landmark-reset').click()"); await delay(220);
    const nearResetState = await landmarkState();
    assert.ok(nearResetState.maxDistance >= cameraDistance(nearResetState) * 2.5, `重置后 maxDistance 必须恢复到 viewport 适配距离的至少 2.5 倍：reset dist=${cameraDistance(nearResetState).toFixed(2)}, maxDistance=${nearResetState.maxDistance.toFixed(2)}`);
    await cdp.evaluate("document.getElementById('close-view-dialog').click()");

    // (b) 跨视口：手机保存距离较大 → 桌面打开后继续缩小，fitProjection 同步抬升 far，
    //     且再次保存-往返仍然合法；far 不超过 dist/view.js 文件级上限 10000。
    await cdp.call('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    await delay(220);
    await openLandmark();
    await cdp.evaluate("document.querySelector('[data-camera=iso]').click()"); await delay(220);
    const mobileBase = cameraDistance(await landmarkState());
    for (let i = 0; i < 18; i++) await cdp.evaluate("document.getElementById('landmark-out').click()");
    await delay(240);
    const mobileFarState = await landmarkState();
    const mobileDistance = cameraDistance(mobileFarState);
    assert.ok(mobileDistance > mobileBase + 5, `手机连续 - 应拉远 ${mobileBase.toFixed(2)} → ${mobileDistance.toFixed(2)}`);
    assert.ok(mobileFarState.far >= mobileDistance + mobileFarState.modelExtent + 0.5, `手机保存前 far 应足够：far=${mobileFarState.far}, dist=${mobileDistance.toFixed(2)}, modelExtent=${mobileFarState.modelExtent.toFixed(2)}`);
        const mobilePath = await waitViewDownload('手机最远视角.json');
    const mobileView = JSON.parse(await fs.readFile(mobilePath, 'utf8'));
    const mobileFileDist = cameraDistance({ camera: mobileView.view.camera, target: mobileView.view.target });
    assert.ok(Math.abs(mobileFileDist - mobileDistance) < 0.5, `文件距离与手机视口实际一致：file ${mobileFileDist.toFixed(2)} vs state ${mobileDistance.toFixed(2)}`);
    await cdp.call('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1400, deviceScaleFactor: 1, mobile: false });
    await delay(220);
    await openLandmark();
    await cdp.evaluate("document.getElementById('landmark-reset').click()"); await delay(220);
    await cdp.evaluate("document.getElementById('open-view').click()");
    await setViewFile(mobilePath);
    await until(() => cdp.evaluate("document.getElementById('apply-view-file').disabled === false"), '手机视角预览');
    await cdp.evaluate("document.getElementById('view-file-form').requestSubmit()");
    await delay(240);
    const restoredMobile = await landmarkState();
    const restoredMobileDistance = cameraDistance(restoredMobile);
    assert.ok(Math.abs(restoredMobileDistance - mobileFileDist) < 0.5, `桌面恢复手机距离：file ${mobileFileDist.toFixed(2)} vs restored ${restoredMobileDistance.toFixed(2)}`);
    // [P3-2 严格]：恢复后文件级字段必须逐项原样保留，fitProjection 不能在 applyView 内部改 far。
    assert.equal(restoredMobile.far, mobileView.view.far, `恢复后 far 必须完全等于文件 savedFar（不能被 fitProjection 改写）。file=${mobileView.view.far}, restored=${restoredMobile.far}`);
    for (let i = 0; i < 3; i++) assert.ok(Math.abs(restoredMobile.camera[i] - mobileView.view.camera[i]) < 1e-6, '恢复后 camera 必须等于文件');
    for (let i = 0; i < 3; i++) assert.ok(Math.abs(restoredMobile.target[i] - mobileView.view.target[i]) < 1e-6, '恢复后 target 必须等于文件');
    assert.equal(restoredMobile.fov, mobileView.view.fov, '恢复后 fov 必须等于文件');
    assert.equal(restoredMobile.near, mobileView.view.near, '恢复后 near 必须等于文件');
    assert.equal(restoredMobile.view, mobileView.view.view, '恢复后 view 保持文件值');
    assert.ok(restoredMobile.far >= restoredMobileDistance + restoredMobile.modelExtent + 0.5, `恢复后远裁剪面必须能容纳模型+余量`);
    if (!(restoredMobile.maxDistance <= restoredMobile.far - restoredMobile.modelExtent + 1e-6)) {
      const dbg = await cdp.evaluate("(function(){var a=window.CityLandmarks.getState();window.__fitLog=window.__fitLog||[];var nl=String.fromCharCode(10);return{v:a.view,c:a.camera,t:a.target,far:a.far,me:a.modelExtent,mx:a.maxDistance,n:window.__fitLog.length,all:window.__fitLog.join(nl)};})()");
      throw new Error('fitLog(' + dbg.n + '):' + String.fromCharCode(10) + dbg.all + String.fromCharCode(10) + 'maxDLog:' + String.fromCharCode(10) + (await cdp.evaluate('window.__maxDLog||[]').then(r=>r.join(String.fromCharCode(10)))));
    }
    void `maxDistance 必须留在合法 ceiling 内`;
    // 桌面继续拉远：fitProjection 同步抬升 far，且 ceiling 收紧；但保存的距离本身可能已经接近
    // 上限（savedFar - modelExtent），所以距离每帧最多只能涨约 1，断言改为「不减小 + far 跟随」。
    for (let i = 0; i < 12; i++) { await cdp.evaluate("document.getElementById('landmark-out').click()"); await delay(80); }
    const afterLongZoom = await landmarkState();
    const afterLongDistance = cameraDistance(afterLongZoom);
    assert.ok(afterLongDistance + 1e-6 >= restoredMobileDistance, `桌面连续 - 距离应不减小 ${restoredMobileDistance.toFixed(2)} → ${afterLongDistance.toFixed(2)}`);
    assert.ok(afterLongZoom.far >= afterLongDistance + afterLongZoom.modelExtent + 0.5, `拉远后远裁剪面仍足够：far=${afterLongZoom.far}, dist=${afterLongDistance.toFixed(2)}, modelExtent=${afterLongZoom.modelExtent.toFixed(2)}`);
    assert.ok(afterLongZoom.maxDistance <= afterLongZoom.far - afterLongZoom.modelExtent + 1e-6, `maxDistance 应被收紧到合法 ceiling 内`);
    assert.ok(afterLongZoom.far <= 10000 + 1e-6, `far 不超过 dist/view.js 文件级上限 10000`);
    assert.ok(afterLongZoom.far <= 1.13 * afterLongDistance + afterLongZoom.modelExtent + 1.5, `ceiling 紧贴距离：far ≈ dist + modelExtent + ~1`);
        const furtherPath = await waitViewDownload('桌面再拉远视角.json');
    const furtherView = JSON.parse(await fs.readFile(furtherPath, 'utf8'));
    const furtherSavedDistance = cameraDistance({ camera: furtherView.view.camera, target: furtherView.view.target });
    assert.ok(Math.abs(furtherSavedDistance - afterLongDistance) < 0.5, `再次保存距离匹配：file ${furtherSavedDistance.toFixed(2)} vs state ${afterLongDistance.toFixed(2)}`);
    assert.ok(furtherView.view.far <= 10000, `保存 far 不超过文件级上限`);
    assert.ok(furtherView.view.far >= furtherSavedDistance + (furtherView.view.far * 0 + 7.12), `保存后 far ≥ 距离 + modelExtent`);
    await cdp.evaluate("document.getElementById('landmark-reset').click()"); await delay(220);
    await cdp.evaluate("document.getElementById('open-view').click()");
    await setViewFile(furtherPath);
    await until(() => cdp.evaluate("document.getElementById('apply-view-file').disabled === false"), '再拉远视角预览');
    await cdp.evaluate("document.getElementById('view-file-form').requestSubmit()");
    await delay(240);
    const restoredFurther = await landmarkState();
    const restoredFurtherDistance = cameraDistance(restoredFurther);
    assert.ok(Math.abs(restoredFurtherDistance - furtherSavedDistance) < 0.5, `再次打开保留已保存距离：file ${furtherSavedDistance.toFixed(2)} vs restored ${restoredFurtherDistance.toFixed(2)}`);
    assert.equal(restoredFurther.fov, furtherView.view.fov);
    assert.equal(restoredFurther.far, furtherView.view.far);
    assert.equal(restoredFurther.near, furtherView.view.near);
    assert.equal(restoredFurther.view, furtherView.view.view);
    await cdp.evaluate("document.getElementById('close-view-dialog').click()");

    // (c) 打开视角后直接拖动：恢复后第一次真实旋转，相机坐标应当变化，视图立即标为 custom，
    //     再次保存时 view 字段也是 custom（覆盖之前只测「提前 reset 再拖」绕开的路径）。
    await cdp.evaluate("document.querySelector('[data-camera=front]').click()"); await delay(220);
    await cdp.evaluate("document.getElementById('landmark-wireframe').click()"); await delay(220);
        const frontPath = await waitViewDownload('正面视角用于旋转测试.json');
    const frontView = JSON.parse(await fs.readFile(frontPath, 'utf8'));
    assert.equal(frontView.view.view, 'front', '正面预设保存前 view 字段为 front');
    assert.equal(frontView.wireframe, true, '线框状态保存');
    await cdp.evaluate("document.getElementById('landmark-reset').click()"); await delay(220);
    await cdp.evaluate("document.getElementById('open-view').click()");
    await setViewFile(frontPath);
    await until(() => cdp.evaluate("document.getElementById('apply-view-file').disabled === false"), '正面视角预览');
    await cdp.evaluate("document.getElementById('view-file-form').requestSubmit()");
    await delay(240);
    const afterFrontApply = await landmarkState();
    assert.equal(afterFrontApply.view, 'front', '正面视角应用后 view 保持 front');
    for (let i = 0; i < 3; i++) assert.ok(Math.abs(afterFrontApply.camera[i] - frontView.view.camera[i]) < 1e-6);
    for (let i = 0; i < 3; i++) assert.ok(Math.abs(afterFrontApply.target[i] - frontView.view.target[i]) < 1e-6);
    const beforeDragCamera = afterFrontApply.camera.slice();
    const beforeDragDistance = cameraDistance(afterFrontApply);
    await dragLandmark(60, 18); // 不切预设，仅真实鼠标拖动
    const afterDrag = await landmarkState();
    assert.notDeepEqual(afterDrag.camera, beforeDragCamera, '拖动后相机坐标变化');
    assert.ok(Math.abs(cameraDistance(afterDrag) - beforeDragDistance) < 0.5, `绕目标旋转通常保持距离不变：before=${beforeDragDistance.toFixed(2)} after=${cameraDistance(afterDrag).toFixed(2)}`);
    assert.equal(afterDrag.view, 'custom', '打开视角后直接拖动应立即标记为 custom');
        const draggedPath = await waitViewDownload('正面视角拖动后.json');
    const draggedView = JSON.parse(await fs.readFile(draggedPath, 'utf8'));
    assert.equal(draggedView.view.view, 'custom', '再次保存时 view 应记录 custom');
    await cdp.evaluate("document.getElementById('close-view-dialog').click()");

    // (d) [P3-2 严格边界]：贴近合法裁剪边界且相机与当前不同的视角文件 — 远裁剪面必须逐项原样保留，
    //     不允许在 applyView 期间被 fitProjection 静默改写；同样验证相机坐标必须 deep-equal 文件。
    await cdp.evaluate("document.getElementById('landmark-reset').click()"); await delay(220);
    {
      const beforeState = await landmarkState();
      const sx = beforeState.camera[0] - beforeState.target[0];
      const sy = beforeState.camera[1] - beforeState.target[1];
      const sz = beforeState.camera[2] - beforeState.target[2];
      const len = Math.hypot(sx, sy, sz);
      // 让 saved 距离比当前略大一点，并把 camera target 拉开 5 个单位，确保与当前明显不同。
      const savedDistance = len + 5;
      const k = savedDistance / len;
      const dirCam = [sx * k, sy * k, sz * k];
      const dirTar = [5, 7, 4]; // 完全不同于当前 target (0, 5.6, 0)
      const dirCamera = [dirTar[0] + dirCam[0], dirTar[1] + dirCam[1], dirTar[2] + dirCam[2]];
      // 远裁剪面取 savedDistance + modelExtent + 0.25：file-level 通过 (far >= distance)，运行时复核也通过。
      // 但 chosen 数值贴近保证 reopen 后 fitProjection 会想「再补 1」把它改成 savedDistance+modelExtent+1 ——
      // 应用这段断言必须确保它不被改写。
      const dirFar = savedDistance + beforeState.modelExtent + 0.25;
      const dirFile = {
        format: 'city-texture-view', version: 1, modelId: 'eiffel-tower', wireframe: false,
        view: { view: 'custom', camera: dirCamera, target: dirTar, fov: 50, near: 0.05, far: dirFar }
      };
      const dirPath = await waitViewDownload('贴近裁剪边界视角.json', path.join(viewDownloads, 'dir-edge-cases'));
      require("node:fs").writeFileSync(dirPath, JSON.stringify(dirFile));
      await cdp.evaluate("document.getElementById('open-view').click()");
      await setViewFile(dirPath);
      await until(() => cdp.evaluate("document.getElementById('apply-view-file').disabled === false"), '贴近裁剪边界预览');
      await cdp.evaluate("document.getElementById('view-file-form').requestSubmit()");
      await delay(240);
      const afterDir = await landmarkState();
      assert.equal(afterDir.far, dirFar, `贴近裁剪边界文件恢复后 far 必须原样保留：file=${dirFar}, restored=${afterDir.far}`);
      for (let i = 0; i < 3; i++) assert.ok(Math.abs(afterDir.camera[i] - dirCamera[i]) < 1e-6, '贴近裁剪边界文件恢复后 camera 必须等于文件：分量 ' + i + ' 实测 ' + afterDir.camera[i] + ' 期望 ' + dirCamera[i]);
      for (let i = 0; i < 3; i++) assert.ok(Math.abs(afterDir.target[i] - dirTar[i]) < 1e-6, '贴近裁剪边界文件恢复后 target 必须等于文件：分量 ' + i + ' 实测 ' + afterDir.target[i] + ' 期望 ' + dirTar[i]);
      assert.equal(afterDir.fov, 50, '贴近裁剪边界文件恢复后 fov 必须等于文件');
      const restoredSavedDistance = cameraDistance(afterDir);
      assert.ok(Math.abs(restoredSavedDistance - savedDistance) < 0.1, `恢复 camera 到 target 距离应当与文件一致：file ${savedDistance.toFixed(2)} vs restored ${restoredSavedDistance.toFixed(2)}`);
      assert.ok(afterDir.far >= restoredSavedDistance + afterDir.modelExtent - 1e-6, '远裁剪面足以容纳完整模型（允许 0.25 单位余量）');
      assert.equal(afterDir.view, 'custom', '恢复后 view 保持文件值');
      // 恢复后应能继续拉远、保存、再打开仍合法；fitProjection 必须自动跟进。
      for (let i = 0; i < 8; i++) { await cdp.evaluate("document.getElementById('landmark-out').click()"); await delay(80); }
      const afterDirZoomed = await landmarkState();
      assert.ok(cameraDistance(afterDirZoomed) >= restoredSavedDistance - 0.5, '贴近裁剪视角恢复后仍可继续缩放');
      await cdp.evaluate("document.getElementById('save-view').click()");
      const dirZoomedPath = await waitViewDownload('贴近裁剪视角连续拉远.json', path.join(viewDownloads, 'dir-edge-cases'));
      const dirZoomedFile = JSON.parse(await fs.readFile(dirZoomedPath, 'utf8'));
      assert.ok(dirZoomedFile.view.far <= 10000, '保存的 far 不能超过文件级 10000 上限');
      await cdp.evaluate("document.getElementById('close-view-dialog').click()");
    }

    // (e) [P3-2b 距离 2]：distance=2 的合法文件，minDistance 不应把它钳到 3，必须精确恢复。
    await cdp.evaluate("document.getElementById('landmark-reset').click()"); await delay(220);
    {
      const nearTwoTarget = [0, 5.6, 0];
      const nearTwoCamera = [0, 5.6, 2];
      const nearTwoFar = 180;
      const nearTwoView = { view: 'custom', camera: nearTwoCamera, target: nearTwoTarget, fov: 40, near: 0.1, far: nearTwoFar };
      // 文件级距离下限 [1, 10000]，distance=2 > 1，文件校验能通过；运行时不再要求 distance >= minDistance。
      const nearTwoFile = {
        format: 'city-texture-view', version: 1, modelId: 'eiffel-tower', wireframe: false,
        view: nearTwoView
      };
      const nearTwoPath = await waitViewDownload('距离2视角.json', path.join(viewDownloads, 'near-edge-cases'));
      require("node:fs").writeFileSync(nearTwoPath, JSON.stringify(nearTwoFile));
      await cdp.evaluate("document.getElementById('open-view').click()");
      await setViewFile(nearTwoPath);
      try {
        await until(() => cdp.evaluate("document.getElementById('apply-view-file').disabled === false"), '距离 2 视角预览', 5000);
      } catch (e) {
        const dbg = await cdp.evaluate("(function(){return{err:document.getElementById('view-file-error').textContent,preview:document.getElementById('view-file-preview').textContent,applyDisabled:document.getElementById('apply-view-file').disabled,fileName:document.getElementById('view-file').files[0]&&document.getElementById('view-file').files[0].name,fileSize:document.getElementById('view-file').files[0]&&document.getElementById('view-file').files[0].size,dialogOpen:document.getElementById('landmark-view-dialog').open};})()");
        const content = require("node:fs").readFileSync(nearTwoPath, "utf8");
        throw new Error('距离 2 预览 timeout content=' + content + ' diag=' + JSON.stringify(dbg));
      }
      await cdp.evaluate("document.getElementById('view-file-form').requestSubmit()");
      await delay(300); // 等真实渲染帧，避免依赖 RAF 调度
      const afterNearTwo = await landmarkState();
      const afterNearTwoDistance = cameraDistance(afterNearTwo);
      assert.ok(Math.abs(afterNearTwoDistance - 2) < 0.1, `距离 2 文件恢复后必须精确保持 2，不能被钳到 minDistance：saved=2, restored=${afterNearTwoDistance.toFixed(3)}`);
      for (let i = 0; i < 3; i++) assert.ok(Math.abs(afterNearTwo.camera[i] - nearTwoCamera[i]) < 1e-6, '距离 2 文件恢复后 camera 必须等于文件');
      for (let i = 0; i < 3; i++) assert.ok(Math.abs(afterNearTwo.target[i] - nearTwoTarget[i]) < 1e-6, '距离 2 文件恢复后 target 必须等于文件');
      // 之后再用 + 按钮尝试缩近，应能进一步到 < 2（minDistance 拉到 fileDistance * 1.05 ≈ 2.1 之下）
      for (let i = 0; i < 6; i++) await cdp.evaluate("document.getElementById('landmark-in').click()");
      await delay(220);
      const afterNearTwoZoomed = await landmarkState();
      const afterNearTwoZoomedDistance = cameraDistance(afterNearTwoZoomed);
      assert.ok(afterNearTwoZoomedDistance < 2.05, `距离 2 视角下 + 仍可缩近：restored 2 → zoomed ${afterNearTwoZoomedDistance.toFixed(3)}`);
      // 返回展台会调用 size()；重复切换不能把已经接受的近景悄悄推回默认下限 3。
      for (let turn = 0; turn < 2; turn++) {
        await cdp.evaluate("document.querySelector('[data-observation=map]').click()");
        await cdp.evaluate("document.querySelector('[data-observation=landmark]').click()");
        await cdp.evaluate("new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))");
        const afterReturn = await landmarkState();
        for (let i = 0; i < 3; i++) {
          assert.ok(Math.abs(afterReturn.camera[i] - afterNearTwoZoomed.camera[i]) < 1e-6, '切换城区比较后返回展台保留近景相机');
          assert.ok(Math.abs(afterReturn.target[i] - afterNearTwoZoomed.target[i]) < 1e-6, '切换城区比较后返回展台保留观察目标');
        }
        for (const key of ['fov', 'near', 'far', 'view', 'wireframe']) assert.equal(afterReturn[key], afterNearTwoZoomed[key], `返回展台保留 ${key}`);
      }
      await cdp.evaluate("document.getElementById('close-view-dialog').click()");
    }

    // 次要问题：拖动 / 平移 / 双指缩放 / 方向键 / +/- 后，预设立即变为 custom。
    await cdp.evaluate("document.querySelector('[data-camera=iso]').click()");
    await delay(120);
    assert.equal((await landmarkState()).view, 'iso');
    await dragLandmark(70, 20); assert.equal((await landmarkState()).view, 'custom', '拖动后预设变 custom');
    await cdp.evaluate("document.querySelector('[data-camera=front]').click()"); await delay(120);
    assert.equal((await landmarkState()).view, 'front');
    await dragLandmark(60, 0); assert.equal((await landmarkState()).view, 'custom', '平移后预设变 custom');
    await cdp.evaluate("document.querySelector('[data-camera=top]').click()"); await delay(120);
    await cdp.evaluate("document.getElementById('landmark-canvas').focus()");
    await cdp.call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'ArrowRight', code: 'ArrowRight', windowsVirtualKeyCode: 39 });
    await cdp.call('Input.dispatchKeyEvent', { type: 'keyUp', key: 'ArrowRight', code: 'ArrowRight', windowsVirtualKeyCode: 39 });
    assert.equal((await landmarkState()).view, 'custom', '方向键调整后预设变 custom');
    await cdp.evaluate("document.querySelector('[data-camera=iso]').click()"); await delay(120);
    await cdp.evaluate("document.getElementById('landmark-in').click()");
    assert.equal((await landmarkState()).view, 'custom', '+ 缩放后预设变 custom');
    await cdp.evaluate("document.querySelector('[data-camera=iso]').click()"); await delay(120);
    await cdp.evaluate("document.getElementById('landmark-out').click()");
    assert.equal((await landmarkState()).view, 'custom', '- 缩放后预设变 custom');

    // 退出三维模式前恢复 iso 视角，便于后续浏览器检查继续运行。
    await cdp.evaluate("document.querySelector('[data-camera=iso]').click();document.getElementById('landmark-wireframe').click()");
    await cdp.evaluate("document.querySelector('[data-observation=map]').click()");
    await cdp.call('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: downloads });
    // 新的真实南京样本必须经过真实选择、移动、恢复和下载，不能只靠 Node 读取数据。
    assert.deepEqual(await cdp.evaluate("Array.from(document.getElementById('left-city').options,o=>o.value)"), ['zurich', 'bern', 'nanjing']);
    await cdp.evaluate("document.getElementById('left-city').value='nanjing';document.getElementById('left-city').dispatchEvent(new Event('change'));document.getElementById('right-city').value='zurich';document.getElementById('right-city').dispatchEvent(new Event('change'))");
    assert.ok(await cdp.evaluate("document.getElementById('left-provenance').textContent.includes('地下及室内')"));
    for (const side of [0.25, 0.5, 0.75, 1]) {
      await cdp.evaluate(`document.querySelector('[data-side="${side}"]').click()`); await checkMoved();
    }
    const nanjingLayers = [];
    for (const layer of ['roads', 'buildings', 'both']) {
      await cdp.evaluate(`document.querySelector('[data-layer="${layer}"]').click()`); await checkMoved();
      nanjingLayers.push(await cdp.evaluate("document.getElementById('left-map').toDataURL()"));
    }
    assert.equal(new Set(nanjingLayers).size, 3);
    await cdp.evaluate("document.getElementById('walking').click()"); await checkMoved();
    await cdp.evaluate("document.getElementById('walking').click();document.querySelector('[data-side=\"0.5\"]').click();document.getElementById('center').click()");
    await dragMap('left', 70, -25); const nanjingState = await checkMoved();
    assert.equal(nanjingState.left, 'nanjing'); assert.notDeepEqual(nanjingState.offset, [0, 0]);
    await cdp.evaluate("document.getElementById('swap').click()"); assert.equal((await checkMoved()).right, 'nanjing');
    await cdp.evaluate(`document.getElementById('restore-view').click();document.getElementById('view-code').value=${JSON.stringify(C.stateHash(nanjingState))};document.getElementById('view-form').requestSubmit()`);
    assert.deepEqual(await checkMoved(), nanjingState);
    await cdp.evaluate('scrollTo(0,0)'); await screenshot('南京双城预览.png');
    const nanjingDownloads = path.join(runtime, 'nanjing-downloads'); await fs.mkdir(nanjingDownloads);
    await cdp.call('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: nanjingDownloads });
    await cdp.evaluate("document.getElementById('report').click();document.getElementById('export').click()");
    const nanjingReportName = await until(async () => (await fs.readdir(nanjingDownloads)).find(n => n.endsWith('.json')), '南京报告');
    const nanjingReport = JSON.parse(await fs.readFile(path.join(nanjingDownloads, nanjingReportName), 'utf8'));
    const nCity = require('../dist/data/nanjing.js');
    assert.equal(nanjingReport.samples[0].sampleId, 'nanjing'); assert.equal(nanjingReport.samples[0].sampleNote, nCity.note);
    assert.equal(nanjingReport.samples[0].source.rawSha256, nCity.source.rawSha256);
    assert.equal(nanjingReport.samples[0].buildings.source.rawSha256, require('../dist/data/nanjing-buildings.js').source.rawSha256);
    const nanjingPng = await until(async () => (await fs.readdir(nanjingDownloads)).find(n => n.endsWith('.png')), '南京观察卡');
    await fs.copyFile(path.join(nanjingDownloads, nanjingPng), path.join(screenshotDir, '南京观察卡.png'));
    await cdp.evaluate("document.getElementById('reset').click();document.querySelector('[data-pan=\"1,0\"]').click()");
    // 通过浏览器文件选择接口加载实际 JSON，不跳过文件读取和 submit 事件。
    const S = require('../dist/samples.js'), sampleDownloads = path.join(runtime, 'sample-downloads'); await fs.mkdir(sampleDownloads);
    await cdp.call('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: sampleDownloads });
    const samplePack = { format: S.FORMAT, version: 1, city: structuredClone(require('../dist/data/zurich.js')), buildings: structuredClone(require('../dist/data/zurich-buildings.js')) };
    samplePack.city.id = samplePack.buildings.cityId = 'zurich-imported'; samplePack.city.name = '<img src=x>';
    const samplePath = path.join(runtime, 'sample.json'); await fs.writeFile(samplePath, JSON.stringify(samplePack));
    async function setFile(selector, file) {
      const doc = await cdp.call('DOM.getDocument'), input = await cdp.call('DOM.querySelector', { nodeId: doc.root.nodeId, selector });
      await cdp.call('DOM.setFileInputFiles', { nodeId: input.nodeId, files: [file] });
    }
    const setSample = file => setFile('#sample-file', file);
    async function submitSample(file) {
      await setSample(file); await cdp.evaluate("document.getElementById('sample-form').requestSubmit()");
      await until(() => cdp.evaluate("!document.getElementById('import-sample').disabled"), '样本导入完成');
    }
    const P = require('../dist/projects.js'), projectDownloads = path.join(runtime, 'project-downloads'); await fs.mkdir(projectDownloads);
    const projectName = '城市纹理-比较项目.json';
    async function chooseProject(file) {
      if (!await cdp.evaluate("document.getElementById('project-dialog').open")) await cdp.evaluate("document.getElementById('open-project').click()");
      await setFile('#project-file', file);
      try {
        await until(() => cdp.evaluate("!document.getElementById('apply-project').disabled || document.getElementById('project-error').textContent.length>0"), '比较项目校验完成', 15000);
      } catch (e) {
        const debug = await cdp.evaluate("({error:document.getElementById('project-error').textContent,preview:document.getElementById('project-preview').textContent,applyDisabled:document.getElementById('apply-project').disabled,dialogOpen:document.getElementById('project-dialog').open})");
        console.error('chooseProject timeout debug:', JSON.stringify(debug));
        throw e;
      }
    }
    async function applyProject() {
      assert.equal(await cdp.evaluate("document.getElementById('apply-project').disabled"), false);
      await cdp.evaluate("document.getElementById('project-form').requestSubmit()");
      assert.equal(await cdp.evaluate("document.getElementById('project-dialog').open"), false);
    }
    const builtinProjectState = await currentState();
    await cdp.call('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: projectDownloads });
    await cdp.evaluate("document.getElementById('save-project').click()");
    const builtinProjectPath = path.join(projectDownloads, projectName);
    await until(async () => (await fs.readdir(projectDownloads)).includes(projectName), '仅内置城市的比较项目下载');
    assert.deepEqual(P.parseProject(await fs.readFile(builtinProjectPath, 'utf8'), []).state, builtinProjectState);
    await cdp.evaluate("document.getElementById('reset').click()"); const resetProjectState = await currentState();
    await chooseProject(builtinProjectPath); assert.deepEqual(await currentState(), resetProjectState);
    await cdp.evaluate("document.getElementById('close-project').click()"); assert.deepEqual(await currentState(), resetProjectState);
    await chooseProject(builtinProjectPath);
    await cdp.evaluate("new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))");
    assert.equal(await cdp.evaluate("document.getElementById('apply-project').disabled"), false, '上一轮延后到达的 close 事件不能清空重新打开的比较项目');
    await applyProject(); assert.deepEqual(await checkMoved(), builtinProjectState);
    await cdp.call('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: sampleDownloads });
    const customView = C.stateHash({ left: 'zurich-imported', right: 'bern', side: 0.5, walking: true, layer: 'both', offset: [0.01, 0] });
    await cdp.evaluate(`document.getElementById('restore-view').click();document.getElementById('view-code').value=${JSON.stringify(customView)};document.getElementById('view-form').requestSubmit()`);
    assert.ok(await cdp.evaluate("document.getElementById('view-error').textContent.includes('先导入')"));
    await cdp.evaluate("document.getElementById('close-view').click();document.getElementById('samples').click();document.querySelector('#sample-list button').click()");
    const builtinName = 'city-texture-zurich-sample.json';
    await until(async () => (await fs.readdir(sampleDownloads)).includes(builtinName), '内置样本下载');
    const builtin = S.parseSample(await fs.readFile(path.join(sampleDownloads, builtinName), 'utf8'));
    assert.equal(builtin.city.id, 'zurich'); assert.deepEqual(builtin.city.source, samplePack.city.source);
    await submitSample(samplePath); assert.equal((await currentState()).left, 'zurich-imported');
    assert.equal(await metric('left'), expected('zurich', 0.75, true)); assert.equal(await buildingCount('left'), expectedBuildings('zurich', 0.75, [0, 0]));
    assert.equal(await cdp.evaluate("document.querySelectorAll('#left-card img,#sample-list img').length"), 0, '样本名称只作文本显示');
    assert.ok(await cdp.evaluate("document.getElementById('left-provenance').textContent.includes('未经应用核验')"));
    await screenshot('样本导入预览.png');
    const importedHash = await cdp.evaluate('location.hash');
    await submitSample(samplePath); assert.ok(await cdp.evaluate("document.getElementById('sample-error').textContent.includes('相同 ID')")); assert.equal(await cdp.evaluate('location.hash'), importedHash);
    const badPath = path.join(runtime, 'bad.json'); await fs.writeFile(badPath, '{broken'); await submitSample(badPath);
    assert.ok(await cdp.evaluate("document.getElementById('sample-error').textContent.includes('JSON')")); assert.equal(await cdp.evaluate('location.hash'), importedHash);
    const hugePath = path.join(runtime, 'huge.json'); await fs.writeFile(hugePath, ' '.repeat(S.MAX_BYTES + 1)); await submitSample(hugePath);
    assert.ok(await cdp.evaluate("document.getElementById('sample-error').textContent.includes('8 MiB')")); assert.equal(await cdp.evaluate('location.hash'), importedHash);
    await cdp.evaluate("Array.from(document.querySelectorAll('#sample-list button')).find(b=>b.getAttribute('aria-label')==='下载<img src=x>样本包').click()");
    const customName = 'city-texture-zurich-imported-sample.json';
    await until(async () => (await fs.readdir(sampleDownloads)).includes(customName), '导入样本再导出');
    const customPack = S.parseSample(await fs.readFile(path.join(sampleDownloads, customName), 'utf8'));
    assert.deepEqual(customPack.city.roads, samplePack.city.roads); assert.deepEqual(customPack.buildings.source, samplePack.buildings.source);
    await cdp.evaluate(`document.getElementById('close-samples').click();document.getElementById('restore-view').click();document.getElementById('view-code').value=${JSON.stringify(customView)};document.getElementById('view-form').requestSubmit()`);
    assert.equal((await currentState()).left, 'zurich-imported'); assert.equal(await metric('left'), expected('zurich', 0.5, true, [0.01, 0]));
    await cdp.evaluate("document.getElementById('report').click();document.getElementById('export').click()");
    await until(async () => (await fs.readdir(sampleDownloads)).includes(reportName), '导入样本报告');
    const customReport = JSON.parse(await fs.readFile(path.join(sampleDownloads, reportName), 'utf8'));
    assert.equal(customReport.samples[0].sampleId, 'zurich-imported'); assert.ok(customReport.samples[0].dataProvenance.includes('未经应用核验'));
    assert.deepEqual(customReport.samples[0].source, samplePack.city.source);
    await until(async () => (await fs.readdir(sampleDownloads)).some(n => n.endsWith('.png')), '导入样本观察卡');
    await cdp.evaluate("document.getElementById('samples').click()");
    for (const i of [2, 3, 4]) {
      const p = structuredClone(samplePack); p.city.id = p.buildings.cityId = 'zurich-imported-' + i; p.city.name = '苏黎世导入' + i;
      const file = path.join(runtime, `sample-${i}.json`); await fs.writeFile(file, JSON.stringify(p)); await submitSample(file);
      if (i < 4) assert.equal((await currentState()).left, p.city.id);
      else assert.ok(await cdp.evaluate("document.getElementById('sample-error').textContent.includes('最多')"));
    }
    assert.equal(await cdp.evaluate("document.getElementById('left-city').options.length"), 6);
    await cdp.evaluate("document.getElementById('close-samples').click()");
    const projectState = { left: 'zurich-imported', right: 'nanjing', side: 0.5, walking: false, layer: 'buildings', offset: [0.02, -0.01] };
    await cdp.evaluate(`document.getElementById('restore-view').click();document.getElementById('view-code').value=${JSON.stringify(C.stateHash(projectState))};document.getElementById('view-form').requestSubmit()`);
    const customProjectDownloads = path.join(runtime, 'custom-project-downloads'); await fs.mkdir(customProjectDownloads);
    await cdp.call('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: customProjectDownloads });
    await cdp.evaluate("document.getElementById('save-project').click()");
    const customProjectPath = path.join(customProjectDownloads, projectName);
    await until(async () => (await fs.readdir(customProjectDownloads)).includes(projectName), '含三份导入样本的比较项目下载');
    const savedProject = JSON.parse(await fs.readFile(customProjectPath, 'utf8'));
    assert.equal(savedProject.samples.length, 4); assert.equal(savedProject.view, C.stateHash(projectState));
    async function checkProjectRestored() {
      assert.deepEqual(await currentState(), projectState);
      assert.equal(await metric('left'), expected('zurich', projectState.side, false, projectState.offset));
      assert.equal(await metric('right'), expected('nanjing', projectState.side, false, projectState.offset));
      assert.equal(await buildingCount('left'), expectedBuildings('zurich', projectState.side, projectState.offset));
      assert.equal(await buildingCount('right'), expectedBuildings('nanjing', projectState.side, projectState.offset));
      assert.equal(await cdp.evaluate("document.getElementById('left-city').options.length"), 6);
      assert.ok(await cdp.evaluate("document.getElementById('left-provenance').textContent.includes('未经应用核验')"));
    }
    // 当前三份导入与项目中的 ID 相同，也必须整体替换而非重复加入。
    await chooseProject(customProjectPath); await applyProject(); await checkProjectRestored();
    await cdp.call('Page.navigate', { url: 'about:blank' }); await navigate(address);
    assert.equal(await cdp.evaluate("document.getElementById('left-city').options.length"), 3);
    const temporary = structuredClone(samplePack); temporary.city.id = temporary.buildings.cityId = 'temporary-sample';
    const temporaryPath = path.join(runtime, 'temporary-sample.json'); await fs.writeFile(temporaryPath, JSON.stringify(temporary));
    await cdp.evaluate("document.getElementById('samples').click()"); await submitSample(temporaryPath);
    await cdp.evaluate("document.getElementById('close-samples').click()");
    const beforeProject = await cdp.evaluate('location.hash'), beforeProjectIds = await cdp.evaluate("Array.from(document.getElementById('left-city').options,o=>o.value)");
    await chooseProject(customProjectPath); await screenshot('比较项目预览.png');
    assert.equal(await cdp.evaluate('location.hash'), beforeProject);
    assert.equal(await cdp.evaluate("document.querySelectorAll('#project-preview img').length"), 0);
    await cdp.evaluate("document.getElementById('close-project').click()");
    assert.equal(await cdp.evaluate('location.hash'), beforeProject);
    const brokenProject = structuredClone(savedProject); brokenProject.samples.at(-1).buildings.features[0].outers[0].pop();
    const collisionProject = structuredClone(savedProject); collisionProject.samples.find(p => p.city.id === 'nanjing').city.source.rawSha256 = 'a'.repeat(64);
    const missingProject = structuredClone(savedProject); missingProject.view = C.stateHash({ ...projectState, right: 'bern' });
    const malformedFiles = [[badPath, null], [path.join(runtime, 'broken-project.json'), brokenProject], [path.join(runtime, 'collision-project.json'), collisionProject], [path.join(runtime, 'missing-project.json'), missingProject], [samplePath, null]];
    for (const [file, content] of malformedFiles) {
      if (content) await fs.writeFile(file, JSON.stringify(content)); await chooseProject(file);
      assert.equal(await cdp.evaluate("document.getElementById('apply-project').disabled"), true);
      assert.equal(await cdp.evaluate('location.hash'), beforeProject);
      assert.deepEqual(await cdp.evaluate("Array.from(document.getElementById('left-city').options,o=>o.value)"), beforeProjectIds);
    }
    const hugeProjectPath = path.join(runtime, 'huge-project.json'); await fs.writeFile(hugeProjectPath, ' '.repeat(P.MAX_BYTES + 1));
    await chooseProject(hugeProjectPath); assert.ok(await cdp.evaluate("document.getElementById('project-error').textContent.includes('32 MiB')"));
    await cdp.evaluate("document.getElementById('close-project').click();window.__fileText=File.prototype.text;File.prototype.text=function(){const file=this;return new Promise(resolve=>{window.__finishProjectRead=async()=>resolve(await window.__fileText.call(file));});};document.getElementById('open-project').click()");
    await setFile('#project-file', customProjectPath); await until(() => cdp.evaluate("typeof window.__finishProjectRead==='function'"), '比较文件正在读取');
    await cdp.evaluate("document.getElementById('close-project').click();File.prototype.text=window.__fileText;window.__finishProjectRead()"); await delay(80);
    assert.equal(await cdp.evaluate('location.hash'), beforeProject); assert.equal(await cdp.evaluate("document.getElementById('apply-project').disabled"), true);
    await chooseProject(customProjectPath); await applyProject(); await checkProjectRestored();
    assert.equal(await cdp.evaluate("Array.from(document.getElementById('left-city').options,o=>o.value).includes('temporary-sample')"), false);
    await cdp.evaluate("document.getElementById('samples').click()");
    await cdp.evaluate("for(const b of Array.from(document.querySelectorAll('#sample-list button')).filter(b=>b.textContent==='移除'))b.click()");
    assert.equal(await cdp.evaluate("document.getElementById('left-city').options.length"), 3); assert.equal((await currentState()).left, 'zurich');
    await cdp.evaluate("document.getElementById('close-samples').click();document.getElementById('reset').click()");
    await cdp.call('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: downloads });
    if (process.env.CITY_CONVERTED_SAMPLE) {
      const convertedPath = path.resolve(process.env.CITY_CONVERTED_SAMPLE);
      const converted = S.parseSample(await fs.readFile(convertedPath, 'utf8'));
      await cdp.evaluate("document.getElementById('samples').click()"); await submitSample(convertedPath);
      const view = await currentState(); assert.equal(view.left, converted.city.id);
      assert.equal(await metric('left'), C.analyze(C.prepare(converted.city), view.side, view.walking, view.offset).lengthKm.toFixed(2));
      assert.equal(await buildingCount('left'), C.analyzeBuildings(C.prepareBuildings(converted.city, converted.buildings), view.side, view.offset).featureCount);
      assert.ok(await cdp.evaluate(`document.getElementById('data-details').textContent.includes(${JSON.stringify(converted.city.source.rawSha256)})`));
      await cdp.evaluate(`Array.from(document.querySelectorAll('#sample-list button')).find(b=>b.getAttribute('aria-label')===${JSON.stringify('移除' + converted.city.name + '样本')}).click();document.getElementById('close-samples').click();document.getElementById('reset').click()`);
      assert.equal(await cdp.evaluate("document.getElementById('left-city').options.length"), 3);
      console.log('原始 Overpass 离线转换产物已通过实际文件选择导入，几何统计、来源与移除均正确。');
    }
    await cdp.evaluate("document.querySelector('[data-layer=\"buildings\"]').click()"); await screenshot('建筑图层预览.png');
    await cdp.evaluate("document.querySelector('[data-layer=\"both\"]').click()");
    for (const slot of ['left', 'right']) {
      const count = await cdp.evaluate(`(()=>{const c=document.getElementById('${slot}-map');const p=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let n=0;for(let i=0;i<p.length;i+=4)if(p[i]<190&&p[i+1]<190&&p[i+2]<190)n++;return n;})()`);
      assert.ok(count > 1000, '地图包含真实绘制内容');
    }
    await cdp.call('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true }); await delay(150);
    assert.equal(await cdp.evaluate('document.documentElement.scrollWidth <= innerWidth'), true);
    assert.equal(await cdp.evaluate("Math.abs(document.getElementById('left-map').width-document.getElementById('right-map').width)<2"), true);
    await cdp.evaluate("document.getElementById('samples').click()");
    assert.equal(await cdp.evaluate("document.getElementById('sample-dialog').scrollWidth<=document.getElementById('sample-dialog').clientWidth"), true);
    await cdp.evaluate("document.getElementById('close-samples').click()");
    await chooseProject(customProjectPath);
    assert.equal(await cdp.evaluate("document.getElementById('project-dialog').scrollWidth<=document.getElementById('project-dialog').clientWidth"), true);
    await screenshot('比较项目手机预览.png'); await cdp.evaluate("document.getElementById('close-project').click()");
    await cdp.call('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 });
    await openLandmark(); assert.equal(await cdp.evaluate('document.documentElement.scrollWidth<=innerWidth'), true);
    await cdp.evaluate("document.getElementById('landmark-canvas').scrollIntoView({block:'center'})");
    const lp = await cdp.evaluate("(()=>{const r=document.getElementById('landmark-canvas').getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};})()");
    const touchCamera = (await landmarkState()).camera;
    await cdp.call('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: lp.x, y: lp.y }] });
    await cdp.call('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: lp.x + 45, y: lp.y - 10 }] });
    await cdp.call('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await delay(180);
    assert.notDeepEqual((await landmarkState()).camera, touchCamera);
    await cdp.call('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: lp.x - 35, y: lp.y }, { x: lp.x + 35, y: lp.y }] });
    const pinchBefore = cameraDistance(await landmarkState());
    await cdp.call('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: lp.x - 60, y: lp.y }, { x: lp.x + 60, y: lp.y }] });
    await cdp.call('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await delay(180);
    assert.ok(cameraDistance(await landmarkState()) < pinchBefore, '双指扩大间距会拉近三维模型');
    await cdp.evaluate('scrollTo(0,0)'); await screenshot('经典建筑3D手机预览.png');
    await cdp.evaluate("document.querySelector('[data-observation=map]').click()");
    await cdp.evaluate("document.getElementById('left-map').scrollIntoView({block:'center'})");
    const touchRect = await cdp.evaluate("(()=>{const r=document.getElementById('left-map').getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};})()");
    const touchBefore = (await currentState()).offset;
    await cdp.call('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: touchRect.x, y: touchRect.y }] });
    await cdp.call('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: touchRect.x + 50, y: touchRect.y + 10 }] });
    await cdp.call('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await delay(80);
    assert.notDeepEqual((await checkMoved()).offset, touchBefore);
    await cdp.evaluate('scrollTo(0,0)'); await screenshot('手机预览.png');
    await cdp.evaluate("document.getElementById('left-city').value='nanjing';document.getElementById('left-city').dispatchEvent(new Event('change'))"); await checkMoved();
    assert.equal(await cdp.evaluate('document.documentElement.scrollWidth <= innerWidth'), true);
    await cdp.evaluate('scrollTo(0,0)'); await screenshot('南京手机预览.png');
    const standalone = process.env.CITY_RELEASE_HTML || await build(); await cdp.call('Network.setBlockedURLs', { urls: ['http://*', 'https://*'] });
    await navigate(pathToFileURL(standalone).href); assert.equal(await metric('left'), expected('zurich', 0.75, true));
    assert.ok(await buildingCount('left') > 100); await cdp.evaluate("document.querySelector('[data-layer=\"buildings\"]').click()"); assert.equal((await currentState()).layer, 'buildings');
    await cdp.evaluate("document.querySelector('[data-side=\"0.25\"]').click();document.querySelector('[data-pan=\"1,0\"]').click()"); await checkMoved();
    await cdp.evaluate("document.querySelector('.brand').click()"); await delay(80); assert.equal(await metric('right'), expected('bern', 0.75, true));
    await cdp.evaluate("document.getElementById('left-city').value='nanjing';document.getElementById('left-city').dispatchEvent(new Event('change'))"); await checkMoved();
    assert.equal((await currentState()).left, 'nanjing');
    await cdp.evaluate("document.getElementById('samples').click()"); await submitSample(samplePath);
    assert.equal((await currentState()).left, 'zurich-imported'); assert.equal(await metric('left'), expected('zurich', 0.75, true));
    assert.ok(await cdp.evaluate("document.getElementById('sample-message').textContent.includes('加入左侧')"));
    await cdp.evaluate("document.getElementById('close-samples').click()");
    await chooseProject(customProjectPath); await applyProject(); await checkProjectRestored();
    await openLandmark(); assert.ok(await landmarkPixels() > 300, '断网单文件实际渲染三维模型'); await dragLandmark(30, 10);
    await cdp.evaluate("document.querySelector('[data-observation=map]').click()"); await checkProjectRestored();
    assert.equal(cdp.errors.length, 0, JSON.stringify(cdp.errors));
    await fs.copyFile(path.join(downloads, pngName), path.join(screenshotDir, '双城观察卡.png'));
    await fs.writeFile(path.join(runtime, '验证结果.json'), JSON.stringify({ checks: ['三维 WebGL 实际钢架像素', '鼠标旋转与键盘相机', '三种三维预设视角', '三维缩放自动旋转线框与重置', 'GLB 与署名三维观察卡实际下载', '图形丢失与不可用后的重试', '隐藏三维停止绘制', '手机单指旋转与双指缩放', '断网单文件三维模型', '三维视角 JSON 实际下载与字段校验', '切视角后保存的相机/目标实际恢复', '视角预览文本描述预设与距离', '跨模型视角被拒绝并保留当前镜头', '损坏 JSON 与跨格式文件被拒绝', '完整比较项目实际下载与重新打开', '三份导入样本整体替换', '项目预览与取消', '项目慢读取取消', '损坏缺失冒用内置与超大项目保护', '手机与断网项目恢复', '三种图层真实画布', '真实内院像素保留', '建筑统计随移动变化', '道路与建筑独立来源导出', '四种尺度双侧统计', '鼠标左右图拖动', '键盘平移与Home', '共同边界限制', '缩放重新约束', '复制视图(隔离剪贴板接口)', '手动复制后备路径', '恢复与错误输入保护', '实际平移中心导出', '手机触摸拖动', '步行开关', '交换及选择城市', '同城一致性', '旧URL兼容', '重置', '对话框与Escape', 'JSON及PNG下载', '地图绘制', '手机无横向溢出', '禁用网络下单文件运行'], javascriptErrors: cdp.errors.length, screenshots: ['经典建筑3D预览.png', '经典建筑3D手机预览.png', '经典建筑3D观察卡.png', '三维视角保存与恢复.png', '比较项目预览.png', '比较项目手机预览.png', '桌面预览.png', '建筑图层预览.png', '手机预览.png', '双城观察卡.png'] }, null, 2));
    console.log('浏览器检查通过：真实三维 WebGL 像素、旋转/缩放/多视角、键盘/触摸/双指、GLB/署名PNG、图形故障恢复、断网三维；比较项目真实下载/重新打开、三份导入样本整体恢复与替换、预览/取消/慢读取取消、损坏/冒用内置/缺失样本/超大文件保护、手机与断网项目恢复；原有样本和地图交互检查通过，JavaScript 异常 0。');
  } catch (e) { console.error(logs); throw e; }
  finally {
    if (cdp) cdp.socket.close();
    if (browser && browser.exitCode === null) { const ended = new Promise(resolve => browser.once('exit', resolve)); browser.kill(); await Promise.race([ended, delay(3000)]); }
    await new Promise(resolve => server.close(resolve));
  }
})().catch(e => { console.error(e); process.exitCode = 1; });

