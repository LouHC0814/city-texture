// 本地 HTTP 服务器：仅监听 127.0.0.1，给离线预览页用
// 用法：
//   node lib/preview-server.cjs [port]              前台运行
//   node lib/preview-server.cjs [port] --daemon     后台运行，写 pid 到 .pid
//
// 暴露路径（白名单，其余一律 404/403）：
//   /                          → 预览/index.html
//   /index.html                → 预览/index.html
//   /vendor/...                → 预览/vendor/...（限 .js/.css/.json/.png/.svg，且必须落在 vendor 内）
//   /glb/eiffel.glb            → 基线/eiffel.glb
//   /glb/fixtures/<name>.glb   → 反例/<name>.glb
//   /glb/list.json             → 基线 + 反例文件清单
//
// 安全约束（Codex 返修单 P1-4 / P2-4）：
//   - URL decode 后再校验，拒绝 %2e%2e 等编码绕过
//   - resolve 后再确认最终路径落在允许的根目录内（防符号链接/软链跳出）
//   - 只允许 GET / HEAD
//   - 不代理、不转发、不解析外网 URL
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');

const args = process.argv.slice(2);
const daemon = args.includes('--daemon');
const port = parseInt(args.find(a => /^\d+$/.test(a)) || '5173', 10);
const ROOT = path.resolve(__dirname, '..');
const PREVIEW = path.join(ROOT, '预览');
const BASE = path.join(ROOT, '基线');
const FIXTURES = path.join(ROOT, '反例');
const PID_FILE = path.join(__dirname, '..', '.tmp-preview-server.pid');
const LOG_FILE = path.join(__dirname, '..', '.tmp-preview-server.log');
const ACCESS_LOG = path.join(__dirname, '..', 'measure', 'access.log.jsonl');

if (daemon) {
  const out = fs.openSync(LOG_FILE, 'a');
  const err = fs.openSync(LOG_FILE, 'a');
  const child = spawn(process.execPath, [__filename, String(port)], {
    detached: true,
    stdio: ['ignore', out, err],
    windowsHide: true
  });
  child.unref();
  fs.writeFileSync(PID_FILE, String(child.pid));
  console.log('预览服务器已后台启动，pid=' + child.pid + '，日志：' + LOG_FILE);
  process.exit(0);
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};
const VENDOR_EXT = new Set(['.js', '.mjs', '.css', '.json', '.png', '.svg']);

function accessLine(rec) {
  try {
    fs.appendFileSync(ACCESS_LOG, JSON.stringify(rec) + '\n');
  } catch (_) { /* 目录不存在时忽略 */ }
}

function isInside(parent, child) {
  const rel = path.relative(parent, child);
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}

function sendText(res, code, text, extra) {
  const body = Buffer.from(String(text), 'utf8');
  res.writeHead(code, Object.assign({
    'Content-Type': 'text/plain; charset=utf-8',
    'Content-Length': body.length,
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  }, extra || {}));
  res.end(body);
}

function serve(res, fp) {
  fs.readFile(fp, (err, data) => {
    if (err) { sendText(res, 404, 'not found'); return; }
    const ext = path.extname(fp).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Content-Length': data.length,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff'
    });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const started = Date.now();

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    accessLine({ t: new Date().toISOString(), method: req.method, url: req.url, status: 405 });
    return sendText(res, 405, 'method not allowed', { Allow: 'GET, HEAD' });
  }

  const rawUrl = req.url || '/';
  let pathname;
  try {
    pathname = decodeURIComponent(rawUrl.split('?')[0].split('#')[0]);
  } catch (_) {
    accessLine({ t: new Date().toISOString(), method: req.method, url: rawUrl, status: 400, reason: 'bad-encoding' });
    return sendText(res, 400, 'bad encoding');
  }

  const done = (code, note) => accessLine({
    t: new Date().toISOString(), method: req.method, url: rawUrl, pathname, status: code, note: note || null, ms: Date.now() - started
  });

  // 统一拒绝穿越/反斜杠/NUL
  if (pathname.includes('..') || pathname.includes('\\') || pathname.includes('\0')) {
    done(400, 'traversal');
    return sendText(res, 400, 'bad path');
  }

  // 首页
  if (pathname === '/' || pathname === '/index.html') {
    done(200, 'index');
    return serve(res, path.join(PREVIEW, 'index.html'));
  }

  // 共享准入模块：与 CLI 完全同一份文件，不允许预览页另写一套
  if (pathname === '/lib/gltf-admission.js') {
    const libRoot = path.resolve(ROOT, 'lib');
    const fp = path.resolve(libRoot, 'gltf-admission.js');
    if (!isInside(libRoot, fp)) { done(403, 'lib-escape'); return sendText(res, 403, 'forbidden'); }
    done(200, 'shared-module');
    return serve(res, fp);
  }

  // vendor：只允许白名单扩展名，且 resolve 后必须仍在 PREVIEW 内
  if (pathname.startsWith('/vendor/')) {
    const rel = pathname.slice('/vendor/'.length);
    const fp = path.resolve(PREVIEW, 'vendor', rel);
    const vendorRoot = path.resolve(PREVIEW, 'vendor');
    const ext = path.extname(fp).toLowerCase();
    if (!isInside(vendorRoot, fp) || !VENDOR_EXT.has(ext)) {
      done(403, 'vendor-out-of-scope');
      return sendText(res, 403, 'forbidden');
    }
    done(200, 'vendor');
    return serve(res, fp);
  }

  // 清单
  if (pathname === '/glb/list.json') {
    const list = {
      baseline: fs.existsSync(path.join(BASE, 'eiffel.glb')) ? ['/glb/eiffel.glb'] : [],
      fixtures: fs.existsSync(FIXTURES)
        ? fs.readdirSync(FIXTURES).filter(f => f.endsWith('.glb')).sort().map(f => '/glb/fixtures/' + f)
        : []
    };
    done(200, 'list');
    const body = Buffer.from(JSON.stringify(list, null, 2), 'utf8');
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': body.length, 'Cache-Control': 'no-store' });
    return res.end(body);
  }

  // 基线
  if (pathname === '/glb/eiffel.glb') {
    const fp = path.resolve(BASE, 'eiffel.glb');
    if (!isInside(path.resolve(BASE), fp)) { done(403, 'baseline-escape'); return sendText(res, 403, 'forbidden'); }
    done(200, 'baseline');
    return serve(res, fp);
  }

  // 反例
  if (pathname.startsWith('/glb/fixtures/')) {
    const name = pathname.slice('/glb/fixtures/'.length);
    if (!/^[A-Za-z0-9._-]+\.glb$/.test(name)) {
      done(400, 'bad-fixture-name');
      return sendText(res, 400, 'bad name');
    }
    const fp = path.resolve(FIXTURES, name);
    if (!isInside(path.resolve(FIXTURES), fp)) { done(403, 'fixture-escape'); return sendText(res, 403, 'forbidden'); }
    done(200, 'fixture');
    return serve(res, fp);
  }

  done(404, 'not-whitelisted');
  sendText(res, 404, 'not found');
});

server.on('error', (e) => {
  try { fs.appendFileSync(LOG_FILE, '[error] ' + e.code + ' ' + e.message + '\n'); } catch (_) {}
  console.error('server error: ' + e.code + ' ' + e.message);
  process.exit(1);
});

server.listen(port, '127.0.0.1', () => {
  console.log('预览服务器已启动：http://127.0.0.1:' + port);
  console.log('  主页：         http://127.0.0.1:' + port + '/index.html');
  console.log('  基线清单：     http://127.0.0.1:' + port + '/glb/list.json');
  console.log('  反例：         /glb/fixtures/01-normal-indexed.glb 等');
  console.log('  仅监听 127.0.0.1；不代理任何外网地址；访问日志：' + ACCESS_LOG);
  const t = setInterval(() => {
    try { fs.appendFileSync(LOG_FILE, '[heartbeat] ' + new Date().toISOString() + ' pid=' + process.pid + '\n'); } catch (_) {}
  }, 60000);
  t.unref && t.unref();
  server.__hb = t;
});
