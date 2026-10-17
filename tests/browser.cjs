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
    this.socket = new WebSocket(url); this.pending = new Map(); this.events = new Map(); this.nextId = 0; this.errors = [];
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
    });
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
    await cdp.call('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: downloads });
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
    await cdp.evaluate("document.getElementById('landmark-spin').click()"); const beforeSpin = (await landmarkState()).camera; await delay(250);
    assert.equal((await landmarkState()).spinning, true); assert.notDeepEqual((await landmarkState()).camera, beforeSpin);
    await cdp.evaluate("document.getElementById('landmark-spin').click();document.getElementById('landmark-wireframe').click()"); assert.equal((await landmarkState()).wireframe, true);
    await cdp.evaluate("document.getElementById('landmark-reset').click()"); assert.equal((await landmarkState()).wireframe, false); assert.equal((await landmarkState()).spinning, false);
    const landmarkDownloads = path.join(runtime, 'landmark-downloads'); await fs.mkdir(landmarkDownloads);
    await cdp.call('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: landmarkDownloads });
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
      await until(() => cdp.evaluate("!document.getElementById('apply-project').disabled || document.getElementById('project-error').textContent.length>0"), '比较项目校验完成');
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
    await chooseProject(builtinProjectPath); await applyProject(); assert.deepEqual(await checkMoved(), builtinProjectState);
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
    await fs.writeFile(path.join(runtime, '验证结果.json'), JSON.stringify({ checks: ['三维 WebGL 实际钢架像素', '鼠标旋转与键盘相机', '三种三维预设视角', '三维缩放自动旋转线框与重置', 'GLB 与署名三维观察卡实际下载', '图形丢失与不可用后的重试', '隐藏三维停止绘制', '手机单指旋转与双指缩放', '断网单文件三维模型', '完整比较项目实际下载与重新打开', '三份导入样本整体替换', '项目预览与取消', '项目慢读取取消', '损坏缺失冒用内置与超大项目保护', '手机与断网项目恢复', '三种图层真实画布', '真实内院像素保留', '建筑统计随移动变化', '道路与建筑独立来源导出', '四种尺度双侧统计', '鼠标左右图拖动', '键盘平移与Home', '共同边界限制', '缩放重新约束', '复制视图(隔离剪贴板接口)', '手动复制后备路径', '恢复与错误输入保护', '实际平移中心导出', '手机触摸拖动', '步行开关', '交换及选择城市', '同城一致性', '旧URL兼容', '重置', '对话框与Escape', 'JSON及PNG下载', '地图绘制', '手机无横向溢出', '禁用网络下单文件运行'], javascriptErrors: cdp.errors.length, screenshots: ['经典建筑3D预览.png', '经典建筑3D手机预览.png', '经典建筑3D观察卡.png', '比较项目预览.png', '比较项目手机预览.png', '桌面预览.png', '建筑图层预览.png', '手机预览.png', '双城观察卡.png'] }, null, 2));
    console.log('浏览器检查通过：真实三维 WebGL 像素、旋转/缩放/多视角、键盘/触摸/双指、GLB/署名PNG、图形故障恢复、断网三维；比较项目真实下载/重新打开、三份导入样本整体恢复与替换、预览/取消/慢读取取消、损坏/冒用内置/缺失样本/超大文件保护、手机与断网项目恢复；原有样本和地图交互检查通过，JavaScript 异常 0。');
  } catch (e) { console.error(logs); throw e; }
  finally {
    if (cdp) cdp.socket.close();
    if (browser && browser.exitCode === null) { const ended = new Promise(resolve => browser.once('exit', resolve)); browser.kill(); await Promise.race([ended, delay(3000)]); }
    await new Promise(resolve => server.close(resolve));
  }
})().catch(e => { console.error(e); process.exitCode = 1; });

