// 预览页第三方依赖（three.js）的同步与完整性核对。
//
//   node scripts/sync-vendor.cjs            同步：从 node_modules 拷贝 + 写 MANIFEST.json
//   node scripts/sync-vendor.cjs --verify   核对：只读比对既有清单，绝不写任何文件
//
// 两个模式是分开的，不能互相兜底：
//   - sync 是"建立基准"：需要 node_modules/three，并校验其 package.json 版本 === VERSION
//   - verify 是"检查有没有被动过"：只读 MANIFEST.json + 现网文件，任何不一致都非 0
//
// 历史 bug（Codex 第三次验收 必修4）：旧版 --verify 在核对完之后又重写了一遍清单，
// 于是"文件被改"反而被登记成新基准，退出码还是 0——那是在重建基准，不是校验。
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = path.resolve(__dirname, '..');
const VENDOR = path.join(ROOT, '预览', 'vendor');
const MANIFEST = path.join(VENDOR, 'MANIFEST.json');
const NM = path.join(ROOT, 'node_modules', 'three');
const VERSION = '0.186.0';

// 固定路径：清单里只能出现这些条目，多一条少一条都算不符
const MAP = [
  ['build/three.module.js', 'three.module.js'],
  ['build/three.core.js', 'three.core.js'],
  ['examples/jsm/controls/OrbitControls.js', 'jsm/controls/OrbitControls.js'],
  ['examples/jsm/loaders/GLTFLoader.js', 'jsm/loaders/GLTFLoader.js'],
  ['examples/jsm/utils/BufferGeometryUtils.js', 'jsm/utils/BufferGeometryUtils.js'],
  ['examples/jsm/utils/SkeletonUtils.js', 'jsm/utils/SkeletonUtils.js'],
  ['examples/jsm/environments/RoomEnvironment.js', 'jsm/environments/RoomEnvironment.js']
];

const EXPECTED_PATHS = MAP.map(([, dst]) => '预览/vendor/' + dst.replace(/\\/g, '/'));

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function fail(payload, code) {
  console.log(JSON.stringify(payload, null, 2));
  process.exit(code);
}

// ── verify：只读 ──
function verify() {
  if (!fs.existsSync(MANIFEST)) {
    fail({ mode: 'verify', ok: false, error: 'manifest_missing', manifest: '预览/vendor/MANIFEST.json' }, 2);
  }
  const rawManifest = fs.readFileSync(MANIFEST);
  let manifest;
  try {
    manifest = JSON.parse(rawManifest.toString('utf8'));
  } catch (e) {
    fail({ mode: 'verify', ok: false, error: 'manifest_unparsable', detail: String(e && e.message) }, 2);
  }

  const problems = [];
  const files = Array.isArray(manifest.files) ? manifest.files : [];

  if (!manifest.source || manifest.source.version !== VERSION) {
    problems.push({
      kind: 'manifest_version',
      expected: VERSION,
      actual: manifest.source ? manifest.source.version : null
    });
  }

  const actualPaths = files.map((f) => f && f.path);
  if (actualPaths.length !== EXPECTED_PATHS.length) {
    problems.push({ kind: 'manifest_entry_count', expected: EXPECTED_PATHS.length, actual: actualPaths.length });
  }
  for (let i = 0; i < EXPECTED_PATHS.length; i++) {
    if (actualPaths[i] !== EXPECTED_PATHS[i]) {
      problems.push({ kind: 'manifest_path', index: i, expected: EXPECTED_PATHS[i], actual: actualPaths[i] || null });
    }
  }

  let totalBytes = 0;
  for (let i = 0; i < EXPECTED_PATHS.length; i++) {
    const rel = EXPECTED_PATHS[i];
    const abs = path.join(ROOT, rel.split('/').join(path.sep));
    const entry = files[i] || {};
    if (!fs.existsSync(abs)) {
      problems.push({ kind: 'file_missing', path: rel });
      continue;
    }
    const st = fs.statSync(abs);
    totalBytes += st.size;
    if (entry.bytes !== st.size) {
      problems.push({ kind: 'size_mismatch', path: rel, expected: entry.bytes, actual: st.size });
    }
    const digest = sha256(abs);
    if (entry.sha256 !== digest) {
      problems.push({ kind: 'hash_mismatch', path: rel, expected: entry.sha256, actual: digest });
    }
  }

  const ok = problems.length === 0;
  const payload = {
    mode: 'verify',
    ok,
    files: EXPECTED_PATHS.length,
    totalBytes,
    manifest: '预览/vendor/MANIFEST.json',
    manifestBytes: rawManifest.length,
    problems
  };
  // 关键：verify 无论成败都不写文件。清单/文件的"修正"只能由 sync 做。
  if (!ok) fail(payload, 1);
  console.log(JSON.stringify(payload, null, 2));
  process.exit(0);
}

// ── sync：建立基准 ──
function sync() {
  if (!fs.existsSync(NM)) {
    fail({
      mode: 'sync',
      error: 'three_package_missing',
      hint: '交付包不含 node_modules。需要重新拷 vendor 时先 `npm install three@' + VERSION + '`；'
          + '只想核对现有文件完整性请用 --verify'
    }, 2);
  }

  const pkgFile = path.join(NM, 'package.json');
  if (!fs.existsSync(pkgFile)) {
    fail({ mode: 'sync', error: 'source_package_json_missing', path: pkgFile }, 2);
  }
  const pkg = JSON.parse(fs.readFileSync(pkgFile, 'utf8'));
  if (pkg.version !== VERSION) {
    // 复制"某个版本的 three"却把清单标成 VERSION，是比缺文件更坏的错
    fail({
      mode: 'sync', error: 'source_version_mismatch',
      expected: VERSION, actual: pkg.version,
      hint: 'node_modules 里的 three 版本与脚本声明的版本不一致，禁止混用'
    }, 2);
  }

  const entries = [];
  for (let i = 0; i < MAP.length; i++) {
    const srcRel = MAP[i][0];
    const dstRel = MAP[i][1];
    const src = path.join(NM, srcRel);
    const dst = path.join(VENDOR, dstRel);
    if (!fs.existsSync(src)) {
      fail({ mode: 'sync', error: 'source_file_missing', path: src }, 2);
    }
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.copyFileSync(src, dst);
    entries.push({
      path: EXPECTED_PATHS[i],
      bytes: fs.statSync(dst).size,
      sha256: sha256(dst)
    });
  }

  const manifest = {
    kind: 'vendor-manifest',
    generatedAt: new Date().toISOString(),
    source: {
      package: 'three',
      version: VERSION,
      license: 'MIT',
      npm: 'https://www.npmjs.com/package/three/v/' + VERSION,
      copyright: 'Copyright 2010-2026 Three.js Authors（见 预览/vendor/LICENSE-third-party.txt）'
    },
    note: '这 7 个文件是预览页运行所需的全部第三方代码；import 图闭合，无其他依赖。'
        + '本清单只能由 sync 写出，verify 只读。',
    files: entries
  };
  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n', 'utf8');

  console.log(JSON.stringify({
    mode: 'sync',
    files: entries.length,
    totalBytes: entries.reduce((a, e) => a + e.bytes, 0),
    sourceVersion: pkg.version,
    manifest: '预览/vendor/MANIFEST.json'
  }, null, 2));
  process.exit(0);
}

if (process.argv.includes('--verify')) verify();
else sync();
