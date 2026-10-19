// 测试辅助：极简 GLB 打包/解包（不依赖任何第三方）
'use strict';
const fs = require('node:fs');

function unpack(file) {
  const b = fs.readFileSync(file);
  if (b.toString('ascii', 0, 4) !== 'glTF') throw new Error('not a GLB: ' + file);
  const jsonLen = b.readUInt32LE(12);
  const jsonStart = 20;
  const jsonEnd = jsonStart + jsonLen;
  const json = JSON.parse(b.toString('utf8', jsonStart, jsonEnd));
  let bin = Buffer.alloc(0);
  if (jsonEnd + 8 <= b.length) {
    const binLen = b.readUInt32LE(jsonEnd);
    bin = Buffer.from(b.subarray(jsonEnd + 8, jsonEnd + 8 + binLen));
  }
  return { json, bin };
}

function pack(json, bin) {
  bin = bin || Buffer.alloc(0);
  let j = Buffer.from(JSON.stringify(json), 'utf8');
  if (j.length % 4) j = Buffer.concat([j, Buffer.alloc(4 - (j.length % 4), 0x20)]);
  let b = bin;
  if (b.length % 4) b = Buffer.concat([b, Buffer.alloc(4 - (b.length % 4), 0)]);

  const head = Buffer.alloc(20);
  head.write('glTF', 0, 'ascii');
  head.writeUInt32LE(2, 4);
  head.writeUInt32LE(20 + j.length + 8 + b.length, 8);
  head.writeUInt32LE(j.length, 12);
  head.write('JSON', 16, 'ascii');

  const binHead = Buffer.alloc(8);
  binHead.writeUInt32LE(b.length, 0);
  binHead[4] = 0x42; binHead[5] = 0x49; binHead[6] = 0x4E; binHead[7] = 0x00;

  return Buffer.concat([head, j, binHead, b]);
}

// 一个最小三角形（3 顶点、无索引）
function triangleGLB(mutate) {
  const pos = [0, 0, 0, 1, 0, 0, 0, 1, 0];
  const bin = Buffer.alloc(36);
  pos.forEach((v, i) => bin.writeFloatLE(v, i * 4));
  const json = {
    asset: { version: '2.0' },
    buffers: [{ byteLength: 36 }],
    bufferViews: [{ buffer: 0, byteOffset: 0, byteLength: 36 }],
    accessors: [{ bufferView: 0, componentType: 5126, count: 3, type: 'VEC3', min: [0, 0, 0], max: [1, 1, 0] }],
    meshes: [{ primitives: [{ attributes: { POSITION: 0 }, mode: 4 }] }],
    nodes: [{ mesh: 0 }],
    scenes: [{ nodes: [0] }]
  };
  if (mutate) mutate(json, bin);
  return pack(json, bin);
}

module.exports = { unpack, pack, triangleGLB };
