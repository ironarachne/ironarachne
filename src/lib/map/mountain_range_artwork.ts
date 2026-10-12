import type { Vertex } from '$lib/geometry';
import { expandInkStroke, inkStrokePath } from './terrain_glyph_ink';
import type { GlyphInkStroke } from './terrain_glyph_types';
import type { PlacedMountainRangeGlyph } from './mountain_range_types';

const coordinate = (p: Vertex) => `${Number(p.x.toFixed(3))} ${Number(p.y.toFixed(3))}`;

/** A low shared shoulder between adjacent peaks, with tapered ridge and flank ink. */
export function mountainSaddle(
  a: PlacedMountainRangeGlyph,
  b: PlacedMountainRangeGlyph,
): NonNullable<PlacedMountainRangeGlyph['saddle']> {
  const scale = Math.min(a.scale, b.scale);
  const start = { x: a.anchor.x, y: a.anchor.y - a.scale * 0.95 };
  const end = { x: b.anchor.x, y: b.anchor.y - b.scale * 0.95 };
  const dip = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 + scale * 0.38 };
  const control1 = { x: start.x + (dip.x - start.x) * 0.9, y: dip.y };
  const control2 = { x: end.x + (dip.x - end.x) * 0.9, y: dip.y };
  const ridge: GlyphInkStroke = {
    peakWidth: scale * 0.06,
    taperPower: 0.65,
    segments: [{ start, control1, control2, end }],
  };
  const hatch: GlyphInkStroke = {
    peakWidth: scale * 0.022,
    taperPower: 0.75,
    segments: [
      {
        start: { x: dip.x - scale * 0.12, y: dip.y },
        control1: { x: dip.x, y: dip.y + scale * 0.08 },
        control2: { x: dip.x + scale * 0.15, y: dip.y + scale * 0.3 },
        end: { x: dip.x + scale * 0.28, y: dip.y + scale * 0.42 },
      },
    ],
  };
  const body = `M ${coordinate(start)} C ${coordinate(control1)} ${coordinate(control2)} ${coordinate(end)} L ${coordinate(b.anchor)} L ${coordinate(a.anchor)} Z`;
  // Control hull plus ribbon padding conservatively contains the full cubic, hatch, and body.
  const points = [
    start,
    control1,
    control2,
    end,
    a.anchor,
    b.anchor,
    ...expandInkStroke(ridge),
    ...expandInkStroke(hatch),
  ];
  const minX = Math.min(...points.map((p) => p.x)) - 0.005,
    maxX = Math.max(...points.map((p) => p.x)) + 0.005;
  const minY = Math.min(...points.map((p) => p.y)) - 0.005,
    maxY = Math.max(...points.map((p) => p.y)) + 0.005;
  const outline = [
    { x: minX, y: minY },
    { x: maxX, y: minY },
    { x: maxX, y: maxY },
    { x: minX, y: maxY },
  ];
  return {
    body,
    ink: [ridge, hatch].map(inkStrokePath).join(' '),
    outline,
    bounds: { minX, maxX, minY, maxY },
  };
}
