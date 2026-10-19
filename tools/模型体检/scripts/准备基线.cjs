// 从本仓库已归档的模块离线还原真实 GLB，不联网、不覆盖不同内容。
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const zlib = require('node:zlib');
const crypto = require('node:crypto');
const TOOL = path.resolve(__dirname, '..');
const REPO = path.resolve(TOOL, '..', '..');
const OUTPUT = path.join(TOOL, '基线', 'eiffel.glb');
const SHA256 = '628e7a27d25f673d9a99f6f83690862ca5690406d3ccc481d982c5d7852749a4';
const BYTES = 5696248;
function verify(bytes) {
  if (bytes.length !== BYTES ||
      crypto.createHash('sha256').update(bytes).digest('hex') !== SHA256) {
    throw new Error('铁塔基线字节数或 SHA-256 不匹配，原文件保持不变');
  }
}
function prepare() {
  if (fs.existsSync(OUTPUT)) {
    verify(fs.readFileSync(OUTPUT));
    return { status: 'verified', bytes: BYTES, sha256: SHA256 };
  }
  const source = path.join(REPO, 'dist', 'data', 'landmark-eiffel.js');
  if (!fs.existsSync(source)) throw new Error('缺少仓库模型归档；请在完整 city-texture 源码中运行，或使用已附基线的独立工具包');
  // 只执行本仓库固定的受信任数据模块；用户 GLB 从不进入此代码路径。
  const context = {};
  vm.runInNewContext(fs.readFileSync(source, 'utf8'), context, { timeout: 1000 });
  const model = context.CityLandmarkData;
  if (!model || model.encoding !== 'gzip-base64' || model.glbSha256 !== SHA256) {
    throw new Error('仓库模型标识或编码不匹配');
  }
  const bytes = zlib.gunzipSync(Buffer.from(model.data, 'base64'), { maxOutputLength: BYTES });
  verify(bytes);
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  // wx 防止另一进程先写入后被覆盖；只写已完整校验的内容。
  fs.writeFileSync(OUTPUT, bytes, { flag: 'wx' });
  return { status: 'prepared', bytes: BYTES, sha256: SHA256 };
}
if (require.main === module) {
  try { console.log(JSON.stringify(prepare())); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
module.exports = { prepare };
