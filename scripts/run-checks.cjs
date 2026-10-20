// 复用现有 CI/发行入口，同时检查主应用与独立模型工具。
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const ROOT = path.resolve(__dirname, '..');
const TOOL = path.join('tools', '模型体检');
function run(args) {
  const result = spawnSync(process.execPath, args, {
    cwd: ROOT, env: process.env, stdio: 'inherit', windowsHide: true
  });
  if (result.error) console.error(result.error.message);
  if (result.error || result.status !== 0) process.exit(result.status || 1);
}
const mode = process.argv[2];
if (mode !== 'unit' && mode !== 'browser') throw new Error('检查类型必须是 unit 或 browser');
if (mode === 'unit') {
  const tests = fs.readdirSync(path.join(ROOT, 'tests')).filter(name => name.endsWith('.test.cjs')).sort();
  run(['--test', ...tests.map(name => path.join('tests', name))]);
}
run([path.join(TOOL, 'scripts', '准备基线.cjs')]);
run([path.join(TOOL, 'scripts', 'sync-vendor.cjs'), '--verify']);
if (mode === 'unit') {
  run([path.join(TOOL, 'tests', 'run.cjs')]);
} else {
  const chrome = [process.env.CHROME_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    '/usr/bin/google-chrome', '/usr/bin/chromium'].filter(Boolean).find(file => fs.existsSync(file));
  if (!chrome) throw new Error('未找到 Chrome / Edge，请设置 CHROME_PATH');
  process.env.CHROME_PATH = chrome;
  run(['tests/browser.cjs']);
  // 每套输入模拟使用独立浏览器与 profile；两者继承同一个 CITY_RELEASE_HTML。
  // 主应用流程的多轮鼠标/触摸/视口模拟不泄漏进工作台的触摸会话。
  run(['tests/workbench-browser.cjs']);
  run([path.join(TOOL, 'tests', 'preview-admission.cjs')]);
  if (process.env.BROWSER_SCREENSHOT_DIR) {
    const destination = path.resolve(ROOT, process.env.BROWSER_SCREENSHOT_DIR, '模型体检');
    fs.mkdirSync(destination, { recursive: true });
    for (const name of ['preview-eiffel.png', 'preview-after-reject.png']) {
      fs.copyFileSync(path.join(ROOT, TOOL, 'measure', 'shots', name), path.join(destination, name));
    }
  }
}
