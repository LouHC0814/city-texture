// 浏览器回归：预览页与 CLI 对同一样本必须给出一致结论
//
//   node tests/preview-admission.cjs [--verbose]
//
// 断言：
//   1. 基线 eiffel 能加载；模型三角面 = 147,604，场景渲染 = 模型 + 地面（分开计数）
//   2. 反例目录下每个 GLB 逐个经 loadUrl 加载：页面接受 ⟺ CLI status==='pass'
//      （含 Codex 第三次验收新增的 5 个：非默认场景环 / 多父 / 逻辑 buffer 越界 /
//        世界变换溢出 / 材质纹理越界）
//   3. 被拒绝时：上一个模型仍显示（ready=true 且 model 未变），lastLoad.ok=false
//   4. 文件选择路径（DOM.setFileInputFiles）同样在加载前拒绝 15-quantization-required.glb
//   5. 全程无 JS 异常
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { spawn } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const CHROME = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const VERBOSE = process.argv.includes('--verbose');

const { inspect } = require(path.join(ROOT, 'lib', 'inspect.js'));

let pass = 0;
const failures = [];
function ok(name, cond, detail) {
  if (cond) { pass++; if (VERBOSE) console.log('  PASS  ' + name); }
  else { failures.push(name + (detail ? '  ← ' + detail : '')); console.log('  FAIL  ' + name + (detail ? '  ← ' + detail : '')); }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function getJson(url) {
  return new Promise((res, rej) => {
    const q = http.get(url, (r) => { let b = ''; r.on('data', (d) => b += d); r.on('end', () => { try { res(JSON.parse(b)); } catch (e) { rej(e); } }); });
    q.on('error', rej); q.setTimeout(3000, () => q.destroy(new Error('timeout')));
  });
}
async function until(fn, label, timeout) {
  const end = Date.now() + (timeout || 30000);
  while (Date.now() < end) {
    if (await fn()) return true;
    await sleep(80);
  }
  throw new Error('超时：' + label);
}

class CDP {
  constructor(ws) {
    this.ws = ws; this.id = 0; this.pending = new Map(); this.handlers = new Map();
    ws.addEventListener('message', (ev) => {
      const m = JSON.parse(typeof ev.data === 'string' ? ev.data : String(ev.data));
      if (m.id != null) {
        const p = this.pending.get(m.id);
        if (!p) return;
        this.pending.delete(m.id);
        clearTimeout(p.timer);
        if (m.error) p.rej(new Error(m.error.message)); else p.res(m.result);
        return;
      }
      const l = this.handlers.get(m.method);
      if (l) for (const h of l) h(m.params, m.sessionId);
    });
  }
  static async connect(url) {
    const ws = new WebSocket(url);
    await new Promise((res, rej) => { ws.addEventListener('open', res, { once: true }); ws.addEventListener('error', () => rej(new Error('WS 连接失败'))); });
    return new CDP(ws);
  }
  send(method, params, sessionId) {
    const id = ++this.id;
    const payload = { id, method, params: params || {} };
    if (sessionId) payload.sessionId = sessionId;
    return new Promise((res, rej) => {
      const timer = setTimeout(() => { this.pending.delete(id); rej(new Error('CDP 超时: ' + method)); }, 30000);
      this.pending.set(id, { res, rej, timer });
      this.ws.send(JSON.stringify(payload));
    });
  }
  on(method, fn) {
    if (!this.handlers.has(method)) this.handlers.set(method, []);
    this.handlers.get(method).push(fn);
  }
  close() { try { this.ws.close(); } catch (_) {} }
}

function freePort() {
  return new Promise((res) => {
    const s = http.createServer();
    s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); });
  });
}

(async () => {
  const PORT = await freePort();
  const CDP_PORT = await freePort();
  const profile = path.join(ROOT, 'measure', '.tmp-browser-profile');
  fs.rmSync(profile, { recursive: true, force: true });

  console.log('1) 启动预览服务器与无头 Chrome');
  const server = spawn(process.execPath, [path.join(ROOT, 'lib', 'preview-server.cjs'), String(PORT)], { cwd: ROOT, stdio: 'ignore', windowsHide: true });
  const base = 'http://127.0.0.1:' + PORT;
  await until(async () => { try { await getJson(base + '/glb/list.json'); return true; } catch (_) { return false; } }, '服务器', 20000);

  const chrome = spawn(CHROME, [
    '--headless=new', '--no-first-run', '--no-default-browser-check',
    '--disable-extensions', '--mute-audio', '--hide-scrollbars',
    '--remote-debugging-port=' + CDP_PORT,
    '--user-data-dir=' + profile,
    '--window-size=1440,960',
    ...(process.env.CITY_BROWSER_SOFTWARE_GL === '1' ? ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] : []),
    'about:blank'
  ], { stdio: 'ignore', windowsHide: true });

  let ver = null;
  await until(async () => {
    try { ver = await getJson('http://127.0.0.1:' + CDP_PORT + '/json/version'); return true; } catch (_) { return false; }
  }, 'Chrome CDP', 40000);
  ok('Chrome 启动', !!ver, ver && ver.Browser);

  const cdp = await CDP.connect(ver.webSocketDebuggerUrl);
  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId: S } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });

  const exceptions = [];
  cdp.on('Runtime.exceptionThrown', (p) => exceptions.push(JSON.stringify(p.exceptionDetails).slice(0, 300)));

  for (const m of ['Page.enable', 'Runtime.enable', 'DOM.enable', 'Network.enable', 'Log.enable']) {
    await cdp.send(m, {}, S).catch(() => {});
  }
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 960, deviceScaleFactor: 1, mobile: false }, S);

  const ev = async (expr, awaitPromise) => {
    const r = await cdp.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: !!awaitPromise, userGesture: true }, S);
    if (r.exceptionDetails) throw new Error('页面内异常: ' + JSON.stringify(r.exceptionDetails).slice(0, 300));
    return r.result ? r.result.value : undefined;
  };

  console.log('2) 打开基线模型');
  await cdp.send('Page.navigate', { url: base + '/index.html?file=' + encodeURIComponent('/glb/eiffel.glb') }, S);
  await until(async () => (await ev('window.__bootOk === true')) === true, '页面 bootOk', 40000);
  // ready 打开渲染循环后，还需两个实际动画帧才会原子回填 model 的统计与计时。
  // 等待模型元数据存在，再独立断言数值；不能把“渲染已启动”当成“统计已完成”。
  await until(async () => (await ev("Boolean(window.__preview.state.ready && window.__preview.state.model && window.__preview.state.model.name === 'eiffel.glb')")) === true, 'eiffel 首帧与统计就绪', 60000);

  const st0 = JSON.parse(await ev('JSON.stringify(window.__preview.state)'));
  ok('基线 ready', st0.ready === true);
  ok('基线模型三角面 147604', st0.model && st0.model.modelTriangles === 147604, st0.model && st0.model.modelTriangles);
  ok('基线场景三角面 > 模型（含地面）', st0.model && st0.model.sceneTriangles > st0.model.modelTriangles,
    st0.model && (st0.model.sceneTriangles + ' vs ' + st0.model.modelTriangles));
  ok('模型/场景分别计数存在', st0.model && typeof st0.model.groundTriangles === 'number');
  ok('记录了 加载→首个可见帧', st0.model && st0.model.loadToFirstVisibleFrameMs > 0, st0.model && st0.model.loadToFirstVisibleFrameMs);
  ok('准入单独计时 admissionMs', st0.model && st0.model.admissionMs > 0, st0.model && st0.model.admissionMs);
  ok('解析单独计时 parseMs', st0.model && st0.model.parseMs > 0, st0.model && st0.model.parseMs);
  ok('暴露 canvas 尺寸', st0.canvas && st0.canvas.width > 0, JSON.stringify(st0.canvas));
  ok('暴露 drawingBuffer 尺寸', st0.drawingBuffer && st0.drawingBuffer.width > 0, JSON.stringify(st0.drawingBuffer));
  ok('暴露实际 DPR', typeof st0.dpr === 'number', st0.dpr);
  ok('deps 全部 OK', (st0.deps || []).every((d) => d.ok), JSON.stringify((st0.deps || []).filter((d) => !d.ok)));

  const shot = await cdp.send('Page.captureScreenshot', { format: 'png' }, S);
  fs.writeFileSync(path.join(ROOT, 'measure', 'shots', 'preview-eiffel.png'), Buffer.from(shot.data, 'base64'));

  console.log('3) 反例全量：页面结论 必须等于 CLI 结论');
  const fixtureDir = path.join(ROOT, '反例');
  const names = fs.readdirSync(fixtureDir).filter((f) => f.endsWith('.glb')).sort();
  console.log('   ' + names.length + ' 个样本');
  for (const f of names) {
    const name = f.replace(/\.glb$/, '');
    const cli = inspect(fs.readFileSync(path.join(fixtureDir, f)), name);
    const cliAccept = cli.status === 'pass';

    const res = await ev(
      `(async()=>{const ok=await window.__preview.loadUrl('/glb/fixtures/${f}');` +
      `await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));` +
      `const s=window.__preview.state;` +
      `return JSON.stringify({ok, ready:s.ready, model:s.model&&s.model.name, lastLoad:s.lastLoad, status:document.getElementById('status').textContent});})()`,
      true);
    const r = JSON.parse(res);

    ok('一致性 ' + name + ' · 页面接受=' + cliAccept, r.ok === cliAccept,
      `page=${r.ok} cli=${cli.status} | 状态栏=${r.status} | lastLoad=${JSON.stringify(r.lastLoad)}`);

    if (!cliAccept) {
      ok('  ' + name + ' · 保留原模型', r.ready === true && r.model === 'eiffel.glb', `ready=${r.ready} model=${r.model}`);
      ok('  ' + name + ' · lastLoad.ok=false', r.lastLoad && r.lastLoad.ok === false, JSON.stringify(r.lastLoad));
      ok('  ' + name + ' · 状态栏说明拒绝', /拒绝|不支持|错误/.test(r.status), r.status);
    } else if (r.model !== 'eiffel.glb') {
      await ev(`window.__preview.loadUrl('/glb/eiffel.glb')`, true);
      await until(async () => (await ev('window.__preview.state.model && window.__preview.state.model.name')) === 'eiffel.glb', '复位 eiffel', 30000);
    }
  }

  console.log('4) 文件选择路径同样在加载前拒绝');
  {
    const doc = await cdp.send('DOM.getDocument', {}, S);
    const node = await cdp.send('DOM.querySelector', { nodeId: doc.root.nodeId, selector: '#file' }, S);
    const badFile = path.join(fixtureDir, '15-quantization-required.glb');
    await cdp.send('DOM.setFileInputFiles', { files: [badFile], nodeId: node.nodeId }, S);
    await sleep(1200);
    const s = JSON.parse(await ev('JSON.stringify({ready:window.__preview.state.ready,model:window.__preview.state.model&&window.__preview.state.model.name,lastLoad:window.__preview.state.lastLoad,status:document.getElementById("status").textContent})'));
    ok('文件选择 · 被拒绝', s.lastLoad && s.lastLoad.ok === false, JSON.stringify(s.lastLoad));
    ok('文件选择 · 仍显示原模型', s.ready === true && s.model === 'eiffel.glb', `ready=${s.ready} model=${s.model}`);
    ok('文件选择 · 状态栏说明', /拒绝|不支持|错误/.test(s.status), s.status);
  }

  console.log('5) 无 JS 异常');
  ok('Runtime 异常数为 0', exceptions.length === 0, exceptions.join(' | ').slice(0, 400));

  const shot2 = await cdp.send('Page.captureScreenshot', { format: 'png' }, S);
  fs.writeFileSync(path.join(ROOT, 'measure', 'shots', 'preview-after-reject.png'), Buffer.from(shot2.data, 'base64'));

  cdp.close();
  try { chrome.kill(); } catch (_) {}
  try { server.kill(); } catch (_) {}
  await sleep(500);
  fs.rmSync(profile, { recursive: true, force: true });

  console.log('');
  console.log('────────────────────────────────────────');
  if (failures.length === 0) {
    console.log(`浏览器回归全部通过：${pass} 项断言`);
    process.exit(0);
  } else {
    console.log(`失败 ${failures.length} 项 / 通过 ${pass} 项`);
    for (const f of failures) console.log('  ✗ ' + f);
    process.exit(1);
  }
})().catch((e) => {
  console.error('FATAL:', e && e.stack || e);
  process.exit(1);
});
