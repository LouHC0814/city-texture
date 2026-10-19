// 打包：把交付内容复制到 pack/城市纹理-模型体检实验/，排除浏览器缓存、临时进程文件与备份。
//
//   node scripts/pack.cjs
//
// 排除规则（都是运行过程中产生的，不属于交付物）：
//   node_modules/            第三方源码（vendor 已内嵌，不需要）
//   measure/.chrome-*        浏览器用户数据目录
//   measure/.tmp-*           临时 profile / 日志
//   *.tmp-* / *.bak-*        原子写入的中间文件与备份
//   .tmp-preview-server.*    预览服务 pid / 日志
//   pack/                    本脚本输出目录
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = path.resolve(__dirname, '..');
const OUT_ROOT = path.join(ROOT, 'pack');
const OUT = path.join(OUT_ROOT, '城市纹理-模型体检实验');

const EXCLUDE_DIRS = new Set(['node_modules', 'pack', '.git']);
const EXCLUDE_PREFIX = ['.chrome-', '.tmp-', 'tmp-'];
const EXCLUDE_SUFFIX = ['.tmp', '.bak'];

function excluded(relParts, name) {
  if (EXCLUDE_DIRS.has(name)) return true;
  for (const p of EXCLUDE_PREFIX) if (name.startsWith(p)) return true;
  for (const s of EXCLUDE_SUFFIX) if (name.endsWith(s)) return true;
  if (/\.tmp-\d/.test(name) || /\.bak-\d/.test(name)) return true;
  return false;
}

function walk(dir, rel, acc) {
  for (const name of fs.readdirSync(dir)) {
    if (excluded(rel, name)) continue;
    const abs = path.join(dir, name);
    const r = rel ? rel + '/' + name : name;
    const st = fs.lstatSync(abs);
    if (st.isDirectory()) walk(abs, r, acc);
    else if (st.isFile()) acc.push({ abs, rel: r, bytes: st.size });
  }
}

function main() {
  fs.rmSync(OUT_ROOT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });

  const files = [];
  walk(ROOT, '', files);

  const manifest = [];
  for (const f of files) {
    const dst = path.join(OUT, f.rel);
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.copyFileSync(f.abs, dst);
    manifest.push({
      path: f.rel,
      bytes: f.bytes,
      sha256: crypto.createHash('sha256').update(fs.readFileSync(f.abs)).digest('hex')
    });
  }

  const summary = {
    kind: 'delivery-pack',
    generatedAt: new Date().toISOString(),
    outDir: path.relative(ROOT, OUT),
    fileCount: manifest.length,
    totalBytes: manifest.reduce((a, m) => a + m.bytes, 0),
    excluded: {
      dirs: Array.from(EXCLUDE_DIRS),
      prefixes: EXCLUDE_PREFIX,
      suffixes: EXCLUDE_SUFFIX
    },
    files: manifest
  };
  fs.writeFileSync(path.join(OUT_ROOT, 'MANIFEST.json'), JSON.stringify(summary, null, 2) + '\n', 'utf8');

  // 自检：不该有缓存/临时文件
  const bad = manifest.filter(m => /\.chrome-|\.tmp-|\.bak-|node_modules\//.test(m.path));
  console.log(JSON.stringify({
    out: summary.outDir,
    fileCount: summary.fileCount,
    totalMiB: +(summary.totalBytes / 1024 / 1024).toFixed(2),
    manifest: 'pack/MANIFEST.json',
    leftoverTempFiles: bad.map(b => b.path)
  }, null, 2));

  if (bad.length) process.exit(3);
}

main();
