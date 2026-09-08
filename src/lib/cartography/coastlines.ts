import type { Vertex } from '$lib/geometry';
import type { EdgeTreatment } from './cartography_types';
import { hash01, toBipolar } from './edges';

const EPSILON = 1e-9;

function distance(a: Vertex, b: Vertex): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function interpolate(a: Vertex, b: Vertex, t: number): Vertex {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

/** A geometric origin and winding keep the noise independent of graph ids and traversal order. */
function canonicalLoop(points: Vertex[]): Vertex[] {
  const distinct = points.filter((p, i) => distance(p, points[(i + 1) % points.length]) > EPSILON);
  const corners = distinct.filter((p, i) => {
    const a = distinct[(i + distinct.length - 1) % distinct.length];
    const b = distinct[(i + 1) % distinct.length];
    const cross = (p.x - a.x) * (b.y - p.y) - (p.y - a.y) * (b.x - p.x);
    return Math.abs(cross) > EPSILON || (p.x - a.x) * (b.x - p.x) + (p.y - a.y) * (b.y - p.y) < 0;
  });
  if (corners.length < 3) return [];
  const area = corners.reduce((sum, a, i) => {
    const b = corners[(i + 1) % corners.length];
    return sum + a.x * b.y - b.x * a.y;
  }, 0);
  if (Math.abs(area) < EPSILON) return [];
  if (area < 0) corners.reverse();
  let first = 0;
  for (let i = 1; i < corners.length; i++) {
    if (
      corners[i].x < corners[first].x ||
      (corners[i].x === corners[first].x && corners[i].y < corners[first].y)
    )
      first = i;
  }
  return [...corners.slice(first), ...corners.slice(0, first)];
}

/** Closed polyline sampled at uniform arc length, with no repeated final point. */
function resampleLoop(points: Vertex[], spacing: number): Vertex[] {
  const lengths = points.map((p, i) => distance(p, points[(i + 1) % points.length]));
  const perimeter = lengths.reduce((sum, length) => sum + length, 0);
  const count = Math.max(3, Math.ceil(perimeter / spacing));
  const result: Vertex[] = [];
  let edge = 0;
  let start = 0;
  for (let i = 0; i < count; i++) {
    const target = (i * perimeter) / count;
    while (edge < points.length - 1 && start + lengths[edge] <= target) start += lengths[edge++];
    result.push(
      interpolate(
        points[edge],
        points[(edge + 1) % points.length],
        (target - start) / lengths[edge],
      ),
    );
  }
  return result;
}

function chaikinPass(points: Vertex[]): Vertex[] {
  return points.flatMap((a, i) => {
    const b = points[(i + 1) % points.length];
    return [interpolate(a, b, 0.25), interpolate(a, b, 0.75)];
  });
}

/** Periodic smooth noise: the closing edge gets the same character as the rest of the shore. */
function shorelineNoise(phase: number, stations: number, salt: number): number {
  const position = phase * stations;
  const index = Math.floor(position);
  const t = position - index;
  const eased = t * t * (3 - 2 * t);
  const a = toBipolar(hash01(index % stations, stations, salt));
  const b = toBipolar(hash01((index + 1) % stations, stations, salt));
  return a + (b - a) * eased;
}

function roughenLoop(points: Vertex[], scale: number, amplitude: number): Vertex[] {
  const perimeter = points.reduce(
    (sum, p, i) => sum + distance(p, points[(i + 1) % points.length]),
    0,
  );
  const broad = Math.max(3, Math.round(perimeter / (1.6 * scale)));
  const fine = Math.max(3, Math.round(perimeter / (0.5 * scale)));
  const salt = hash01(points[0].x / scale, points[0].y / scale, 231) * 100;
  return points.map((p, i) => {
    const a = points[(i + points.length - 1) % points.length];
    const b = points[(i + 1) % points.length];
    const length = distance(a, b);
    if (length < EPSILON) return { ...p };
    const phase = i / points.length;
    const offset =
      amplitude *
      (0.75 * shorelineNoise(phase, broad, salt) + 0.25 * shorelineNoise(phase, fine, salt + 1));
    return { x: p.x - ((b.y - a.y) / length) * offset, y: p.y + ((b.x - a.x) / length) * offset };
  });
}

/** Clip whole segments, rather than clamping vertices (which draws false diagonal coasts). */
function clipToCrop(points: Vertex[], width: number, height: number, padding: number): Vertex[] {
  let clipped = points;
  for (const [axis, limit, direction] of [
    ['x', -padding, 1],
    ['x', width + padding, -1],
    ['y', -padding, 1],
    ['y', height + padding, -1],
  ] as const) {
    const output: Vertex[] = [];
    for (let i = 0; i < clipped.length; i++) {
      const a = clipped[i];
      const b = clipped[(i + 1) % clipped.length];
      const aInside = (a[axis] - limit) * direction >= 0;
      const bInside = (b[axis] - limit) * direction >= 0;
      if (aInside) output.push(a);
      if (aInside !== bInside)
        output.push(interpolate(a, b, (limit - a[axis]) / (b[axis] - a[axis])));
    }
    clipped = output;
  }
  return canonicalLoop(clipped);
}

/** Water roughness is a proportion of the map, never of a source cell's chord length. */
export function createWaterEdgeTreatment(width: number, height: number): EdgeTreatment {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0)
    throw new RangeError('Water edges need positive finite map dimensions');
  const scale = Math.min(width, height) / 35;
  const amplitude = 0.22 * scale;
  const depth = 3;
  return {
    method: 'chaikin',
    amplitude,
    depth,
    displace(points) {
      // The viewport edge is a crop, not a shoreline. Move those closing runs outside the crop.
      const extended = canonicalLoop(points).map((p) => ({
        x:
          Math.abs(p.x) <= EPSILON
            ? -2 * scale
            : Math.abs(p.x - width) <= EPSILON
              ? width + 2 * scale
              : p.x,
        y:
          Math.abs(p.y) <= EPSILON
            ? -2 * scale
            : Math.abs(p.y - height) <= EPSILON
              ? height + 2 * scale
              : p.y,
      }));
      const cropped = clipToCrop(extended, width, height, 2 * scale);
      if (cropped.length < 3) return [];
      let smooth = resampleLoop(cropped, 0.85 * scale);
      for (let i = 0; i < depth; i++) smooth = chaikinPass(smooth);
      const sampled = resampleLoop(smooth, 0.15 * scale);
      return resampleLoop(roughenLoop(sampled, scale, amplitude), 0.3 * scale);
    },
  };
}
