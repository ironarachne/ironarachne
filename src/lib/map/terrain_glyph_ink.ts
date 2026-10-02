import type { Vertex } from '$lib/geometry';
import type { CubicInkSegment, GlyphInkStroke } from './terrain_glyph_types';

const MAX_SAMPLE_STEP = 0.02;
const SIMPLIFICATION_ERROR = 0.001;

const distance = (a: Vertex, b: Vertex): number => Math.hypot(a.x - b.x, a.y - b.y);

/** A cubic is bounded by its control polygon, including its maximum possible arc length. */
function sampleSegment(segment: CubicInkSegment): Vertex[] {
  const { start: a, control1: b, control2: c, end: d } = segment;
  const length = distance(a, b) + distance(b, c) + distance(c, d);
  if (length < 1e-9) return [];
  const steps = Math.max(2, Math.ceil(length / MAX_SAMPLE_STEP));
  return Array.from({ length: steps + 1 }, (_, index) => {
    const t = index / steps;
    const u = 1 - t;
    return {
      x: u ** 3 * a.x + 3 * u ** 2 * t * b.x + 3 * u * t ** 2 * c.x + t ** 3 * d.x,
      y: u ** 3 * a.y + 3 * u ** 2 * t * b.y + 3 * u * t ** 2 * c.y + t ** 3 * d.y,
    };
  });
}

function simplify(points: Vertex[]): Vertex[] {
  if (points.length < 3) return points;
  const a = points[0];
  const b = points[points.length - 1];
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSquared = dx * dx + dy * dy;
  let maximum = SIMPLIFICATION_ERROR;
  let split = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const p = points[i];
    const t =
      lengthSquared === 0
        ? 0
        : Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / lengthSquared));
    const error = distance(p, { x: a.x + dx * t, y: a.y + dy * t });
    if (error > maximum) {
      maximum = error;
      split = i;
    }
  }
  return split === 0
    ? [a, b]
    : [...simplify(points.slice(0, split + 1)).slice(0, -1), ...simplify(points.slice(split))];
}

/** Filled ribbon with exact zero-width endpoints and taper across the entire continuous curve. */
export function expandInkStroke(stroke: GlyphInkStroke): Vertex[] {
  if (!(stroke.peakWidth > 0) || !(stroke.taperPower > 0)) return [];
  const points: Vertex[] = [];
  for (const segment of stroke.segments) {
    for (const point of sampleSegment(segment)) {
      if (points.length === 0 || distance(points[points.length - 1], point) > 1e-9)
        points.push(point);
    }
  }
  if (points.length < 2) return [];
  const lengths = [0];
  for (let i = 1; i < points.length; i++)
    lengths.push(lengths[i - 1] + distance(points[i - 1], points[i]));
  const total = lengths[lengths.length - 1];
  const left: Vertex[] = [];
  const right: Vertex[] = [];
  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    const a = points[Math.max(0, i - 1)];
    const b = points[Math.min(points.length - 1, i + 1)];
    let dx = b.x - a.x;
    let dy = b.y - a.y;
    // A reversing tangent can cancel; use an adjacent nondegenerate leg instead.
    if (Math.hypot(dx, dy) < 1e-9) {
      dx = point.x - a.x;
      dy = point.y - a.y;
    }
    const length = Math.hypot(dx, dy) || 1;
    const halfWidth =
      i === 0 || i === points.length - 1
        ? 0
        : (stroke.peakWidth / 2) *
          Math.max(0, Math.sin((Math.PI * lengths[i]) / total)) ** stroke.taperPower;
    left.push({ x: point.x - (dy / length) * halfWidth, y: point.y + (dx / length) * halfWidth });
    right.push({ x: point.x + (dy / length) * halfWidth, y: point.y - (dx / length) * halfWidth });
  }
  return [...simplify(left), ...simplify(right).reverse()];
}

export function inkStrokePath(stroke: GlyphInkStroke): string {
  const outline = expandInkStroke(stroke);
  return outline.length === 0
    ? ''
    : `M ${outline.map((p) => `${Number(p.x.toFixed(3))} ${Number(p.y.toFixed(3))}`).join(' L ')} Z`;
}
