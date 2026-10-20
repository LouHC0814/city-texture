// 人工工作台样本：保留测试立方体几何，生成有效 PNG，或嵌入 Chrome 生成的 JPEG。
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
function crc32(bytes) {
  let c = 0xffffffff;
  for (const byte of bytes) { c ^= byte; for (let bit = 0; bit < 8; bit++) c = (c >>> 1) ^ ((c & 1) ? 0xedb88320 : 0); }
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, content) {
  const name = Buffer.from(type), length = Buffer.alloc(4), crc = Buffer.alloc(4);
  length.writeUInt32BE(content.length); crc.writeUInt32BE(crc32(Buffer.concat([name, content])));
  return Buffer.concat([length, name, content, crc]);
}
function png() {
  const header = Buffer.alloc(13); header.writeUInt32BE(16); header.writeUInt32BE(16, 4); header[8] = 8; header[9] = 2;
  const pixels = Buffer.alloc(16 * (16 * 3 + 1));
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
    const color = ((x >> 2) + (y >> 2)) % 2 ? [226, 180, 86] : [44, 119, 105];
    for (let c = 0; c < 3; c++) pixels[y * 49 + 1 + x * 3 + c] = color[c];
  }
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', header), chunk('IDAT', zlib.deflateSync(pixels)), chunk('IEND', Buffer.alloc(0))]);
}
function textured(image = png(), mimeType = 'image/png') {
  const original = fs.readFileSync(path.join(__dirname, '../tools/模型体检/反例/10-embedded-png-real.glb'));
  const jsonLength = original.readUInt32LE(12), model = JSON.parse(original.subarray(20, 20 + jsonLength));
  let binary = original.subarray(28 + jsonLength, 28 + jsonLength + model.buffers[0].byteLength);
  binary = Buffer.concat([binary, Buffer.alloc((4 - binary.length % 4) % 4)]);
  const primitive = model.meshes[0].primitives[0], position = model.accessors[primitive.attributes.POSITION];
  const positionView = model.bufferViews[position.bufferView], uv = Buffer.alloc(position.count * 8);
  for (let i = 0; i < position.count; i++) {
    const offset = (positionView.byteOffset || 0) + (position.byteOffset || 0) + i * (positionView.byteStride || 12);
    uv.writeFloatLE((binary.readFloatLE(offset) + 1) / 2, i * 8);
    uv.writeFloatLE((binary.readFloatLE(offset + 4) + binary.readFloatLE(offset + 8) + 2) / 4, i * 8 + 4);
  }
  const uvView = model.bufferViews.length;
  model.bufferViews.push({ buffer: 0, byteOffset: binary.length, byteLength: uv.length, target: 34962 });
  primitive.attributes.TEXCOORD_0 = model.accessors.length;
  model.accessors.push({ bufferView: uvView, componentType: 5126, type: 'VEC2', count: position.count });
  binary = Buffer.concat([binary, uv]);
  const view = model.bufferViews[model.images[0].bufferView]; view.byteOffset = binary.length; view.byteLength = image.length;
  binary = Buffer.concat([binary, image]); model.images[0].mimeType = mimeType; model.buffers[0].byteLength = binary.length;
  model.asset.copyright = '城市纹理人工验收样本；不是南京或其他真实建筑。';
  let json = Buffer.from(JSON.stringify(model)); json = Buffer.concat([json, Buffer.alloc((4 - json.length % 4) % 4, 32)]);
  binary = Buffer.concat([binary, Buffer.alloc((4 - binary.length % 4) % 4)]);
  const header = Buffer.alloc(20); header.write('glTF'); header.writeUInt32LE(2, 4); header.writeUInt32LE(28 + json.length + binary.length, 8); header.writeUInt32LE(json.length, 12); header.write('JSON', 16);
  const binHeader = Buffer.alloc(8); binHeader.writeUInt32LE(binary.length); binHeader.write('BIN\0', 4);
  return Buffer.concat([header, json, binHeader, binary]);
}
module.exports = { textured, png };
