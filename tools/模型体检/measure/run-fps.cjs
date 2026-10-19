// Round 2 · 真实浏览器 FPS 测量（Chrome DevTools Protocol，无第三方依赖）
//
// 用法：
//   node measure/run-fps.cjs [--port 5173] [--cdp 9333] [--ms 10000] [--warmup 1000] [--rounds 3]
//
// 做的事：
//   1) 确认本地预览服务器在跑（没跑就拉起来）
//   2) 启动真实 Chrome（headful，用真实 GPU），连 CDP
//   3) 桌面档 ×3 轮：10s 采样，导出原始帧间隔
//   4) 手机档 ×3 轮：CDP 设备模拟（390×844 @3x + CPU 4× 节流 + 触摸）
//   5) 全流程记录所有网络请求，审计"是否只访问 127.0.0.1"
//   6) 断网复跑：Fetch 拦截一切非 127.0.0.1 请求并注入 InternetDisconnected，验证页面照常可用
//   7) 落盘 measure/fps-raw.json / fps-summary.json / net-audit.json / shots/*.png
//
// 诚实说明：
//   - "手机档"是 CDP 设备模拟，不是真机；报告里会明确标注。
//   - 渲染器字符串取自 WEBGL_debug_renderer_info，报告里原样写，不美化。
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { spawn } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const MEASURE = path.join(ROOT, 'measure');
const SHOTS = path.join(MEASURE, 'shots');
fs.mkdirSync(SHOTS, { recursive: true });

// ─── 参数 ───
function arg(name, def) {
  const i = process.argv.indexOf('--' + name);
  return i > 0 && process.argv[i + 1] ? process.argv[i + 1] : def;
}
const PREVIEW_PORT = parseInt(arg('port', '5173'), 10);
const CDP_PORT = parseInt(arg('cdp', '9333'), 10);
const ROUND_MS = parseInt(arg('ms', '10000'), 10);
const WARMUP_MS = parseInt(arg('warmup', '1000'), 10);
const ROUNDS_PER_PROFILE = parseInt(arg('rounds', '3'), 10);
const CHROME = arg('chrome', 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe');
const MODEL = arg('model', '/glb/eiffel.glb');
// 本机实测：headful 窗口在该环境下会被 Chrome 判定为遮挡/不可见 →
// rAF 被后台节流到 ~1 帧/秒（dt 中位 3000ms），数据不可用；
// headless=new 下 rAF 正常推进、且仍走真实 GPU（ANGLE/D3D11）。
// 因此默认 headless=new，并明确记录"无 vsync → 测的是渲染吞吐"。
const HEADLESS = arg('headless', '1') !== '0';

const TAG = '[' + new Date().toISOString() + ']';
function log(...a) { console.log(TAG, ...a); }

// ─── 极简 CDP 客户端 ───
class CDP {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.handlers = new Map();
    this.closed = false;
  }
  static async connect(wsUrl) {
    const ws = new WebSocket(wsUrl);
    await new Promise((res, rej) => {
      ws.addEventListener('open', res, { once: true });
      ws.addEventListener('error', (e) => rej(new Error('WS error: ' + (e.message || 'unknown'))), { once: true });
    });
    const c = new CDP(ws);
    ws.addEventListener('message', (ev) => {
      let msg;
      try { msg = JSON.parse(typeof ev.data === 'string' ? ev.data : String(ev.data)); } catch (_) { return; }
      if (msg.id != null) {
        const p = c.pending.get(msg.id);
        if (!p) return;
        c.pending.delete(msg.id);
        if (msg.error) p.rej(new Error(msg.error.message + ' (' + msg.error.code + ')'));
        else p.res(msg.result);
        return;
      }
      const list = c.handlers.get(msg.method);
      if (list) for (const h of list) { try { h(msg.params, msg.sessionId); } catch (e) { log('handler error', msg.method, e.message); } }
    });
    ws.addEventListener('close', () => { c.closed = true; });
    return c;
  }
  send(method, params, sessionId) {
    if (this.closed) return Promise.reject(new Error('CDP closed'));
    const id = ++this.id;
    const payload = { id, method, params: params || {} };
    if (sessionId) payload.sessionId = sessionId;
    return new Promise((res, rej) => {
      this.pending.set(id, { res, rej });
      this.ws.send(JSON.stringify(payload));
      setTimeout(() => {
        if (this.pending.has(id)) { this.pending.delete(id); rej(new Error('CDP timeout: ' + method)); }
      }, 120000);
    });
  }
  on(method, fn) {
    if (!this.handlers.has(method)) this.handlers.set(method, []);
    this.handlers.get(method).push(fn);
  }
}

function getJson(url) {
  return new Promise((res, rej) => {
    const req = http.get(url, (r) => {
      let b = '';
      r.on('data', (d) => (b += d));
      r.on('end', () => { try { res(JSON.parse(b)); } catch (e) { rej(e); } });
    });
    req.on('error', rej);
    req.setTimeout(3000, () => { req.destroy(new Error('timeout ' + url)); });
  });
}

function waitFor(fn, timeoutMs, stepMs) {
  const t0 = Date.now();
  return new Promise((resolve, reject) => {
    (function loop() {
      Promise.resolve().then(fn).then((v) => {
        if (v) return resolve(v);
        if (Date.now() - t0 > timeoutMs) return reject(new Error('waitFor timeout after ' + timeoutMs + 'ms'));
        setTimeout(loop, stepMs || 250);
      }).catch((e) => {
        if (Date.now() - t0 > timeoutMs) return reject(e);
        setTimeout(loop, stepMs || 250);
      });
    })();
  });
}

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

function pct(arr, p) {
  if (!arr.length) return 0;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor(s.length * p))];
}
function avg(arr) { return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0; }
function round2(v) { return Math.round(v * 100) / 100; }

function statsOf(dts) {
  var med = pct(dts, 0.5), p01 = pct(dts, 0.01), p05 = pct(dts, 0.05), p95 = pct(dts, 0.95), p99 = pct(dts, 0.99);
  var dtMax = dts.length ? Math.max.apply(null, dts) : 0;
  var dtMin = dts.length ? Math.min.apply(null, dts) : 0;
  var dtMean = avg(dts);
  return {
    frames: dts.length,
    dtMs: {
      median: round2(med), p05: round2(p05), p95: round2(p95), p99: round2(p99),
      min: round2(dtMin), max: round2(dtMax), mean: round2(dtMean)
    },
    // 逐帧瞬时帧率 fps_i = 1000/dt_i 的分位数（不是"1000 除以帧时间分位数"的倒推）
    // 因为 1000/x 单调递减：分位数按升序取，fps 的 P95 对应 dt 的 P5
    fps: {
      median: round2(1000 / (med || 1)),
      p05: round2(1000 / (p95 || 1)),
      p95: round2(1000 / (p05 || 1)),
      p99: round2(1000 / (p01 || 1)),
      min: round2(1000 / (dtMax || 1)),
      max: round2(1000 / (dtMin || 1)),
      mean: round2(1000 / (dtMean || 1)),
      definition: '逐帧瞬时帧率 1000/dt_i 的分位数（p05 = 最慢的 5% 帧的上界）',
      quantizationCaveat: 'performance.now() 精度约 0.1ms；帧时间中位 0.7ms 时瞬时帧率的相对误差可达 ±14%，' +
        '因此 fps 的尾部（p95/p99）只能当噪声量级参考，主指标请用 dtMs 的分位数'
    },
    jank: {
      over16_7: dts.filter(function (d) { return d > 16.7; }).length,
      over33: dts.filter(function (d) { return d > 33; }).length,
      over50: dts.filter(function (d) { return d > 50; }).length
    }
  };
}

// ─── 主流程 ───
(async () => {
  const t0 = Date.now();
  const result = {
    kind: 'round2-fps-measurement',
    generatedAt: new Date().toISOString(),
    env: {
      node: process.version,
      platform: process.platform + ' ' + process.arch,
      chromePath: CHROME,
      previewUrl: 'http://127.0.0.1:' + PREVIEW_PORT,
      model: MODEL,
      roundMs: ROUND_MS,
      warmupMs: WARMUP_MS,
      roundsPerProfile: ROUNDS_PER_PROFILE,
      disclaimer: '桌面档与手机档均在 Chrome headless=new 下运行（走真实 GPU：' +
        'ANGLE/D3D11）。手机档为 CDP 设备模拟（DeviceMetrics 390×844@3x + CPU 4× 节流 + 触摸），并非真机。' +
        '两档均关闭 vsync 与帧率上限（--disable-frame-rate-limit / --disable-gpu-vsync），' +
        '因此 FPS 是渲染吞吐，不是屏幕刷新率下的实际帧率；对用户体验的判断以"帧时间"为准。'
    },
    rounds: [],
    offline: null,
    netAudit: null,
    errors: []
  };

  // ① 预览服务器
  let serverProc = null;
  try {
    await getJson('http://127.0.0.1:' + PREVIEW_PORT + '/glb/list.json');
    log('预览服务器已在运行');
  } catch (_) {
    log('预览服务器未运行，拉起中…');
    serverProc = spawn(process.execPath, [path.join(ROOT, 'lib', 'preview-server.cjs'), String(PREVIEW_PORT)], {
      cwd: ROOT, stdio: 'ignore', windowsHide: true, detached: false
    });
    await waitFor(async () => {
      try { await getJson('http://127.0.0.1:' + PREVIEW_PORT + '/glb/list.json'); return true; } catch (_) { return false; }
    }, 15000, 300);
    log('预览服务器已就绪 pid=' + (serverProc && serverProc.pid));
  }

  // ② 启动 Chrome
  const userDataDir = path.join(MEASURE, '.chrome-profile');
  try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch (_) {}
  fs.mkdirSync(userDataDir, { recursive: true });

  const chromeArgs = [
    '--remote-debugging-port=' + CDP_PORT,
    '--user-data-dir=' + userDataDir,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--disable-background-timer-throttling',
    '--disable-renderer-backgrounding',
    '--disable-backgrounding-occluded-windows',
    '--disable-features=CalculateNativeWinOcclusion',
    '--window-size=1440,900',
    '--window-position=40,40'
  ].concat(HEADLESS ? [
    '--headless=new', '--hide-scrollbars', '--mute-audio',
    // 去掉 headless 默认的 ~200fps BeginFrame 节拍，否则帧时间恒为 5ms、
    // 既分不出桌面/手机差异，也看不出真实渲染成本。
    '--disable-frame-rate-limit', '--disable-gpu-vsync'
  ] : [], ['about:blank']);
  log('启动 Chrome…');
  const chrome = spawn(CHROME, chromeArgs, { stdio: 'ignore', windowsHide: false, detached: false });
  result.env.chromePid = chrome.pid;
  chrome.on('error', (e) => result.errors.push('chrome spawn: ' + e.message));

  const ver = await waitFor(async () => {
    try { return await getJson('http://127.0.0.1:' + CDP_PORT + '/json/version'); } catch (_) { return null; }
  }, 30000, 400);
  result.env.browser = ver.Browser;
  result.env.protocolVersion = ver['Protocol-Version'];
  result.env.userAgent = ver['User-Agent'];
  log('已连接 CDP：' + ver.Browser);

  const cdp = await CDP.connect(ver.webSocketDebuggerUrl);

  // ③ 建页面
  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
  const S = sessionId;

  await cdp.send('Page.enable', {}, S);
  await cdp.send('Runtime.enable', {}, S);
  await cdp.send('Network.enable', {}, S);
  await cdp.send('Log.enable', {}, S).catch(() => {});
  // 尽量保持页面"前台活跃"，避免任何形式的 rAF 节流
  await cdp.send('Page.bringToFront', {}, S).catch(() => {});
  await cdp.send('Emulation.setFocusEmulationEnabled', { enabled: true }, S).catch(() => {});
  await cdp.send('Page.setWebLifecycleState', { state: 'active' }, S).catch(() => {});

  // 网络请求审计
  const requests = [];
  const consoleErrors = [];
  cdp.on('Network.requestWillBeSent', (p) => {
    if (p && p.request) requests.push({ url: p.request.url, type: p.type, method: p.request.method });
  });
  cdp.on('Runtime.consoleAPICalled', (p) => {
    if (p && p.type === 'error') consoleErrors.push((p.args || []).map((a) => a.value || a.description || a.type).join(' '));
  });
  cdp.on('Runtime.exceptionThrown', (p) => {
    consoleErrors.push('EXCEPTION: ' + (p && p.exceptionDetails && (p.exceptionDetails.text + ' ' + (p.exceptionDetails.exception && p.exceptionDetails.exception.description || ''))));
  });
  cdp.on('Log.entryAdded', (p) => {
    if (p && p.entry && p.entry.level === 'error') consoleErrors.push('LOG: ' + p.entry.text + ' ' + (p.entry.url || ''));
  });

  const evalJS = async (expr, awaitPromise) => {
    const r = await cdp.send('Runtime.evaluate', {
      expression: expr, returnByValue: true, awaitPromise: !!awaitPromise, userGesture: true
    }, S);
    if (r.exceptionDetails) throw new Error('eval failed: ' + JSON.stringify(r.exceptionDetails).slice(0, 400));
    return r.result ? r.result.value : undefined;
  };

  const waitReady = async (label) => {
    await waitFor(async () => {
      const st = await evalJS('window.__preview ? window.__preview.state.ready : false');
      return st === true;
    }, 60000, 300);
    log('  ' + label + '：模型就绪');
  };

  // ④ 首屏加载
  // 先把视口固定成桌面基准，保证首屏与第 1 轮同尺寸
  await cdp.send('Emulation.setDeviceMetricsOverride',
    { width: 1440, height: 960, deviceScaleFactor: 1, mobile: false }, S);
  const firstUrl = 'http://127.0.0.1:' + PREVIEW_PORT + '/index.html?file=' + encodeURIComponent(MODEL);
  log('导航到 ' + firstUrl);
  await cdp.send('Page.navigate', { url: firstUrl }, S);
  await waitReady('首屏');

  const bootState = await evalJS('JSON.stringify(window.__preview.state)');
  const state0 = JSON.parse(bootState);
  result.env.webgl = state0.webgl;
  result.env.webglRenderer = state0.gpu || state0.renderer;
  result.env.webglVendor = state0.gpuVendor || state0.vendor;
  result.env.webglRendererMasked = state0.renderer;
  result.env.deps = state0.deps;
  result.env.bootErrors = state0.bootErrors;
  result.env.initialStats = state0.stats;
  // 「开始加载 → 首个实际可见模型帧」：边界定义在页面里（连等两个 rAF 后取时间）
  result.env.firstLoad = state0.model || null;
  log('WebGL: ' + state0.webgl);
  log('GPU  : ' + (result.env.webglRenderer || '(未知)'));

  // 记录可见性/节流基线，便于解释异常轮次
  result.env.pipeline = {
    mode: HEADLESS ? 'headless=new' : 'headful',
    visibility: await evalJS('document.visibilityState'),
    hidden: await evalJS('document.hidden'),
    hasFocus: await evalJS('document.hasFocus()'),
    vsync: '已关闭 vsync 与帧率上限（--disable-frame-rate-limit / --disable-gpu-vsync）→ FPS 为渲染吞吐上限，不是屏幕刷新率下的实际帧率；报告只给帧时间分布，不换算成"能否满某刷新率"的结论',
    note: HEADLESS
      ? 'headful 在本机会被判定遮挡 → rAF 节流到约 1 帧/秒，无法用于测量；故采用 headless=new（仍走真实 GPU）'
      : 'headful 模式：若 visibility=hidden 则数据不可信，需在 --headless=1 下重跑',
    precision: 'performance.now() 在 Chrome 中被粗化到 0.1ms 量级；帧时间量级为 0.7ms 时，相对分辨率约 14%，绝对值偏粗但数量级可信',
    // 结论边界：写清楚这套数据能证明什么、不能证明什么
    claims: {
      proves: [
        '在本机 Chrome ' + (ver.Browser || '') + '（headless=new，关闭 vsync 与帧率上限）下，该模型在该视口下的 rAF 间隔与渲染吞吐',
        '两种视口配置（桌面 1440×960 / 手机模拟 390×844）在同一模型上的相对差异',
        '页面在阻断一切非本机请求后仍能加载并渲染'
      ],
      doesNotProve: [
        '真实手机的帧率（手机档是 CDP 设备模拟 + CPU 节流，不是真机）',
        'GPU 单帧耗时（关闭 vsync 后测到的是调度间隔，不等于 GPU 执行时间）',
        '主项目在真实 60Hz 屏幕上"够用"——真实屏幕会被 vsync 夹到 ≤60fps',
        '把帧时间除以 16.67ms 得到的"60Hz 余量"——rAF 间隔不是 GPU 执行时间，这个比值不能当预算结论',
        '其他浏览器 / 其他 GPU 驱动的表现'
      ],
      label: '本报告所有 fps 字段应读作"该浏览器配置下的 rAF 吞吐"，不是屏幕帧率'
    }
  };

  const depsBad = (state0.deps || []).filter((d) => !d.ok);
  if (depsBad.length) result.errors.push('vendor 缺失 ' + depsBad.length + ' 个：' + depsBad.map((d) => d.url).join(','));

  // ⑤ 6 轮采样
  const profiles = [
    { name: 'desktop', label: '桌面：窗口 1440×960 @dsf1（画布尺寸见"实际画布"）', mobile: false,
      metrics: { width: 1440, height: 960, deviceScaleFactor: 1, mobile: false } },
    { name: 'mobile', label: '手机模拟：窗口 390×844 @dsf3（渲染 DPR 由页面限制 1.5），CPU 4× 节流，触摸', mobile: true,
      metrics: { width: 390, height: 844, deviceScaleFactor: 3, mobile: true,
                 screenOrientation: { type: 'portraitPrimary', angle: 0 } } }
  ];

  let roundNo = 0;
  for (const prof of profiles) {
    for (let i = 1; i <= ROUNDS_PER_PROFILE; i++) {
      roundNo++;
      const id = prof.name + '-' + i;
      log('第 ' + roundNo + ' 轮：' + id + '（' + prof.label + '）');

      if (prof.mobile) {
        await cdp.send('Emulation.setDeviceMetricsOverride', prof.metrics, S);
        await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 }, S);
        await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 }, S);
      } else {
        await cdp.send('Emulation.setDeviceMetricsOverride', prof.metrics, S);
        await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: false }, S);
        await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 }, S);
      }
      await sleep(700);
      // Emulation 改变 devicePixelRatio 不一定触发 resize，显式打一发，
      // 让页面重新应用 setPixelRatio（否则手机档会沿用桌面 DPR=1）
      await evalJS('window.dispatchEvent(new Event("resize")); true');
      await sleep(300);

      // 每轮重置视角，保证可比
      await evalJS('window.__preview.preset("iso"); true');
      await sleep(400);

      const m = await evalJS(
        'window.__preview.measure(' + ROUND_MS + ',' + WARMUP_MS + ')',
        true
      );

      if (!m || m.error) {
        result.errors.push(id + ': ' + (m && m.error ? m.error : 'measure 返回空'));
        log('  失败：' + (m && m.error));
        continue;
      }

      const st = statsOf(m.dts);
      const suspicious = st.fps.median < 20 || st.dtMs.median > 50;   // 疑似被后台节流
      if (suspicious) result.errors.push(id + ': 帧间隔异常（median ' + st.dtMs.median + 'ms），疑似 rAF 被节流');
      const shot = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false }, S);
      const shotFile = path.join(SHOTS, id + '.png');
      fs.writeFileSync(shotFile, Buffer.from(shot.data, 'base64'));

      // 每轮记录一次 CPU 微基准，证明节流档位确实生效
      const bench = await evalJS('window.__preview.cpuBench(2000000)');

      result.rounds.push({
        id, profile: prof.name, profileLabel: prof.label,
        mobileEmulation: prof.mobile,
        measuredMs: ROUND_MS, warmupMs: WARMUP_MS,
        totalMs: m.totalMs, samples: m.samples, framesAll: m.frames,
        frames: st.frames,
        cpuBenchMs: bench && bench.ms,
        renderer: m.renderer,
        canvas: m.renderer,          // 实际 dpr / canvas 像素 / drawingBuffer，别拿 emulation 参数冒充
        cameraRoute: m.cameraRoute,
        dtMs: st.dtMs, fps: st.fps, jank: st.jank,
        suspicious,
        rawDts: m.dts,
        screenshot: path.relative(ROOT, shotFile)
      });
      log('  完成：FPS 中位 ' + st.fps.median + '，帧时间中位 ' + st.dtMs.median + 'ms（p95 ' + st.dtMs.p95 + 'ms）' +
          '，帧数 ' + st.frames + '，>33ms 帧 ' + st.jank.over33);
    }
  }

  // ⑥b 敏感性验证：每帧重复渲染 N 次。
  //   目的：证明"帧时间随负载上升"——即这套测量管线是灵敏的，
  //   不是被某个固定节拍（headless BeginFrame）夹住的常数。
  log('敏感性验证：每帧渲染 ×1 / ×2 / ×4 / ×8 / ×16');
  const sensitivity = [];
  await cdp.send('Emulation.setDeviceMetricsOverride',
    { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false }, S);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 }, S);
  await sleep(600);
  for (const n of [1, 2, 4, 8, 16]) {
    await evalJS('window.__preview.setStress(' + n + ')');
    await sleep(500);
    const m = await evalJS('window.__preview.measure(3000, 800)', true);
    if (m && !m.error) {
      const st = statsOf(m.dts);
      sensitivity.push({
        renderRepeat: n, fps: st.fps, dtMs: st.dtMs, frames: st.frames
      });
      log('  渲染 ×' + String(n).padStart(2) + '：帧时 ' + String(st.dtMs.median).padStart(6) + 'ms → ' + st.fps.median + ' fps');
    } else {
      result.errors.push('敏感性 ×' + n + ' 失败');
    }
  }
  await evalJS('window.__preview.setStress(1)');
  result.sensitivity = sensitivity;
  // 判定用**均值与 p95**，不用中位数：
  //   负载放大后帧时间分布会变成"多数帧仍快 + 少数帧很慢"的双峰，
  //   中位数对这种变化几乎不敏感（×16 时中位只从 0.8 涨到 1.0，但均值 0.77→2.25、p95 1.1→5.4）。
  var meanByRepeat = sensitivity.map(function (s) { return s.dtMs.mean; });
  var p95ByRepeat = sensitivity.map(function (s) { return s.dtMs.p95; });
  var framesByRepeat = sensitivity.map(function (s) { return s.frames; });
  result.sensitivityVerdict = {
    firstMeanMs: meanByRepeat[0],
    lastMeanMs: meanByRepeat[meanByRepeat.length - 1],
    scaleFactorMean: meanByRepeat[0] > 0 ? round2(meanByRepeat[meanByRepeat.length - 1] / meanByRepeat[0]) : null,
    firstP95Ms: p95ByRepeat[0],
    lastP95Ms: p95ByRepeat[p95ByRepeat.length - 1],
    scaleFactorP95: p95ByRepeat[0] > 0 ? round2(p95ByRepeat[p95ByRepeat.length - 1] / p95ByRepeat[0]) : null,
    framesPerRepeat: framesByRepeat,
    quantizationNote: 'performance.now() 精度约 0.1ms，单帧中位数会被量化吃掉；均值与 p95 在数千帧上稳定，故用它们判定',
    interpretation: null
  };
  var sv = result.sensitivityVerdict;
  sv.interpretation = sv.scaleFactorMean && sv.scaleFactorMean > 1.3
    ? '每帧渲染次数 ×1→×16 时，平均帧时间 ' + sv.firstMeanMs + '→' + sv.lastMeanMs + 'ms（×' + sv.scaleFactorMean +
      '），p95 帧时间 ' + sv.firstP95Ms + '→' + sv.lastP95Ms + 'ms（×' + sv.scaleFactorP95 +
      '）→ 测量管线对负载敏感，×1 时的数值不是被固定节拍夹住的常数'
    : '平均帧时间未随渲染次数明显上升 → 当前帧时间被外部节拍或计时分辨率限制，不能当作真实渲染耗时';

  // 压力档（4K）已移出最终报告。理由（据 Codex 第二次验收 §5）：
  //   - 本实验只回答"该浏览器配置下 rAF 间隔/渲染吞吐"，不能被用来推断
  //     真实手机 60fps、GPU 耗时，或主项目性能预算是否足够；
  //   - 继续堆分辨率压力档只会放大过度解读的空间，不增加可信信息。

  // 复位模拟
  await cdp.send('Emulation.clearDeviceMetricsOverride', {}, S).catch(() => {});
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 }, S).catch(() => {});
  result.stress = [];

  // ⑥ 网络审计
  const external = requests.filter((r) => {
    try {
      const u = new URL(r.url);
      return !(u.hostname === '127.0.0.1' || u.hostname === 'localhost' || u.protocol === 'data:' || u.protocol === 'blob:');
    } catch (_) { return false; }
  });
  result.netAudit = {
    totalRequests: requests.length,
    externalRequests: external.length,
    externalList: external.slice(0, 50),
    uniqueHosts: Array.from(new Set(requests.map((r) => { try { return new URL(r.url).host; } catch (_) { return '?'; } }))),
    consoleErrors
  };

  // ⑦ 断网复跑：拦截一切非 127.0.0.1 的请求，注入 InternetDisconnected
  log('断网复跑：拦截所有非本机请求…');
  const blocked = [];
  const allowed = [];
  await cdp.send('Fetch.enable', { patterns: [{ urlPattern: '*', requestStage: 'Request' }] }, S);
  cdp.on('Fetch.requestPaused', async (p, sid) => {
    const s = sid || S;
    let host = '';
    try { host = new URL(p.request.url).hostname; } catch (_) {}
    const isLocal = host === '127.0.0.1' || host === 'localhost' || p.request.url.startsWith('data:') || p.request.url.startsWith('blob:');
    try {
      if (isLocal) {
        allowed.push(p.request.url);
        await cdp.send('Fetch.continueRequest', { requestId: p.requestId }, s);
      } else {
        blocked.push({ url: p.request.url, type: p.resourceType });
        await cdp.send('Fetch.failRequest', { requestId: p.requestId, errorReason: 'InternetDisconnected' }, s);
      }
    } catch (_) {}
  });

  await sleep(300);
  const reloadRequestsStart = requests.length;
  await cdp.send('Page.navigate', { url: firstUrl }, S);
  let offlineOk = false;
  let offlineState = null;
  try {
    await waitReady('断网复跑');
    offlineState = JSON.parse(await evalJS('JSON.stringify(window.__preview.state)'));
    offlineOk = offlineState.ready === true;
  } catch (e) {
    result.errors.push('断网复跑失败：' + e.message);
  }

  // 断网下再跑一轮短采样（3s）证明可渲染
  let offlineMeasure = null;
  if (offlineOk) {
    await evalJS('window.__preview.preset("iso"); true');
    await sleep(300);
    const m = await evalJS('window.__preview.measure(3000, 500)', true);
    if (m && !m.error) {
      const st = statsOf(m.dts);
      offlineMeasure = { fps: st.fps, dtMs: st.dtMs, samples: st.frames, renderer: m.renderer };
    }
    const shot = await cdp.send('Page.captureScreenshot', { format: 'png' }, S);
    fs.writeFileSync(path.join(SHOTS, 'offline-reload.png'), Buffer.from(shot.data, 'base64'));
  }

  await cdp.send('Fetch.disable', {}, S).catch(() => {});

  result.offline = {
    method: 'CDP Fetch 拦截：非 127.0.0.1/localhost 的请求一律 failRequest(InternetDisconnected)',
    pageReloaded: true,
    readyAfterBlock: offlineOk,
    externalAttempts: blocked.length,
    externalAttemptsList: blocked.slice(0, 30),
    localRequestsAllowed: allowed.length,
    requestsDuringReload: requests.length - reloadRequestsStart,
    stillRenders: !!offlineMeasure,
    fpsAfterBlock: offlineMeasure ? offlineMeasure.fps : null,
    screenshot: offlineMeasure ? 'measure/shots/offline-reload.png' : null
  };

  // ⑧ 收尾
  try { await cdp.send('Target.closeTarget', { targetId }); } catch (_) {}
  // 先让 Chrome 自己退出（Browser.close），再等进程真的结束，最后才删 profile。
  // 只 kill + 立刻 rm 会撞上 Windows 的文件句柄：删不掉，几十 MB 缓存就留在交付树里。
  try { await cdp.send('Browser.close'); } catch (_) {}
  if (chrome && chrome.exitCode === null) {
    await Promise.race([
      new Promise((r) => chrome.once('exit', r)),
      sleep(8000)
    ]);
  }
  try { chrome.kill(); } catch (_) {}
  if (serverProc) { try { serverProc.kill(); } catch (_) {} }

  // 清掉本次的浏览器配置目录：里面是缓存，动辄几十 MB，不该留在交付树里。
  await sleep(1200);
  let profileRemoved = false;
  for (let attempt = 0; attempt < 12 && !profileRemoved; attempt++) {
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
      profileRemoved = !fs.existsSync(userDataDir);
    } catch (_) {
      await sleep(600);
    }
  }
  result.profileCleanup = { path: path.relative(ROOT, userDataDir), removed: profileRemoved };

  // 汇总
  const byProfile = {};
  for (const prof of profiles) {
    const rs = result.rounds.filter((r) => r.profile === prof.name);
    if (!rs.length) continue;
    byProfile[prof.name] = {
      label: prof.label,
      rounds: rs.length,
      fpsMedian: rs.map((r) => r.fps.median),
      dtP05: rs.map((r) => r.dtMs.p05),
      dtP95: rs.map((r) => r.dtMs.p95),
      fpsWorst: rs.map((r) => r.fps.min),
      avgMedian: round2(avg(rs.map((r) => r.fps.median))),
      minMedian: round2(Math.min(...rs.map((r) => r.fps.median))),
      minWorst: round2(Math.min(...rs.map((r) => r.fps.min))),
      avgDtMedian: round2(avg(rs.map((r) => r.dtMs.median))),
      avgDtP95: round2(avg(rs.map((r) => r.dtMs.p95))),
      suspiciousRounds: rs.filter((r) => r.suspicious).length,
      totalFrames: rs.reduce((a, r) => a + (r.frames || 0), 0),
      jankOver33: rs.reduce((a, r) => a + r.jank.over33, 0),
      cpuBenchMs: rs.map((r) => r.cpuBenchMs),
      canvas: rs[0].canvas || null,
      cameraRoute: rs[0].cameraRoute || null
    };
  }
  result.summary = {
    byProfile,
    totalRounds: result.rounds.length,
    wallClockMs: Date.now() - t0,
    pass: {
      sixRounds: result.rounds.length === ROUNDS_PER_PROFILE * 2,
      noSuspiciousRounds: result.rounds.every((r) => r.suspicious !== true),
      noExternalRequests: result.netAudit.externalRequests === 0,
      offlineStillWorks: result.offline.readyAfterBlock === true,
      vendorComplete: depsBad.length === 0
    }
  };

  // 落盘
  const rawPath = path.join(MEASURE, 'fps-raw.json');
  const sumPath = path.join(MEASURE, 'fps-summary.json');
  const auditPath = path.join(MEASURE, 'net-audit.json');
  fs.writeFileSync(rawPath, JSON.stringify(result, null, 2));
  fs.writeFileSync(sumPath, JSON.stringify({
    kind: 'round2-fps-summary',
    generatedAt: result.generatedAt,
    env: result.env,
    summary: result.summary,
    offline: result.offline,
    netAudit: { totalRequests: result.netAudit.totalRequests, externalRequests: result.netAudit.externalRequests, uniqueHosts: result.netAudit.uniqueHosts },
    rounds: result.rounds.map((r) => ({
      id: r.id, profile: r.profile, fps: r.fps, dtMs: r.dtMs, jank: r.jank,
      frames: r.frames, cpuBenchMs: r.cpuBenchMs, renderer: r.renderer
    })),
    stress: result.stress,
    sensitivity: result.sensitivity,
    sensitivityVerdict: result.sensitivityVerdict,
    errors: result.errors
  }, null, 2));
  fs.writeFileSync(auditPath, JSON.stringify({
    generatedAt: result.generatedAt,
    totalRequests: result.netAudit.totalRequests,
    externalRequests: result.netAudit.externalRequests,
    uniqueHosts: result.netAudit.uniqueHosts,
    externalList: result.netAudit.externalList,
    consoleErrors: result.netAudit.consoleErrors,
    offline: result.offline
  }, null, 2));

  // 打印摘要
  console.log('\n================ Round 2 结果 ================');
  console.log('浏览器：' + result.env.browser);
  console.log('WebGL ：' + result.env.webgl);
  console.log('GPU   ：' + result.env.webglRenderer);
  console.log('');
  for (const k of Object.keys(byProfile)) {
    const b = byProfile[k];
    console.log('[' + k + '] ' + b.label);
    console.log('  每轮 FPS 中位：' + b.fpsMedian.join(' / ') + '  → 均值 ' + b.avgMedian);
    console.log('  帧时间 p05/p95：' + b.dtP05.map((v, i) => v + '/' + b.dtP95[i]).join('  ') + ' ms（主指标）');
    console.log('  帧时间中位   ：' + b.avgDtMedian + ' ms（p95 ' + b.avgDtP95 + ' ms）');
    if (b.canvas) {
      console.log('  实际画布     ：CSS ' + b.canvas.cssWidth + '×' + b.canvas.cssHeight +
        ' · canvas ' + b.canvas.canvasWidth + '×' + b.canvas.canvasHeight +
        ' · drawingBuffer ' + b.canvas.drawingBufferWidth + '×' + b.canvas.drawingBufferHeight +
        ' · DPR ' + b.canvas.dpr);
    }
    console.log('  最差帧 FPS   ：' + b.fpsWorst.join(' / '));
    console.log('  总帧数 ' + b.totalFrames + '，>33ms 卡顿帧 ' + b.jankOver33 + '，异常轮次 ' + b.suspiciousRounds);
    console.log('');
  }
  console.log('网络审计：总请求 ' + result.netAudit.totalRequests + '，外网请求 ' + result.netAudit.externalRequests);
  if (sensitivity.length) {
    console.log('');
    console.log('[敏感性验证 · 1440×900]');
    for (const s of sensitivity) {
      console.log('  渲染 ×' + String(s.renderRepeat).padStart(2) + '：帧时 ' + s.dtMs.median + 'ms → ' + s.fps.median + ' fps');
    }
    console.log('  判定：' + result.sensitivityVerdict.interpretation);
  }
  console.log('');
  console.log('口径：以上 fps 是"该浏览器配置下的 rAF 吞吐"，不是屏幕帧率，也不是 GPU 单帧耗时。');
  console.log('断网复跑：' + (result.offline.readyAfterBlock ? '成功' : '失败') +
              '，外部请求尝试 ' + result.offline.externalAttempts + ' 次，阻断后仍渲染 ' + result.offline.stillRenders);
  console.log('vendor 依赖：' + (depsBad.length === 0 ? '完整' : ('缺失 ' + depsBad.length)));
  console.log('==============================================');
  console.log('原始数据：' + rawPath);
  console.log('汇总：    ' + sumPath);
  console.log('审计：    ' + auditPath);
  if (result.errors.length) {
    console.log('\n错误：');
    result.errors.forEach((e) => console.log('  - ' + e));
  }
  process.exit(0);
})().catch((e) => {
  console.error('FATAL:', e && e.stack || e);
  process.exit(1);
});
