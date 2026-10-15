const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '../dist');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml' };
function createServer() {
  return http.createServer(async (req, res) => {
    if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); res.end(); return; }
    let pathname;
    try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); } catch (_) { res.writeHead(400); res.end(); return; }
    const target = path.resolve(ROOT, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!target.startsWith(ROOT + path.sep)) { res.writeHead(403); res.end(); return; }
    try { const body = await fs.readFile(target); res.writeHead(200, { 'Content-Type': types[path.extname(target)] || 'application/octet-stream', 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' }); res.end(req.method === 'HEAD' ? undefined : body); }
    catch (_) { res.writeHead(404); res.end('Not found'); }
  });
}
module.exports = { createServer };
if (require.main === module) { const server = createServer(); server.on('error', e => { console.error(e.message); process.exitCode = 1; }); server.listen(Number(process.env.PORT || 4173), '127.0.0.1', () => console.log(`城市纹理：http://127.0.0.1:${server.address().port}`)); }
