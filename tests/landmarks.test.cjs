const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), zlib = require('node:zlib'), crypto = require('node:crypto');
const data = require('../dist/data/landmark-eiffel.js');
const glb = zlib.gunzipSync(Buffer.from(data.data, 'base64'));
const jsonSize = glb.readUInt32LE(12), model = JSON.parse(glb.subarray(20, 20 + jsonSize).toString());
test('建筑模型原始归档的三个校验值与来源清单一致', () => {
  const source = JSON.parse(fs.readFileSync('data/models/来源.json'));
  for (const [name, path] of [['scene.gltf', 'eiffel-source.gltf.gz'], ['scene.bin', 'eiffel-source.bin.gz'], ['license.txt', 'eiffel-source.txt']]) {
    const bytes = fs.readFileSync('data/models/' + path), raw = path.endsWith('.gz') ? zlib.gunzipSync(bytes) : bytes;
    assert.equal(raw.length, source[name].bytes); assert.equal(crypto.createHash('sha256').update(raw).digest('hex'), source[name].sha256);
  }
});
test('离线模型是完整 glTF 2.0 GLB，JSON 与二进制块长度一致', () => {
  assert.equal(glb.toString('ascii', 0, 4), 'glTF'); assert.equal(glb.readUInt32LE(4), 2);
  assert.equal(glb.readUInt32LE(8), glb.length); assert.equal(glb.length, data.glbBytes);
  assert.equal(glb.toString('ascii', 16, 20), 'JSON'); assert.equal(jsonSize % 4, 0);
  assert.equal(glb.readUInt32LE(20 + jsonSize), model.buffers[0].byteLength);
  assert.equal(glb.toString('ascii', 24 + jsonSize, 28 + jsonSize), 'BIN\0');
  assert.equal(28 + jsonSize + model.buffers[0].byteLength, glb.length);
  assert.equal(crypto.createHash('sha256').update(glb).digest('hex'), data.glbSha256);
});
test('模型不要求外部纹理、相对文件或在线解码器', () => {
  assert.equal(model.buffers.length, 1); assert.equal(model.buffers[0].uri, undefined);
  assert.equal(model.images, undefined); assert.equal(model.extensionsRequired, undefined);
  assert.equal(model.asset.version, '2.0');
});
test('保留钢架模型的三组网格、全部索引和顶点范围', () => {
  assert.equal(model.meshes.length, 3);
  const raw = JSON.parse(zlib.gunzipSync(fs.readFileSync('data/models/eiffel-source.gltf.gz')));
  assert.deepEqual(model.meshes, raw.meshes); assert.deepEqual(model.accessors, raw.accessors); assert.deepEqual(model.nodes, raw.nodes);
  assert.deepEqual(model.materials, raw.materials);
  const triangles = model.meshes.reduce((sum, m) => sum + m.primitives.reduce((n, p) => n + model.accessors[p.indices].count / 3, 0), 0);
  assert.equal(triangles, 147604); assert.equal(triangles, data.triangles);
  for (const accessor of model.accessors.filter(a => a.min)) assert.ok(accessor.max.every((max, i) => Number.isFinite(max) && max >= accessor.min[i]));
});
test('模型、下载和运行库保留独立作者许可，不将展示单位当成真实米数', () => {
  assert.equal(data.author, 'SDC'); assert.equal(data.license, 'CC-BY-4.0'); assert.ok(data.note.includes('不作为真实米数'));
  assert.ok(model.asset.extras.source.includes('sketchfab.com')); assert.ok(model.asset.copyright.includes('SDC'));
  const html = fs.readFileSync('dist/index.html', 'utf8'); assert.ok(html.includes(data.source)); assert.ok(html.includes(data.licenseUrl));
  assert.ok(fs.readFileSync('licenses/three-MIT.txt', 'utf8').includes('three.js authors'));
});
