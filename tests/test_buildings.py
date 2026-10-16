"""建筑数据转换的独立小样本：分段关系、内院和损坏输入。"""
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from 获取建筑数据 import convert, stitch


def geometry(points):
    return [dict(lon=x, lat=y) for x, y in points]


def way(identifier, points, building="yes"):
    return dict(type="way", id=identifier, tags={"building": building}, geometry=geometry(points))


def member(identifier, points, role="outer"):
    return dict(type="way", ref=identifier, role=role, geometry=geometry(points))


def relation(members):
    return dict(type="relation", id=100, tags={"type": "multipolygon", "building": "yes"}, members=members)


SQUARE = [(0, 0), (1, 0), (1, 1), (0, 1), (0, 0)]
INNER = [(0.2, 0.2), (0.8, 0.2), (0.8, 0.8), (0.2, 0.8), (0.2, 0.2)]


class BuildingConversion(unittest.TestCase):
    def test_closed_way_and_no_tag(self):
        features, result = convert([way(1, SQUARE), way(2, SQUARE, "no")])
        self.assertEqual([f["id"] for f in features], ["way/1"])
        self.assertEqual(result["skipped"], [])

    def test_segments_in_arbitrary_order_and_direction(self):
        rings = stitch([[(0, 0), (1, 0)], [(0, 1), (1, 1)], [(0, 1), (0, 0)], [(1, 1), (1, 0)]])
        self.assertEqual(len(rings), 1)
        self.assertEqual(rings[0][0], rings[0][-1])
        self.assertEqual(set(rings[0]), set(SQUARE))

    def test_relation_preserves_hole_and_suppresses_member_duplicates(self):
        features, stats = convert([way(1, SQUARE), relation([member(1, SQUARE), member(2, INNER, "inner")])])
        self.assertEqual(len(features), 1)
        self.assertEqual(features[0]["id"], "relation/100")
        self.assertEqual(stats["innerRings"], 1)
        self.assertEqual(features[0]["inners"][0], INNER)

    def test_disjoint_outer_rings_remain_one_feature(self):
        other = [(x + 2, y) for x, y in SQUARE]
        features, _ = convert([relation([member(1, SQUARE), member(2, other)])])
        self.assertEqual(len(features), 1)
        self.assertEqual(len(features[0]["outers"]), 2)

    def test_broken_relation_is_reported_and_not_filled_as_way(self):
        broken = relation([member(1, SQUARE), member(2, INNER[:-1], "inner")])
        features, stats = convert([way(1, SQUARE), broken])
        self.assertEqual(features, [])
        self.assertEqual(stats["skipped"][0]["id"], "relation/100")

    def test_open_degenerate_and_non_finite_shapes_are_rejected(self):
        features, stats = convert([way(1, SQUARE[:-1]), way(2, [(0, 0), (1, 1), (2, 2), (0, 0)]), way(3, [(float("nan"), 0)] + SQUARE)])
        self.assertEqual(features, [])
        self.assertEqual(len(stats["skipped"]), 3)

    def test_ambiguous_connections_are_rejected(self):
        with self.assertRaises(ValueError):
            stitch([[(0, 0), (1, 0)], [(1, 0), (0, 1)], [(1, 0), (0, 2)]])

    def test_duplicate_osm_ids_are_not_counted_twice(self):
        features, _ = convert([way(1, SQUARE), way(1, SQUARE)])
        self.assertEqual(len(features), 1)

    def test_inner_ring_outside_outer_is_reported(self):
        outside = [(x + 2, y) for x, y in INNER]
        features, stats = convert([relation([member(1, SQUARE), member(2, outside, "inner")])])
        self.assertEqual(features, [])
        self.assertEqual(len(stats["skipped"]), 1)


if __name__ == "__main__":
    unittest.main()
