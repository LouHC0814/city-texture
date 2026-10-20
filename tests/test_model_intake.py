"""离线模型接入：真实归档重建、纹理保留、原件保护及无效输入隔离。"""
import copy
import gzip
import hashlib
import json
from pathlib import Path
import shutil
import struct
import sys
import tempfile
import unittest
import zipfile

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import 准备南京模型 as intake


class ModelIntake(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.output = self.root / '准备结果'
        self.node = shutil.which('node')
        self.assertIsNotNone(self.node, '模型接入检查需要 Node.js 22+')
        self.source = self.root / 'source.json'
        self.source.write_text(json.dumps(dict(model='人工测试网格', author='城市纹理测试', license='MIT',
                                              licenseUrl='https://opensource.org/license/mit', sourceUrl='https://example.org/test-only')))
        self.fixture = ROOT / 'tools' / '模型体检' / '反例' / '01-normal-indexed.glb'

    def prepare(self, path, **kwargs):
        return intake.prepare(path, self.output, source=self.source, node=self.node, **kwargs)

    def make_gltf(self, fixture='01-normal-indexed.glb'):
        glb = (self.fixture.parent / fixture).read_bytes()
        size = struct.unpack_from('<I', glb, 12)[0]
        model = json.loads(glb[20:20 + size])
        binary = glb[28 + size:]
        binary = binary[:model['buffers'][0]['byteLength']]
        model['buffers'][0]['uri'] = '模型数据.bin'
        self.save_gltf(model, binary)
        return model, binary

    def save_gltf(self, model, binary):
        (self.root / 'scene.gltf').write_text(json.dumps(model), encoding='utf-8')
        (self.root / '模型数据.bin').write_bytes(binary)

    def test_glb_roundtrip_is_byte_exact_and_keeps_provenance(self):
        summary = self.prepare(self.fixture)
        self.assertEqual(summary['status'], 'pass')
        self.assertEqual((self.output / '候选模型.glb').read_bytes(), self.fixture.read_bytes())
        self.assertEqual(summary['original']['sha256'], hashlib.sha256(self.fixture.read_bytes()).hexdigest())
        self.assertFalse(summary['applicationIntegrated'])
        self.assertFalse(summary['visuallyVerified'])
        self.assertEqual((self.output / '来源声明.json').read_bytes(), self.source.read_bytes())

    def test_rejected_glb_has_reports_and_retains_original(self):
        bad = self.fixture.parent / 'codex-world-overflow.glb'
        summary = self.prepare(bad)
        self.assertEqual(summary['status'], 'error')
        self.assertTrue((self.output / '体检' / 'candidate.issues.json').is_file())
        self.assertEqual((self.output / '原始下载.glb').read_bytes(), bad.read_bytes())

    def test_real_eiffel_gltf_preserves_meshes_and_world_bounds(self):
        folder = ROOT / 'data' / 'models'
        (self.root / 'scene.gltf').write_bytes(gzip.decompress((folder / 'eiffel-source.gltf.gz').read_bytes()))
        (self.root / 'scene.bin').write_bytes(gzip.decompress((folder / 'eiffel-source.bin.gz').read_bytes()))
        summary = self.prepare(self.root / 'scene.gltf')
        report = json.loads((self.output / '体检' / 'candidate.gltf-inspect.json').read_text(encoding='utf-8'))
        baseline = json.loads((ROOT / 'tools' / '模型体检' / '体检' / 'eiffel.gltf-inspect.json').read_text(encoding='utf-8'))
        self.assertEqual(summary['status'], 'pass')
        self.assertEqual(report['geometry']['geometryTriangles'], 147604)
        self.assertEqual(report['bounds']['computed'], baseline['bounds']['computed'])
        self.assertEqual((self.output / '原始资源' / 'scene.bin').read_bytes(), (self.root / 'scene.bin').read_bytes())

    def test_zip_embeds_external_png_and_preserves_geometry(self):
        model, binary = self.make_gltf('10-embedded-png-real.glb')
        image = model['images'][0]
        image_view = model['bufferViews'][image['bufferView']]
        offset = image_view.get('byteOffset', 0)
        png = binary[offset:offset + image_view['byteLength']]
        image.pop('bufferView')
        image['uri'] = '贴图%20图.png'
        package = self.root / '下载.zip'
        with zipfile.ZipFile(package, 'w') as archive:
            archive.writestr('model/scene.gltf', json.dumps(model))
            archive.writestr('model/模型数据.bin', binary)
            archive.writestr('model/贴图 图.png', png)
        summary = self.prepare(package)
        report = json.loads((self.output / '体检' / 'candidate.gltf-inspect.json').read_text(encoding='utf-8'))
        self.assertEqual(summary['status'], 'pass')
        self.assertEqual(report['images']['count'], 1)
        self.assertEqual(report['geometry']['geometryTriangles'], 12)
        self.assertEqual((self.output / '原始下载.zip').read_bytes(), package.read_bytes())

    def test_no_overwrite_after_success_or_invalid_conversion(self):
        self.prepare(self.fixture)
        before = {p.relative_to(self.output): p.read_bytes() for p in self.output.rglob('*') if p.is_file()}
        with self.assertRaisesRegex(ValueError, '已存在'):
            self.prepare(self.fixture.parent / '06-bad-magic.glb')
        self.assertEqual(before, {p.relative_to(self.output): p.read_bytes() for p in self.output.rglob('*') if p.is_file()})

    def test_zip_requires_explicit_entry_if_multiple_models(self):
        package = self.root / 'two.zip'
        with zipfile.ZipFile(package, 'w') as archive:
            archive.writestr('a.glb', self.fixture.read_bytes())
            archive.writestr('b.glb', self.fixture.read_bytes())
        with self.assertRaisesRegex(ValueError, '多个入口'):
            self.prepare(package)
        self.assertFalse(self.output.exists())
        self.assertEqual(self.prepare(package, entry='b.glb')['status'], 'pass')

    def test_zip_rejects_traversal_and_duplicate_case_paths(self):
        for names in (['../escape.glb'], ['a.glb', 'A.glb']):
            with self.subTest(names=names):
                package = self.root / 'bad.zip'
                with zipfile.ZipFile(package, 'w') as archive:
                    for name in names:
                        archive.writestr(name, self.fixture.read_bytes())
                with self.assertRaises(ValueError):
                    self.prepare(package)
                self.assertFalse(self.output.exists())

    def test_zip_rejects_symlinks_and_expansion_budget(self):
        package = self.root / 'link.zip'
        with zipfile.ZipFile(package, 'w') as archive:
            info = zipfile.ZipInfo('a.glb')
            info.create_system = 3
            info.external_attr = 0o120777 << 16
            archive.writestr(info, b'outside.glb')
        with self.assertRaisesRegex(ValueError, '符号链接'):
            self.prepare(package)
        from unittest.mock import patch
        with zipfile.ZipFile(package, 'w', compression=zipfile.ZIP_DEFLATED) as archive:
            archive.writestr('a.glb', b'x' * 2048)
        with patch.object(intake, 'MAX_PACKAGE', 1024):
            with self.assertRaisesRegex(ValueError, '展开大小'):
                self.prepare(package)

    def test_external_resource_uri_never_reads_outside_or_fetches_network(self):
        original, binary = self.make_gltf()
        for uri in ('../secret.bin', '%2e%2e/secret.bin', '/secret.bin', 'file:///secret.bin', 'https://example.org/model.bin', '//example.org/a.bin', 'a.bin?x=1'):
            with self.subTest(uri=uri):
                model = copy.deepcopy(original)
                model['buffers'][0]['uri'] = uri
                self.save_gltf(model, binary)
                with self.assertRaises(ValueError):
                    self.prepare(self.root / 'scene.gltf')
                self.assertFalse(self.output.exists())

    def test_does_not_hide_invalid_original_buffer_length_or_reference(self):
        original, binary = self.make_gltf()
        for field in ('length', 'range', 'accessor'):
            with self.subTest(field=field):
                model = copy.deepcopy(original)
                if field == 'length':
                    model['buffers'][0]['byteLength'] += 1
                elif field == 'range':
                    model['bufferViews'][0]['byteLength'] = len(binary) + 1
                else:
                    model['accessors'][0]['bufferView'] = len(model['bufferViews'])
                self.save_gltf(model, binary)
                with self.assertRaises(ValueError):
                    self.prepare(self.root / 'scene.gltf')
                self.assertFalse(self.output.exists())

    def test_does_not_strip_extensions_to_get_pass(self):
        model, binary = self.make_gltf()
        model['extensionsRequired'] = ['KHR_draco_mesh_compression']
        self.save_gltf(model, binary)
        with self.assertRaisesRegex(ValueError, '不自动删除'):
            self.prepare(self.root / 'scene.gltf')
        self.assertFalse(self.output.exists())

    def test_strict_source_and_json_validation(self):
        self.source.write_text('{"model":"unknown"}')
        with self.assertRaisesRegex(ValueError, '来源清单必须包含'):
            self.prepare(self.fixture)
        self.assertFalse(self.output.exists())
        model, binary = self.make_gltf()
        for raw in (b'{"asset": {}, "asset": {}}', b'{"value": NaN}'):
            (self.root / 'scene.gltf').write_bytes(raw)
            with self.assertRaises(ValueError):
                intake.convert(intake.Resources(self.root / 'scene.gltf'))


if __name__ == '__main__':
    unittest.main()
