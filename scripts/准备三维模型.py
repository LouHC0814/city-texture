"""核对已归档模型，生成可离线加载的自包含 GLB；不访问网络。"""
from pathlib import Path
import base64
import gzip
import hashlib
import json
import struct

ROOT = Path(__file__).resolve().parents[1]


def build():
    folder = ROOT / 'data' / 'models'
    source = json.loads((folder / '来源.json').read_text(encoding='utf-8'))
    raw = {}
    for name, archive in [('scene.gltf', 'eiffel-source.gltf.gz'), ('scene.bin', 'eiffel-source.bin.gz'), ('license.txt', 'eiffel-source.txt')]:
        data = (folder / archive).read_bytes()
        raw[name] = gzip.decompress(data) if archive.endswith('.gz') else data
        if hashlib.sha256(raw[name]).hexdigest() != source[name]['sha256']:
            raise ValueError(f'模型来源 SHA-256 不一致：{archive}')
    model = json.loads(raw['scene.gltf'])
    if model.get('asset', {}).get('version') != '2.0' or model.get('images') or model.get('extensionsRequired'):
        raise ValueError('当前内置模型应为无外部纹理或解码器的 glTF 2.0')
    if model.get('buffers') != [dict(byteLength=len(raw['scene.bin']), uri='scene.bin')]:
        raise ValueError('模型二进制来源不一致')
    del model['buffers'][0]['uri']
    model['asset']['copyright'] = 'SDC — ( FREE ) La tour Eiffel — CC BY 4.0'
    json_chunk = json.dumps(model, ensure_ascii=False, separators=(',', ':')).encode('utf-8')
    json_chunk += b' ' * (-len(json_chunk) % 4)
    binary = raw['scene.bin'] + b'\0' * (-len(raw['scene.bin']) % 4)
    glb = (struct.pack('<4sII', b'glTF', 2, 28 + len(json_chunk) + len(binary)) +
           struct.pack('<I4s', len(json_chunk), b'JSON') + json_chunk +
           struct.pack('<I4s', len(binary), b'BIN\0') + binary)
    packed = bytearray(gzip.compress(glb, compresslevel=9, mtime=0))
    packed[9] = 255  # 不把构建系统写入 gzip 的 OS 字节。
    result = dict(id='eiffel-tower', name='埃菲尔铁塔', place='巴黎 · 法国', author='SDC', license='CC-BY-4.0',
                  source=source['source'], authorUrl='https://sketchfab.com/3Duae',
                  licenseUrl='https://creativecommons.org/licenses/by/4.0/',
                  note='有钢架细节的第三方建筑模型；不是现场扫描或测绘成果。展示已统一居中和缩放，模型单位不作为真实米数。',
                  triangles=sum(model['accessors'][p['indices']]['count'] // 3 for m in model['meshes'] for p in m['primitives']),
                  glbBytes=len(glb), glbSha256=hashlib.sha256(glb).hexdigest(), encoding='gzip-base64',
                  data=base64.b64encode(packed).decode('ascii'))
    output = ROOT / 'dist' / 'data' / 'landmark-eiffel.js'
    payload = json.dumps(result, ensure_ascii=False, separators=(',', ':'))
    output.write_text('/* SDC / CC BY 4.0；完整模型署名见三维展台与模型许可。 */\n(function(r){const d=' + payload +
                      ';if(typeof module==="object"&&module.exports)module.exports=d;else r.CityLandmarkData=d;})(globalThis);\n', encoding='utf-8', newline='\n')
    print(json.dumps(dict(model=result['name'], triangles=result['triangles'], glbBytes=len(glb), compressedBytes=len(packed)), ensure_ascii=False))


if __name__ == '__main__':
    build()
