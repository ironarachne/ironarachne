import { describe, expect, it } from 'vitest';
import { mountainRangeFixture } from '../../../scripts/region_mountain_range_fixture';
import {
  detectMountainRanges,
  mountainRangeGeometryError,
  mountainSegmentContained,
  mountainSpineLength,
} from './mountain_ranges';
import { buildRegionMapSvgString } from './region_map_svg';
import { mountainSaddle } from './mountain_range_artwork';
import type { PlacedMountainRangeGlyph } from './mountain_range_types';

const options = (map = mountainRangeFixture()) =>
  detectMountainRanges(map).map((range) => ({
    ...range,
    id: `range:mountain:${range.mapNodeIds[0]}`,
    name: 'The Ragged Range',
  }));

describe('mountain range geography', () => {
  it('recognizes an actual ridge, preserves its graph, and leaves an isolated peak outside membership', () => {
    const map = mountainRangeFixture();
    const before = structuredClone(map);
    const ranges = detectMountainRanges(map);
    expect(ranges).toHaveLength(1);
    expect(ranges[0].mapNodeIds).toHaveLength(14);
    expect(ranges[0].spineNodeIds).toHaveLength(14);
    expect(ranges[0].mapNodeIds).not.toContain(97);
    expect(mountainSpineLength(map, ranges[0].spineNodeIds)).toBe(26);
    expect(map).toEqual(before);
  });
  it('is independent of node, edge, and neighbor order and follows a curved ridge', () => {
    const map = mountainRangeFixture(true);
    const ranges = detectMountainRanges(map);
    expect(ranges).toHaveLength(1);
    const shuffled = structuredClone(map);
    shuffled.nodes.reverse().forEach((node) => {
      node.neighbors.reverse();
      node.edges.reverse();
    });
    shuffled.edges.reverse();
    expect(detectMountainRanges(shuffled)).toEqual(ranges);
  });
  it('does not bridge a lake or join disconnected peaks', () => {
    const map = mountainRangeFixture(true, true);
    for (const range of detectMountainRanges(map)) {
      expect(range.mapNodeIds.some((id) => map.nodes[id].isWater)).toBe(false);
      expect(mountainRangeGeometryError(map, range, true)).toBeNull();
    }
    map.nodes.forEach((node) => {
      if (node.elevation > 0 && node.id % 2) node.elevation = 0;
    });
    expect(detectMountainRanges(map)).toEqual([]);
  });
  it('rejects broad masses, short chains, and flat plateaus without two lower flanks', () => {
    const short = mountainRangeFixture();
    short.nodes.forEach((node) => {
      if (node.id % 20 > 6) node.elevation = 0;
    });
    expect(detectMountainRanges(short)).toEqual([]);
    const broad = mountainRangeFixture();
    broad.nodes.forEach((node) => {
      node.elevation =
        node.id % 20 >= 3 &&
        node.id % 20 <= 16 &&
        Math.floor(node.id / 20) >= 4 &&
        Math.floor(node.id / 20) <= 10
          ? 1
          : 0;
    });
    expect(detectMountainRanges(broad)).toEqual([]);
    const plateau = mountainRangeFixture();
    plateau.nodes
      .filter((node) => Math.floor(node.id / 20) === 6)
      .forEach((node) => {
        node.elevation = 1;
      });
    expect(detectMountainRanges(plateau)).toEqual([]);
  });
  it('rejects invalid geometry, duplicate membership, missing adjacency, and an invalid spine', () => {
    const map = mountainRangeFixture(),
      range = detectMountainRanges(map)[0];
    expect(
      mountainRangeGeometryError(map, {
        ...range,
        mapNodeIds: [...range.mapNodeIds, range.mapNodeIds[0]],
      }),
    ).toMatch(/distinct/);
    expect(
      mountainRangeGeometryError(map, { ...range, spineNodeIds: range.spineNodeIds.slice(0, 4) }),
    ).toMatch(/simple spine/);
    expect(
      mountainRangeGeometryError(map, {
        ...range,
        spineNodeIds: [...range.spineNodeIds.slice(0, -1), 0],
      }),
    ).toMatch(/membership/);
    const broken = structuredClone(map);
    broken.nodes[range.spineNodeIds[1]].neighbors = [];
    expect(mountainRangeGeometryError(broken, range)).toMatch(/disconnected|segment/);
    const invalid = structuredClone(map);
    invalid.nodes[range.mapNodeIds[0]].polygon.vertices = [];
    expect(detectMountainRanges(invalid)).toEqual([]);
    invalid.nodes[range.mapNodeIds[0]].elevation = NaN;
    expect(mountainRangeGeometryError(invalid, range)).toMatch(/invalid mountain/);
    expect(mountainSpineLength(map, [0, 999])).toBeNaN();
  });
  it('bounds independent ranges and rejects incomplete generated components', () => {
    const map = mountainRangeFixture();
    map.nodes.forEach((node) => {
      node.elevation =
        [3, 6, 9, 12].includes(Math.floor(node.id / 20)) && node.id % 20 >= 3 && node.id % 20 <= 16
          ? 1
          : 0;
    });
    const ranges = detectMountainRanges(map);
    expect(ranges).toHaveLength(3);
    expect(ranges.map((range) => range.mapNodeIds[0])).toEqual([63, 123, 183]);
    const incomplete = {
      mapNodeIds: ranges[0].mapNodeIds.slice(1),
      spineNodeIds: ranges[0].spineNodeIds.slice(1),
    };
    expect(mountainRangeGeometryError(map, incomplete, true)).toMatch(/omits part/);
    const unordered = { ...ranges[0], mapNodeIds: [...ranges[0].mapNodeIds].reverse() };
    expect(mountainRangeGeometryError(map, unordered, true)).toMatch(/stable order/);
  });

  it('checks full segments rather than sampling over tiny gaps', () => {
    const map = mountainRangeFixture();
    expect(
      mountainSegmentContained(
        { x: 7, y: 15 },
        { x: 33, y: 15 },
        map.nodes.filter((node) => node.id >= 143 && node.id <= 156),
      ),
    ).toBe(true);
    expect(
      mountainSegmentContained(
        { x: 7, y: 15 },
        { x: 33, y: 15 },
        map.nodes.filter((node) => node.id >= 143 && node.id <= 156 && node.id !== 150),
      ),
    ).toBe(false);
    expect(mountainSegmentContained({ x: -1, y: -1 }, { x: 0, y: 0 }, map.nodes)).toBe(false);
  });
});

describe('range vector rendering', () => {
  it('draws connected saddles, keeps isolated peaks, and repeats the same SVG', () => {
    const map = mountainRangeFixture();
    const before = structuredClone(map);
    const svg = buildRegionMapSvgString(map, { mountainRanges: options(map) });
    expect(svg).toContain('data-range-id="range:mountain:143"');
    expect(svg).toContain('data-range-saddle=');
    expect(svg).toContain('data-feature-kind="range"');
    expect(svg).toContain('The Ragged Range');
    expect(svg).toContain('mountain-high-');
    expect(svg).toBe(buildRegionMapSvgString(map, { mountainRanges: options(map) }));
    expect(map).toEqual(before);
    expect(buildRegionMapSvgString(map)).not.toContain('data-range-id=');
    expect(buildRegionMapSvgString(map, { mountainRanges: [] })).toBe(buildRegionMapSvgString(map));
  });
  it('skips malformed supplied ranges instead of inventing replacements', () => {
    const map = mountainRangeFixture();
    expect(
      buildRegionMapSvgString(map, {
        mountainRanges: [{ ...options(map)[0], spineNodeIds: [999] }],
      }),
    ).not.toContain('data-range-id=');
  });
  it('bounds saddle bodies and uses tapered filled ink without uniform SVG strokes', () => {
    const glyph = (x: number): PlacedMountainRangeGlyph => ({
      nodeId: 0,
      variantId: 'mountain-high-0',
      anchor: { x, y: 15 },
      scale: 0.6,
      rotationDegrees: 0,
      bounds: { minX: x - 1, maxX: x + 1, minY: 13, maxY: 15 },
      rangeId: 'range:mountain:143',
      position: x,
    });
    const saddle = mountainSaddle(glyph(10), glyph(11));
    expect(saddle.body).toMatch(/^M .* Z$/);
    expect(saddle.ink).toMatch(/^M /);
    expect(saddle.ink).not.toContain('NaN');
    expect(saddle.bounds.minY).toBeLessThan(15);
    expect(saddle.outline).toHaveLength(4);
  });
});
