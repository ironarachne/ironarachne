import type { Vertex } from '$lib/geometry';
import type { EdgeTreatment } from './cartography_types';

/** Deterministic [0, 1) — stable SVG output per edge geometry. */
export function hash01(a: number, b: number, c: number): number {
  const t = Math.sin(a * 12.9898 + b * 78.233 + c * 37.719) * 43758.5453123;
  return t - Math.floor(t);
}

/** Map u in [0,1) to [-1, 1]. */
export function toBipolar(u: number): number {
  return u * 2 - 1;
}

/** Extra points along a Voronoi boundary chord; Voronoi corners stay fixed — only these move. */
function interiorPointsAlongBoundaryChord(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  salt: number,
): Vertex[] {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len = Math.hypot(dx, dy);
  if (len < 1e-10) return [];

  const nx = -dy / len;
  const ny = dx / len;
  const count = Math.max(1, Math.min(4, Math.floor(len / 2.1)));
  const out: Vertex[] = [];

  for (let j = 1; j <= count; j++) {
    const t = j / (count + 1);
    const bx = x0 + dx * t;
    const by = y0 + dy * t;
    const h = hash01(salt, j * 2.718281828, t * 3.14159265);
    const ampScale = 0.012 + hash01(salt * 1.3, j, len) * 0.018;
    const off = toBipolar(h) * len * ampScale;
    out.push({ x: bx + nx * off, y: by + ny * off });
  }
  return out;
}

/** Preserve the existing boundary geometry; coastline smoothing belongs to issue #231. */
function displaceBoundary(points: Vertex[], cornerIds = points.map((_, i) => i)): Vertex[] {
  if (points.length < 3 || cornerIds.length !== points.length) return [];
  const result: Vertex[] = [{ ...points[0] }];
  for (let i = 0; i < points.length; i++) {
    const next = (i + 1) % points.length;
    const a = points[i];
    const b = points[next];
    const salt = cornerIds[i] * 49999 + cornerIds[next] * 1103515245 + i * 1009;
    result.push(...interiorPointsAlongBoundaryChord(a.x, a.y, b.x, b.y, salt));
  }
  return result;
}

/** One subdivision pass, with a maximum perpendicular offset of 3% of each chord. */
export const BOUNDARY_EDGES: EdgeTreatment = {
  method: 'midpointDisplacement',
  amplitude: 0.03,
  depth: 1,
  displace: displaceBoundary,
};
