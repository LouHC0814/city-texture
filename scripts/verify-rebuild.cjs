const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const ids = Object.keys(JSON.parse(fs.readFileSync(path.join(root, 'data/来源清单.json'), 'utf8')));
const buildingIds = Object.keys(JSON.parse(fs.readFileSync(path.join(root, 'data/建筑来源清单.json'), 'utf8')));
assert.deepEqual([...ids].sort(), [...buildingIds].sort(), '道路与建筑的内置样本 ID 必须一致');
const paths = ids.flatMap(id => [id, id + '-buildings']).map(id => path.join(root, 'dist/data', id + '.js'));
const hash = p => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const before = paths.map(hash);
// CI 通过 PYTHON_BIN 指定解释器；本机运行时也应传绝对路径。
if (!process.env.PYTHON_BIN) throw new Error('请用 PYTHON_BIN 指定 Python 解释器路径');
execFileSync(process.env.PYTHON_BIN, [path.join(root, 'scripts/获取城市数据.py'), '--offline'], { cwd: root, stdio: 'inherit', env: { ...process.env, PYTHONIOENCODING: 'utf-8' } });
execFileSync(process.env.PYTHON_BIN, [path.join(root, 'scripts/获取建筑数据.py'), '--offline'], { cwd: root, stdio: 'inherit', env: { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONDONTWRITEBYTECODE: '1' } });
assert.deepEqual(paths.map(hash), before, '离线重建结果必须与已提交样本逐字节一致');
console.log('原始快照校验与离线重建通过。');
