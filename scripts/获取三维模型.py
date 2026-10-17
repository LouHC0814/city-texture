"""开发构建：从固定提交取得三维原始资源，按来源清单校验后归档。"""
from pathlib import Path
import gzip
import hashlib
import json
import urllib.request

ROOT = Path(__file__).resolve().parents[1]


def acquire():
    folder = ROOT / 'data' / 'models'
    source = json.loads((folder / '来源.json').read_text(encoding='utf-8'))
    base = ('https://raw.githubusercontent.com/diarmidmackenzie/scale-of-the-universe-vr/'
            '99fd19ec14019aad697a47807c5941398d35bb9d/assets/eiffel/')
    for name, archive in [('scene.gltf', 'eiffel-source.gltf.gz'), ('scene.bin', 'eiffel-source.bin.gz'), ('license.txt', 'eiffel-source.txt')]:
        target = folder / archive
        raw = None
        if target.exists():
            cached = target.read_bytes()
            raw = gzip.decompress(cached) if archive.endswith('.gz') else cached
            if hashlib.sha256(raw).hexdigest() != source[name]['sha256']:
                raise ValueError(f'本地模型归档校验失败：{archive}')
        if raw is None:
            request = urllib.request.Request(base + name, headers={'User-Agent': 'city-texture-model-build/0.7'})
            with urllib.request.urlopen(request, timeout=55) as response:
                raw = response.read(source[name]['bytes'] + 1)
        if len(raw) != source[name]['bytes'] or hashlib.sha256(raw).hexdigest() != source[name]['sha256']:
            raise ValueError(f'远端模型内容与固定校验值不一致：{name}')
        if archive.endswith('.gz'):
            packed = bytearray(gzip.compress(raw, compresslevel=9, mtime=0))
            packed[9] = 255
            target.write_bytes(packed)
        else:
            target.write_bytes(raw)
        print(f'{archive}：来源与 SHA-256 校验通过', flush=True)


if __name__ == '__main__':
    acquire()
