// 城市纹理 · GLB 体检工具 CLI（v0.5.0）
//
// 状态模型（Codex 第二次验收 P1-1）：
//   报告里的 status 为唯一真相：pass / error / unsupported。
//   任何 severity=error 或 unsupported 的 issue 都意味着 status !== 'pass'，
//   CLI 一律非 0 退出——不再靠"哪些 code 致命"的白名单。
//
// 写入模型（P1-2）：
//   三份产物先全部写到同目录临时文件，再把旧文件备份，最后逐个 rename 提交。
//   任一步失败 → 回滚到上一组可用结果，不会出现"JSON 换了、issues 还是旧的"。
//
// 退出码：
//   0  status=pass（允许 warning）
//   2  status=error / unsupported（GLB 有问题或不支持，但报告已写出）
//   3  CLI 参数错误（含 --source 不是合法 JSON）
//   4  读写失败（含回滚后仍无法恢复）
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { inspect, TOOL, TOOL_VERSION, REPORT_FORMAT, REPORT_VERSION } = require('../lib/inspect.js');
const { renderHTML } = require('../lib/render-html.js');
const admission = require('../lib/gltf-admission.js');

const LIMITS = admission.SUPPORT.limits;

const ARGS = {
  '--input': { hasValue: true },
  '--out': { hasValue: true },
  '--name': { hasValue: true },
  '--source': { hasValue: true },
  '--overwrite': { hasValue: false }
};

const USAGE = `用法：node bin/gltf-inspect.cjs --input <glb> --out <dir> [--name <label>] [--source <json>] [--overwrite]

参数：
  --input      GLB 文件路径，必填（超过 ${LIMITS.fileBytes / 1024 / 1024} MiB 会在读取前直接拒绝）
  --out        输出目录（不存在会自动创建）
  --name       报告名（默认取 input 的 basename；不允许路径分隔符、..、点开头）
  --source     可选；来源/许可 **JSON** 文件（不是 txt）：
               { "author": "", "license": "", "sourceUrl": "", "note": "", "credit": "" }
  --overwrite  允许替换已存在的同名产物（默认拒绝，原文件不动）

输出三份（同一批次的原子提交）：
  <out>/<name>.gltf-inspect.json / .gltf-inspect.html / .issues.json

status：pass / error / unsupported

退出码：
  0  status=pass（可含 warning）
  2  status=error 或 unsupported（报告已写出）
  3  参数错误
  4  读写失败`;

function parseArgs(argv) {
  const out = {};
  const positional = [];
  let i = 0;
  while (i < argv.length) {
    const a = argv[i];
    if (a.startsWith('--')) {
      if (!(a in ARGS)) return { error: 'unknown_arg', arg: a };
      const def = ARGS[a];
      if (def.hasValue) {
        const v = argv[i + 1];
        if (v == null || v.startsWith('--')) return { error: 'missing_value', arg: a };
        out[a.slice(2)] = v;
        i += 2;
      } else {
        out[a.slice(2)] = true;
        i += 1;
      }
    } else {
      positional.push(a);
      i += 1;
    }
  }
  return { args: out, positional };
}

function targetPaths(outDir, name) {
  const clean = name.replace(/[\\/]/g, '_');
  return {
    jsonPath: path.join(outDir, clean + '.gltf-inspect.json'),
    htmlPath: path.join(outDir, clean + '.gltf-inspect.html'),
    issuesPath: path.join(outDir, clean + '.issues.json')
  };
}

function anyExists(paths) {
  for (const p of paths) if (fs.existsSync(p)) return true;
  return false;
}

// 原子提交：全写临时 → 备份旧 → 逐个 rename → 成功删备份；失败全量回滚
function commitAtomically(files) {
  const stamp = `${process.pid}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  const tmp = files.map((f, i) => `${f.path}.tmp-${stamp}-${i}`);
  const bak = files.map((f, i) => `${f.path}.bak-${stamp}-${i}`);
  const written = [];
  const backedUp = [];
  const committed = [];

  try {
    // 0) 目标预检：目录、只读等提前失败，避免动到任何现有文件
    for (const f of files) {
      if (fs.existsSync(f.path)) {
        const st = fs.statSync(f.path);
        if (st.isDirectory()) throw new Error(`目标路径是目录，无法写入：${f.path}`);
      }
    }
    // 1) 全部内容先落临时文件
    files.forEach((f, i) => {
      fs.writeFileSync(tmp[i], f.data);
      written.push(tmp[i]);
    });
    // 2) 备份旧产物
    files.forEach((f, i) => {
      if (fs.existsSync(f.path)) {
        fs.renameSync(f.path, bak[i]);
        backedUp.push({ i, bak: bak[i] });
      }
    });
    // 3) 提交
    files.forEach((f, i) => {
      fs.renameSync(tmp[i], f.path);
      committed.push(f.path);
    });
    // 4) 成功后清理备份：Windows 上刚 rename 的文件可能被索引/杀软短暂占用，
    //    所以重试几次；确实删不掉就把残留列出来（不静默吞掉，避免体检目录里越积越多）
    const leftovers = [];
    for (const b of backedUp) {
      let okDel = false;
      for (let attempt = 0; attempt < 6 && !okDel; attempt++) {
        try { fs.rmSync(b.bak, { force: true }); okDel = true; }
        catch (_) { const t = Date.now(); while (Date.now() - t < 15) { /* 短暂等待 */ } }
      }
      if (!okDel && fs.existsSync(b.bak)) leftovers.push(b.bak);
    }
    return { ok: true, leftovers };
  } catch (err) {
    // 回滚：撤销已提交 → 恢复备份 → 清理临时
    for (const p of committed) { try { fs.rmSync(p, { force: true }); } catch (_) {} }
    for (const b of backedUp) {
      try {
        if (fs.existsSync(b.bak)) fs.renameSync(b.bak, files[b.i].path);
      } catch (_) {}
    }
    for (const p of written) { try { fs.rmSync(p, { force: true }); } catch (_) {} }
    return { ok: false, error: err };
  }
}

function rejectedReport(name, size, code, message) {
  const now = new Date().toISOString();
  return {
    format: REPORT_FORMAT,
    formatVersion: REPORT_VERSION,
    run: { tool: TOOL, toolVersion: TOOL_VERSION, startedAt: now, finishedAt: now, durationMs: 0 },
    input: { name, bytes: size, sha256: null, detectedFormat: 'not-read' },
    status: 'error',
    fatal: true,
    reason: message,
    issues: [{ code, severity: 'error', message, target: 'file' }],
    admission: { status: 'error', support: admission.SUPPORT, issueCountBySeverity: { error: 1, unsupported: 0, warning: 0, info: 0 } },
    container: null,
    structure: null,
    geometry: { positionRecords: null, uniqueGeometries: null, geometryTriangles: null, sceneInstancesTriangles: null, byMode: null, meshGeometryTriangles: null, meshInstanceCount: null, unknown: true, unknownReasons: [code] },
    bounds: { computed: null, conservative: null, selfReported: null, note: '未读取文件内容' },
    materials: null,
    images: null,
    extensions: { used: [], required: [] }
  };
}

function main() {
  const argv = process.argv.slice(2);
  if (argv.length === 0 || argv.includes('--help') || argv.includes('-h')) {
    console.log(USAGE);
    process.exit(0);
  }

  const parsed = parseArgs(argv);
  if (parsed.error) {
    console.error(JSON.stringify({ error: parsed.error, arg: parsed.arg || null }));
    process.exit(3);
  }
  const args = parsed.args;
  if (!args.input) { console.error(JSON.stringify({ error: 'missing_input' })); process.exit(3); }
  if (!args.out) { console.error(JSON.stringify({ error: 'missing_out' })); process.exit(3); }
  if (!fs.existsSync(args.input)) {
    console.error(JSON.stringify({ error: 'input_not_found', input: args.input }));
    process.exit(3);
  }

  const stat = fs.statSync(args.input);
  if (!stat.isFile()) {
    console.error(JSON.stringify({ error: 'input_not_file', input: args.input }));
    process.exit(3);
  }

  const name = args.name || path.basename(args.input, path.extname(args.input));
  if (/[\\/]|\.\.|^\.|\s$/.test(name)) {
    console.error(JSON.stringify({ error: 'invalid_name', name }));
    process.exit(3);
  }

  let source = null;
  if (args.source) {
    if (!fs.existsSync(args.source)) {
      console.error(JSON.stringify({ error: 'source_not_found', path: args.source }));
      process.exit(3);
    }
    try {
      source = JSON.parse(fs.readFileSync(args.source, 'utf8'));
    } catch (e) {
      console.error(JSON.stringify({
        error: 'source_not_json', path: args.source, message: e.message,
        hint: '--source 只接受 JSON；许可原文请另存为 txt 并在 JSON 里用 note/credit 引用'
      }));
      process.exit(3);
    }
  }

  fs.mkdirSync(args.out, { recursive: true });
  const { jsonPath, htmlPath, issuesPath } = targetPaths(args.out, name);
  const targets = [jsonPath, htmlPath, issuesPath];

  if (!args.overwrite && anyExists(targets)) {
    console.error(JSON.stringify({
      error: 'output_exists', jsonPath, htmlPath, issuesPath,
      hint: '加 --overwrite 才会替换，否则原产物保持不动'
    }));
    process.exit(2);
  }

  // 超限文件：读之前就拒绝，避免把 1GB 拖进内存
  let report;
  if (stat.size > LIMITS.fileBytes) {
    report = rejectedReport(name, stat.size, 'E_FILE_TOO_LARGE',
      `文件 ${stat.size} 字节超过 ${LIMITS.fileBytes} 字节上限，未读取内容`);
  } else {
    let buf;
    try {
      buf = fs.readFileSync(args.input);
    } catch (e) {
      console.error(JSON.stringify({ error: 'read_input_failed', message: e.message }));
      process.exit(4);
    }
    try {
      report = inspect(buf, name);
    } catch (e) {
      // 兜底：任何未预期异常都要产出结构化报告，而不是裸栈
      report = rejectedReport(name, buf.length, 'E_INTERNAL',
        `体检过程异常：${e && e.name}: ${e && e.message}`);
    }
  }

  if (source) report.source = source;

  const html = renderHTML(report, source);
  const res = commitAtomically([
    { path: jsonPath, data: JSON.stringify(report, null, 2) },
    { path: htmlPath, data: html },
    { path: issuesPath, data: JSON.stringify(report.issues || [], null, 2) }
  ]);

  if (!res.ok) {
    console.error(JSON.stringify({
      error: 'write_failed',
      message: String(res.error && res.error.message || res.error),
      targets,
      rolledBack: true
    }));
    process.exit(4);
  }

  const exitCode = report.status === 'pass' ? 0 : 2;
  const out = {
    jsonPath, htmlPath, issuesPath,
    status: report.status,
    fatal: report.fatal,
    issues: (report.issues || []).length,
    exitCode
  };
  if (res.leftovers && res.leftovers.length) out.leftoverBackups = res.leftovers;
  console.log(JSON.stringify(out));
  process.exit(exitCode);
}

if (require.main === module) main();
module.exports = { parseArgs, targetPaths, commitAtomically };
