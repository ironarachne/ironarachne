import type { RNG } from '@ironarachne/rng';
import type { Vertex } from '$lib/geometry';
import type { CubicInkSegment, GlyphInkStroke } from './terrain_glyph_types';
import type { DenseForestCanopy, PlacedDenseForestGlyph } from './dense_forest_types';
import { inkStrokePath } from './terrain_glyph_ink';

const coordinate = (p: Vertex) => `${p.x.toFixed(3)} ${p.y.toFixed(3)}`;

/** Wide, rounded lobes overlap into a cloud bank; no cell boundary is part of this artwork. */
export function denseForestCanopy(rng: RNG): DenseForestCanopy {
  const radiusX = rng.float(0.9, 1.1),
    radiusY = rng.float(0.65, 0.82);
  const count = 8,
    angle = (Math.PI * 2) / count,
    k = (4 / 3) * Math.tan(angle / 4);
  const points = Array.from({ length: count }, (_, i) => ({
    x: Math.cos(i * angle) * radiusX,
    y: Math.sin(i * angle) * radiusY,
  }));
  const segments = points.map((start, i): CubicInkSegment => {
    const a = i * angle,
      b = (i + 1) * angle;
    return {
      start,
      end: points[(i + 1) % count],
      control1: { x: start.x - Math.sin(a) * radiusX * k, y: start.y + Math.cos(a) * radiusY * k },
      control2: {
        x: points[(i + 1) % count].x + Math.sin(b) * radiusX * k,
        y: points[(i + 1) % count].y - Math.cos(b) * radiusY * k,
      },
    };
  });
  return {
    radiusX,
    radiusY,
    segments,
    body: `M ${coordinate(points[0])} ${segments.map((s) => `C ${coordinate(s.control1)} ${coordinate(s.control2)} ${coordinate(s.end)}`).join(' ')} Z`,
  };
}

/** Conservative fit envelope includes the control hull and the thickest brush stroke. */
export function denseCanopyFitOutline(canopy: DenseForestCanopy): Vertex[] {
  const x = canopy.radiusX + 0.06,
    top = canopy.radiusY + 0.06,
    bottom = canopy.radiusY + 0.55;
  return [
    { x: -x, y: -top },
    { x, y: -top },
    { x, y: bottom },
    { x: -x, y: bottom },
  ];
}

export function denseCanopyPoint(glyph: PlacedDenseForestGlyph, point: Vertex): Vertex {
  const angle = (glyph.rotationDegrees * Math.PI) / 180;
  return {
    x: glyph.anchor.x + glyph.scale * (point.x * Math.cos(angle) - point.y * Math.sin(angle)),
    y: glyph.anchor.y + glyph.scale * (point.x * Math.sin(angle) + point.y * Math.cos(angle)),
  };
}

function covered(
  point: Vertex,
  glyph: PlacedDenseForestGlyph,
  all: PlacedDenseForestGlyph[],
): boolean {
  return all.some((other) => {
    if (other === glyph) return false;
    return denseCanopyContainsPoint(other, point);
  });
}

export function denseCanopyContainsPoint(
  glyph: PlacedDenseForestGlyph,
  point: Vertex,
  padding = 0,
): boolean {
  const angle = (-glyph.rotationDegrees * Math.PI) / 180;
  const dx = (point.x - glyph.anchor.x) / glyph.scale,
    dy = (point.y - glyph.anchor.y) / glyph.scale;
  const x = dx * Math.cos(angle) - dy * Math.sin(angle),
    y = dx * Math.sin(angle) + dy * Math.cos(angle);
  return (
    (x / (glyph.canopy.radiusX + padding / glyph.scale)) ** 2 +
      (y / (glyph.canopy.radiusY + padding / glyph.scale)) ** 2 <
    0.98
  );
}

/** A dense mass needs several overlapping crowns; isolated trial lobes stay ordinary woodland. */
export function connectedDenseCanopies(glyphs: PlacedDenseForestGlyph[]): PlacedDenseForestGlyph[] {
  const remaining = new Set(glyphs);
  const result: PlacedDenseForestGlyph[] = [];
  for (const glyph of glyphs) {
    if (!remaining.delete(glyph)) continue;
    const group = [glyph];
    for (let i = 0; i < group.length; i++) {
      const current = group[i];
      for (const other of remaining) {
        if (current.forestId !== other.forestId) continue;
        const x = current.scale * current.canopy.radiusX + other.scale * other.canopy.radiusX;
        const y = current.scale * current.canopy.radiusY + other.scale * other.canopy.radiusY;
        if (
          ((current.anchor.x - other.anchor.x) / x) ** 2 +
            ((current.anchor.y - other.anchor.y) / y) ** 2 >=
          0.95
        )
          continue;
        remaining.delete(other);
        group.push(other);
      }
    }
    if (group.length >= 3) result.push(...group);
  }
  return result;
}

/** Tapered overlapping arcs draw the exposed cloud edge; occasional interior arcs show layering. */
export function denseCanopyBrushInk(
  glyph: PlacedDenseForestGlyph,
  all: PlacedDenseForestGlyph[],
): string {
  const parts: string[] = [];
  const segments = glyph.canopy.segments;
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    const midpoint = {
      x: (segment.start.x + segment.end.x) / 2,
      y: (segment.start.y + segment.end.y) / 2,
    };
    if (covered(denseCanopyPoint(glyph, midpoint), glyph, all)) continue;
    // Extend into the next arc so neighboring brush strokes overlap at the joins.
    parts.push(
      inkStrokePath({
        segments: [segment, segments[(i + 1) % segments.length]],
        peakWidth: 0.075,
        taperPower: 0.8,
      }),
    );
  }
  if (glyph.interiorInk)
    parts.push(
      inkStrokePath({ segments: segments.slice(4, 7), peakWidth: 0.045, taperPower: 0.8 }),
    );
  return parts.join(' ');
}

/** Separate paired brush strokes below exposed lower canopies, painted before the opaque crowns. */
export function denseCanopyTrunks(
  glyph: PlacedDenseForestGlyph,
  all: PlacedDenseForestGlyph[],
  rng: RNG,
): GlyphInkStroke[] {
  const y = glyph.canopy.radiusY;
  if (covered(denseCanopyPoint(glyph, { x: 0, y: y + 0.12 }), glyph, all) || rng.float(0, 1) >= 0.3)
    return [];
  const lean = rng.float(-0.12, 0.12);
  return [-0.07, 0.07].map((x) => ({
    peakWidth: 0.055,
    taperPower: 0.8,
    segments: [
      {
        start: { x, y: y - 0.18 },
        control1: { x: x - lean * 0.3, y: y + 0.02 },
        control2: { x: x + lean * 0.6, y: y + 0.34 },
        end: { x: x + lean, y: y + 0.48 },
      },
    ],
  }));
}
