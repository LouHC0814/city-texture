"""跨语言样本转换：真实快照、损坏输入、来源一致性与输出保护。"""
import copy
import gzip
import hashlib
import json
from pathlib import Path
import shutil
import sys
import tempfile
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import 转换城区样本 as converter


def geometry(points):
    return [dict(lon=x, lat=y) for x, y in points]


class SampleConversion(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.folder = Path(self.temporary.name)
        self.config_path = self.folder / 'config.json'
        self.output = self.folder / 'sample.json'
        self.node = shutil.which('node')
        if not self.node:
            self.fail('样本转换测试需要 Node.js 22+')
        bbox = [-0.006, -0.006, 0.006, 0.006]
        source = dict(endpoint='https://example.org/overpass', query='[out:json];way(-0.006,-0.006,0.006,0.006);out geom;',
                      fetchedAt='2026-10-17T00:00:00Z', limitations='仅用于单元测试的人工数据，不是真实地图。')
        self.config = dict(city=dict(id='test-city', name='测试', english='TEST', district='人工测试', country='测试', lat=0, lon=0, color='#27776c'),
                           roads=dict(file='roads.json', bbox=bbox, source=source), buildings=dict(file='buildings.json', bbox=bbox, source=copy.deepcopy(source)))
        self.roads = dict(osm3s=dict(timestamp_osm_base='test-token'), elements=[dict(type='way', id=1, tags=dict(highway='residential'),
                          nodes=[1, 2], geometry=geometry([(-0.004, 0), (0.004, 0)]))])
        self.buildings = dict(osm3s=dict(timestamp_osm_base='test-token'), elements=[dict(type='way', id=2, tags=dict(building='yes'),
                              geometry=geometry([(-0.001, -0.001), (0.001, -0.001), (0.001, 0.001), (-0.001, 0.001), (-0.001, -0.001)]))])

    def save(self):
        self.config_path.write_text(json.dumps(self.config), encoding='utf-8')
        (self.folder / 'roads.json').write_text(json.dumps(self.roads), encoding='utf-8')
        (self.folder / 'buildings.json').write_text(json.dumps(self.buildings), encoding='utf-8')

    def run_conversion(self, **kwargs):
        return converter.convert_config(self.config_path, self.output, node=self.node, **kwargs)

    def test_real_archives_retain_counts_sources_and_courtyards(self):
        config = json.loads((ROOT / 'examples' / '苏黎世离线转换.json').read_text(encoding='utf-8'))
        for role in ('roads', 'buildings'):
            config[role]['file'] = str((ROOT / 'examples' / config[role]['file']).resolve())
        self.config_path.write_text(json.dumps(config), encoding='utf-8')
        result = self.run_conversion()
        self.assertEqual((result['roads'], result['buildings']), (3287, 1573))
        self.assertEqual(result['skippedBuildings'], [])
        pack = json.loads(self.output.read_text(encoding='utf-8'))
        self.assertEqual(pack['city']['id'], 'zurich-offline-demo')
        self.assertEqual(pack['city']['source'], config['roads']['source'])
        self.assertEqual(pack['buildings']['source'], config['buildings']['source'])
        self.assertEqual(pack['buildings']['conversion']['innerRings'], 20)
        self.assertEqual(pack['buildings']['conversion']['relations'], 18)

    def test_json_and_gzip_give_identical_package_and_computed_hashes(self):
        self.save()
        original = (self.folder / 'roads.json').read_bytes()
        a = self.run_conversion()
        first = self.output.read_bytes()
        self.assertEqual(a['roadsRawSha256'], hashlib.sha256(original).hexdigest())
        compressed = self.folder / 'roads.json.gz'
        compressed.write_bytes(gzip.compress(original))
        self.config['roads']['file'] = compressed.name
        self.config_path.write_text(json.dumps(self.config), encoding='utf-8')
        b = self.run_conversion(overwrite=True)
        self.assertEqual(first, self.output.read_bytes())
        self.assertEqual(a['roadsRawSha256'], b['roadsRawSha256'])

    def test_second_real_city_uses_its_own_geometry_bbox_and_sources(self):
        config = json.loads((ROOT / 'examples' / '苏黎世离线转换.json').read_text(encoding='utf-8'))
        config['city'].update(id='bern-offline-demo', name='伯尔尼·导入示例', english='BERN', district='老城与阿勒河周边', lat=46.948, lon=7.4474)
        bbox = [46.94305373799951, 7.440154447737732, 46.95294626200049, 7.454645552262268]
        manifests = {'roads': '来源清单.json', 'buildings': '建筑来源清单.json'}
        for role, manifest in manifests.items():
            config[role]['file'] = str(ROOT / 'data' / 'snapshots' / ('bern.json.gz' if role == 'roads' else 'bern-buildings.json.gz'))
            config[role]['bbox'] = bbox
            config[role]['source'] = json.loads((ROOT / 'data' / manifest).read_text(encoding='utf-8'))['bern']
        self.config_path.write_text(json.dumps(config), encoding='utf-8')
        result = self.run_conversion()
        self.assertEqual((result['roads'], result['buildings']), (1842, 1359))
        pack = json.loads(self.output.read_text(encoding='utf-8'))
        self.assertEqual(pack['buildings']['conversion']['innerRings'], 70)
        self.assertEqual(pack['buildings']['conversion']['relations'], 66)
        self.assertEqual(pack['city']['source'], config['roads']['source'])

    def test_hash_or_snapshot_mismatch_preserves_existing_output(self):
        for field, value in [('rawSha256', '0' * 64), ('snapshotToken', 'different-token')]:
            with self.subTest(field=field):
                self.config['roads']['source'].pop('rawSha256', None)
                self.config['roads']['source'].pop('snapshotToken', None)
                self.config['roads']['source'][field] = value
                self.save(); self.output.write_bytes(b'keep this file')
                with self.assertRaises(ValueError):
                    self.run_conversion(overwrite=True)
                self.assertEqual(self.output.read_bytes(), b'keep this file')

    def test_bbox_is_not_inferred_from_feature_extent_or_mismatched_query(self):
        for query in ['[out:json];way(area:123);out geom;', '[out:json];way(0,0,1,1);out geom;']:
            with self.subTest(query=query):
                self.config['roads']['source']['query'] = query; self.save()
                with self.assertRaisesRegex(ValueError, '下载框'):
                    self.run_conversion()
                self.assertFalse(self.output.exists())

    def test_default_refuses_overwrite_and_never_replaces_raw_input(self):
        self.save(); self.output.write_bytes(b'old')
        with self.assertRaisesRegex(ValueError, '已存在'):
            self.run_conversion()
        for path in [self.config_path, self.folder / 'roads.json', self.folder / 'buildings.json']:
            original = path.read_bytes()
            with self.assertRaisesRegex(ValueError, '不能是配置或原始数据'):
                converter.convert_config(self.config_path, path, node=self.node, overwrite=True)
            self.assertEqual(path.read_bytes(), original)

    def test_bad_json_error_remark_and_nonfinite_values_do_not_write_output(self):
        self.save()
        for raw in [b'{broken', b'{"elements":[],"remark":"runtime error"}', b'{"elements":[],"x":NaN}', b'{"elements":null}', b'{"elements":[],"elements":[]}']:
            with self.subTest(raw=raw):
                (self.folder / 'roads.json').write_bytes(raw)
                with self.assertRaises(ValueError):
                    self.run_conversion()
                self.assertFalse(self.output.exists())

    def test_rejects_duplicate_ids_node_mismatch_and_bad_coordinate(self):
        mutations = [lambda e: e.append(copy.deepcopy(e[0])), lambda e: e[0]['nodes'].pop(),
                     lambda e: e[0]['geometry'][0].update(lon=True), lambda e: e[0].update(id=True),
                     lambda e: e[0].update(tags=None), lambda e: e[0]['geometry'].append(None)]
        original = copy.deepcopy(self.roads)
        for mutate in mutations:
            self.roads = copy.deepcopy(original); mutate(self.roads['elements']); self.save()
            with self.subTest(roads=self.roads), self.assertRaises(ValueError):
                self.run_conversion()
            self.assertFalse(self.output.exists())

    def test_application_validator_rejects_source_range_and_node_inconsistency(self):
        mutations = [lambda: self.config['roads']['source'].update(fetchedAt='yesterday'),
                     lambda: self.config['city'].update(color='javascript:bad'),
                     lambda: self.config['city'].update(lon=1),
                     lambda: self.roads['elements'].append(dict(type='way', id=3, tags=dict(highway='service'), nodes=[1, 3], geometry=geometry([(0.003, 0.003), (0.004, 0.004)])))]
        original_config, original_roads = copy.deepcopy(self.config), copy.deepcopy(self.roads)
        for mutate in mutations:
            self.config, self.roads = copy.deepcopy(original_config), copy.deepcopy(original_roads)
            mutate(); self.save()
            with self.assertRaisesRegex(ValueError, '样本包校验失败'):
                self.run_conversion()
            self.assertFalse(self.output.exists())

    def test_empty_building_response_is_allowed_but_empty_roads_are_not(self):
        self.buildings['elements'] = []; self.save()
        self.assertEqual(self.run_conversion()['buildings'], 0)
        self.output.unlink(); self.roads['elements'] = []; self.save()
        with self.assertRaises(ValueError):
            self.run_conversion()
        self.assertFalse(self.output.exists())

    def test_skipped_buildings_require_explicit_opt_in_and_preserve_reason(self):
        bad = copy.deepcopy(self.buildings['elements'][0]); bad['id'] = 3; bad['geometry'].pop()
        self.buildings['elements'].append(bad); self.save()
        with self.assertRaisesRegex(ValueError, 'allow-skipped-buildings'):
            self.run_conversion()
        result = self.run_conversion(allow_skipped=True)
        self.assertEqual(result['buildings'], 1)
        self.assertEqual(result['skippedBuildings'][0]['id'], 'way/3')
        pack = json.loads(self.output.read_text(encoding='utf-8'))
        self.assertEqual(pack['buildings']['conversion']['skipped'], result['skippedBuildings'])

    def test_gzip_size_limit_and_truncated_archive_fail_before_json_parsing(self):
        self.save(); path = self.folder / 'roads.json.gz'
        self.config['roads']['file'] = path.name
        self.config_path.write_text(json.dumps(self.config), encoding='utf-8')
        path.write_bytes(gzip.compress(b' ' * 2000))
        with patch.object(converter, 'MAX_RAW_BYTES', 1000), self.assertRaisesRegex(ValueError, '上限'):
            self.run_conversion()
        path.write_bytes(b'\x1f\x8btruncated')
        with self.assertRaises(ValueError):
            self.run_conversion()
        path.write_bytes(b'\x1f\x8b\x08\x00\x00\x00\x00\x00\x00\x03\x07' + b'\x00' * 8)
        with self.assertRaisesRegex(ValueError, '不能读取'):
            self.run_conversion()
        self.assertFalse(self.output.exists())

    def test_missing_node_executable_preserves_old_output(self):
        self.save(); self.output.write_bytes(b'old')
        with self.assertRaisesRegex(ValueError, 'Node.js'):
            converter.convert_config(self.config_path, self.output, node=str(self.folder / 'missing-node'), overwrite=True)
        self.assertEqual(self.output.read_bytes(), b'old')

    def test_atomic_create_does_not_replace_a_concurrently_created_output(self):
        self.output.write_bytes(b'another writer')
        with self.assertRaises(FileExistsError):
            converter.write_atomic(self.output, b'new', False)
        self.assertEqual(self.output.read_bytes(), b'another writer')
        self.assertEqual(sorted(p.name for p in self.folder.iterdir()), ['sample.json'])


if __name__ == '__main__':
    unittest.main()
