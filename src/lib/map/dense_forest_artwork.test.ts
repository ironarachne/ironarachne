import { describe, expect, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import {
  denseForestCanopy,
  denseCanopyFitOutline,
  denseCanopyPoint,
  denseCanopyContainsPoint,
  connectedDenseCanopies,
  denseCanopyBrushInk,
  denseCanopyTrunks,
} from './dense_forest_artwork';
import type { PlacedDenseForestGlyph } from './dense_forest_types';

function glyph(x = 0, y = 0, forestId = 'forest'): PlacedDenseForestGlyph {
  return {
    forestId,
    nodeId: 0,
    variantId: 'canopy',
    anchor: { x, y },
    scale: 1,
    rotationDegrees: 0,
    bounds: { minX: x - 2, maxX: x + 2, minY: y - 2, maxY: y + 2 },
    interiorInk: false,
    canopy: denseForestCanopy(new RNG('cloud')),
  };
}

describe('forest cloud artwork', () => {
  it('uses reproducible rounded cubic lobes and reserves ground for separate trunks', () => {
    const canopy = denseForestCanopy(new RNG('cloud'));
    expect(denseForestCanopy(new RNG('cloud'))).toEqual(canopy);
    expect(denseForestCanopy(new RNG('other'))).not.toEqual(canopy);
    expect(canopy.body).toMatch(/^M .* C .* Z$/);
    expect(canopy.segments).toHaveLength(8);
    const outline = denseCanopyFitOutline(canopy);
    const points = canopy.segments.flatMap((s) => [s.start, s.control1, s.control2, s.end]);
    for (const point of points) {
      expect(point.x).toBeGreaterThan(outline[0].x);
      expect(point.x).toBeLessThan(outline[1].x);
      expect(point.y).toBeGreaterThan(outline[0].y);
      expect(point.y).toBeLessThan(outline[2].y);
    }
    expect(outline[2].y - canopy.radiusY).toBeGreaterThan(0.48);
  });
  it('resolves rotated canopy membership and padded scatter clearance in world coordinates', () => {
    const tree = { ...glyph(4, 5), rotationDegrees: 65, scale: 0.7 };
    expect(
      denseCanopyContainsPoint(
        tree,
        denseCanopyPoint(tree, { x: tree.canopy.radiusX * 0.7, y: 0 }),
      ),
    ).toBe(true);
    const outside = denseCanopyPoint(tree, { x: tree.canopy.radiusX * 1.15, y: 0 });
    expect(denseCanopyContainsPoint(tree, outside)).toBe(false);
    expect(denseCanopyContainsPoint(tree, outside, 0.3)).toBe(true);
  });
  it('keeps connected cloud banks and discards isolated trial lobes without joining different forests', () => {
    const bank = [glyph(), glyph(0.8), glyph(1.6)];
    const trials = [...bank, glyph(10), glyph(10.8), glyph(0.8, 0, 'other')];
    expect(connectedDenseCanopies(trials)).toEqual(bank);
    expect(connectedDenseCanopies([])).toEqual([]);
  });
  it('draws overlapping tapered exterior arcs and optional inner arcs instead of polygon edges', () => {
    const tree = glyph();
    expect(denseCanopyBrushInk(tree, [tree])).toMatch(/M .* Z/);
    const cover = { ...glyph(), scale: 10 };
    expect(denseCanopyBrushInk(tree, [tree, cover])).toBe('');
    expect(denseCanopyBrushInk({ ...tree, interiorInk: true }, [cover])).not.toBe('');
  });
  it('draws occasional paired trunk strokes only at exposed bases, within the reserved fit envelope', () => {
    const tree = glyph();
    expect(denseCanopyTrunks(tree, [tree, glyph(0, 1)], new RNG('trunks'))).toEqual([]);
    const samples = Array.from({ length: 20 }, (_, i) =>
      denseCanopyTrunks(tree, [tree], new RNG(`trunks-${i}`)),
    );
    expect(samples.some((strokes) => strokes.length === 0)).toBe(true);
    expect(samples.some((strokes) => strokes.length === 2)).toBe(true);
    for (const stroke of samples.flat()) {
      expect(stroke.peakWidth).toBeGreaterThan(0);
      expect(stroke.segments[0].end.y).toBeGreaterThan(tree.canopy.radiusY);
      expect(stroke.segments[0].end.y).toBeLessThan(denseCanopyFitOutline(tree.canopy)[2].y);
    }
  });
});
