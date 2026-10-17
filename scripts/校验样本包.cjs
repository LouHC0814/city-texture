// 转换器与应用共用同一份样本包校验规则；输入/输出均为 JSON，不执行输入代码。
const fs = require('node:fs');
const S = require('../dist/samples.js');
try {
  const sample = S.parseSample(fs.readFileSync(0, 'utf8'));
  process.stdout.write(JSON.stringify(sample) + '\n');
} catch (error) {
  process.stderr.write('样本包校验失败：' + error.message + '\n');
  process.exitCode = 1;
}
