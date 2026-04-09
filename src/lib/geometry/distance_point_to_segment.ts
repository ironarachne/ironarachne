import type Vertex from './vertex.js';

/** Squared distance from p to the closed segment ab (map units). */
export function distancePointToSegmentSquared(p: Vertex, a: Vertex, b: Vertex): number {
  const abx = b.x - a.x;
  const aby = b.y - a.y;
  const apx = p.x - a.x;
  const apy = p.y - a.y;
  const abLenSq = abx * abx + aby * aby;
  if (abLenSq < 1e-20) {
    return apx * apx + apy * apy;
  }
  let t = (apx * abx + apy * aby) / abLenSq;
  t = Math.max(0, Math.min(1, t));
  const qx = a.x + t * abx;
  const qy = a.y + t * aby;
  const dx = p.x - qx;
  const dy = p.y - qy;
  return dx * dx + dy * dy;
}
