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
    browser = spawn(executable, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] });
    browser.stderr.on('data', data => { logs = (logs + data).slice(-8000); });
    const port = await until(async () => { try { return Number((await fs.readFile(path.join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]); } catch (_) { return false; } }, '浏览器启动');
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
    const currentState = async () => C.readState(await cdp.evaluate('location.hash'), ['zurich', 'bern']);
    async function checkMoved() {
      const s = await currentState(); assert.equal(await metric('left'), expected(s.left, s.side, s.walking, s.offset)); assert.equal(await metric('right'), expected(s.right, s.side, s.walking, s.offset)); return s;
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
    assert.equal(report.appVersion, '0.2.0'); assert.ok(report.samples[0].center[0] > require('../dist/data/zurich.js').lon);
    assert.deepEqual(report.samples[0].offsetKm, (await currentState()).offset); assert.deepEqual(report.samples[0].offsetKm, report.samples[1].offsetKm);
    await cdp.evaluate("document.getElementById('export').click()");
    const pngName = await until(async () => (await fs.readdir(downloads)).find(n => n.endsWith('.png')), '观察卡 PNG');
    const png = await fs.readFile(path.join(downloads, pngName)); assert.equal(png.subarray(1, 4).toString(), 'PNG'); assert.equal(png.readUInt32BE(16), 1600); assert.equal(png.readUInt32BE(20), 1200);
    const screenshotDir = path.join(repo, 'docs');
    async function screenshot(name) {
      await delay(150);
      const layout = await cdp.call('Page.getLayoutMetrics'); const height = Math.ceil(layout.cssContentSize.height);
      const shot = await cdp.call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: Math.ceil(layout.cssContentSize.width), height, scale: 1 } });
      await fs.writeFile(path.join(screenshotDir, name), Buffer.from(shot.data, 'base64'));
    }
    await cdp.evaluate("document.getElementById('status').textContent=''"); await screenshot('桌面预览.png');
    for (const slot of ['left', 'right']) {
      const count = await cdp.evaluate(`(()=>{const c=document.getElementById('${slot}-map');const p=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let n=0;for(let i=0;i<p.length;i+=4)if(p[i]<190&&p[i+1]<190&&p[i+2]<190)n++;return n;})()`);
      assert.ok(count > 1000, '地图包含真实绘制内容');
    }
    await cdp.call('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true }); await delay(150);
    assert.equal(await cdp.evaluate('document.documentElement.scrollWidth <= innerWidth'), true);
    assert.equal(await cdp.evaluate("Math.abs(document.getElementById('left-map').width-document.getElementById('right-map').width)<2"), true);
    await cdp.call('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 });
    await cdp.evaluate("document.getElementById('left-map').scrollIntoView({block:'center'})");
    const touchRect = await cdp.evaluate("(()=>{const r=document.getElementById('left-map').getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};})()");
    const touchBefore = (await currentState()).offset;
    await cdp.call('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: touchRect.x, y: touchRect.y }] });
    await cdp.call('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: touchRect.x + 50, y: touchRect.y + 10 }] });
    await cdp.call('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await delay(80);
    assert.notDeepEqual((await checkMoved()).offset, touchBefore);
    await cdp.evaluate('scrollTo(0,0)'); await screenshot('手机预览.png');
    const standalone = await build(); await cdp.call('Network.setBlockedURLs', { urls: ['http://*', 'https://*'] });
    await navigate(pathToFileURL(standalone).href); assert.equal(await metric('left'), expected('zurich', 0.75, true));
    await cdp.evaluate("document.querySelector('[data-side=\"0.25\"]').click();document.querySelector('[data-pan=\"1,0\"]').click()"); await checkMoved();
    await cdp.evaluate("document.querySelector('.brand').click()"); await delay(80); assert.equal(await metric('right'), expected('bern', 0.75, true));
    assert.equal(cdp.errors.length, 0, JSON.stringify(cdp.errors));
    await fs.copyFile(path.join(downloads, pngName), path.join(screenshotDir, '双城观察卡.png'));
    await fs.writeFile(path.join(runtime, '验证结果.json'), JSON.stringify({ checks: ['四种尺度双侧统计', '鼠标左右图拖动', '键盘平移与Home', '共同边界限制', '缩放重新约束', '复制视图(隔离剪贴板接口)', '手动复制后备路径', '恢复与错误输入保护', '实际平移中心导出', '手机触摸拖动', '步行开关', '交换及选择城市', '同城一致性', 'v1 URL兼容', '重置', '对话框与Escape', 'JSON及PNG下载', '地图绘制', '手机无横向溢出', '禁用网络下单文件运行'], javascriptErrors: cdp.errors.length, screenshots: ['桌面预览.png', '手机预览.png', '双城观察卡.png'] }, null, 2));
    console.log('浏览器检查通过：鼠标/触摸/键盘平移、边界、视图恢复与复制后备、平移导出、原有比较、手机布局、完全离线单文件；JavaScript 异常 0。');
  } catch (e) { console.error(logs); throw e; }
  finally {
    if (cdp) cdp.socket.close();
    if (browser && browser.exitCode === null) { const ended = new Promise(resolve => browser.once('exit', resolve)); browser.kill(); await Promise.race([ended, delay(3000)]); }
    await new Promise(resolve => server.close(resolve));
  }
})().catch(e => { console.error(e); process.exitCode = 1; });

