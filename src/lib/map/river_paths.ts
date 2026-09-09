import { distancePointToSegmentSquared, type Vertex } from '$lib/geometry';
import type { MapEdge, RegionMap } from './map_graph';

import type { RiverReach } from './river_path_types';

export function atMapEdge(point: Vertex, map: RegionMap): boolean {
  return point.x <= 0 || point.y <= 0 || point.x >= map.width || point.y >= map.height;
}

/** Follow stored downslope links, retaining only reaches with a mapped downstream destination. */
export function connectedRiverReaches(map: RegionMap, outlets: ReadonlySet<number>): RiverReach[] {
  const directed = new Map<number, { edge: MapEdge; to: number }>();
  for (const edge of map.edges) {
    if (edge.river <= 0) continue;
    if (map.corners[edge.v0]?.downslope === edge.v1) directed.set(edge.v0, { edge, to: edge.v1 });
    else if (map.corners[edge.v1]?.downslope === edge.v0)
      directed.set(edge.v1, { edge, to: edge.v0 });
  }
  const connected = new Map<number, boolean>();
  const reachesOutlet = (start: number): boolean => {
    const visited = new Set<number>();
    let corner = start;
    while (!connected.has(corner) && !outlets.has(corner) && !visited.has(corner)) {
      visited.add(corner);
      const next = directed.get(corner);
      if (!next) break;
      corner = next.to;
    }
    const valid = outlets.has(corner) || connected.get(corner) === true;
    for (const id of visited) connected.set(id, valid);
    return valid;
  };
  const retained = [...directed].filter(([, { to }]) => reachesOutlet(to));
  const incoming = new Map<number, number>();
  for (const [, { edge, to }] of retained)
    incoming.set(to, Math.max(incoming.get(to) ?? 0, edge.river));
  return retained.map(([from, { edge, to }]) => ({
    edge,
    from,
    to,
    source: !incoming.has(from) && !outlets.has(from),
    startFlow: Math.max(edge.river, incoming.get(from) ?? 0),
    // A mouth corner has zero stored flow: use its incoming edge, not that zero.
    endFlow: Math.max(edge.river, directed.get(to)?.edge.river ?? 0),
  }));
}

/** Square-root scaling keeps the strongest rivers legible without overwhelming small maps. */
export function riverChannelWidth(flow: number, scale: number): number {
  return (0.09 + 0.09 * Math.sqrt(Math.max(1, flow))) * scale;
}

/** Sample a smooth centreline through the corner-edge knots; endpoints remain exact. */
export function sampleRiverCurve(knots: Vertex[]): Vertex[] {
  const points: Vertex[] = [];
  for (let i = 0; i < knots.length - 1; i++) {
    const a = knots[Math.max(0, i - 1)],
      b = knots[i];
    const c = knots[i + 1],
      d = knots[Math.min(knots.length - 1, i + 2)];
    const steps = Math.min(32, Math.max(3, Math.ceil(Math.hypot(c.x - b.x, c.y - b.y) / 0.15)));
    for (let step = 0; step < steps; step++) {
      const t = step / steps,
        t2 = t * t,
        t3 = t2 * t;
      const coordinate = (key: 'x' | 'y') =>
        0.5 *
        (2 * b[key] +
          (-a[key] + c[key]) * t +
          (2 * a[key] - 5 * b[key] + 4 * c[key] - d[key]) * t2 +
          (-a[key] + 3 * b[key] - 3 * c[key] + d[key]) * t3);
      points.push({ x: coordinate('x'), y: coordinate('y') });
    }
  }
  if (knots.length) points.push(knots[knots.length - 1]);
  return points;
}

/** Drop subpixel samples on each bank while retaining its source and join endpoints. */
function simplifyBank(points: Vertex[], tolerance: number): Vertex[] {
  const keep = new Set([0, points.length - 1]);
  const pending = [[0, points.length - 1]];
  while (pending.length) {
    const [first, last] = pending.pop()!;
    let farthest = -1,
      distance = tolerance * tolerance;
    for (let i = first + 1; i < last; i++) {
      const d = distancePointToSegmentSquared(points[i], points[first], points[last]);
      if (d > distance) {
        distance = d;
        farthest = i;
      }
    }
    if (farthest !== -1) {
      keep.add(farthest);
      pending.push([first, farthest], [farthest, last]);
    }
  }
  return points.filter((_, i) => keep.has(i));
}

/** Offset both banks. Only a true source tapers; joins and mouths keep their full channel width. */
export function riverRibbon(
  points: Vertex[],
  startWidth: number,
  endWidth: number,
  source: boolean,
  bank: number,
  scale: number,
): Vertex[] {
  if (points.length < 2) return [];
  const distances = [0];
  for (let i = 1; i < points.length; i++)
    distances.push(
      distances[i - 1] + Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y),
    );
  const length = distances[distances.length - 1];
  if (length < 1e-8) return [];
  const left: Vertex[] = [],
    right: Vertex[] = [];
  for (let i = 0; i < points.length; i++) {
    const a = points[Math.max(0, i - 1)],
      b = points[Math.min(points.length - 1, i + 1)];
    const dx = b.x - a.x,
      dy = b.y - a.y,
      norm = Math.hypot(dx, dy) || 1;
    const t = distances[i] / length;
    const taper = source ? Math.min(1, distances[i] / Math.min(length, 1.2 * scale)) : 1;
    const radius = ((startWidth + (endWidth - startWidth) * t) / 2 + bank) * taper;
    left.push({ x: points[i].x - (dy / norm) * radius, y: points[i].y + (dx / norm) * radius });
    right.push({ x: points[i].x + (dy / norm) * radius, y: points[i].y - (dx / norm) * radius });
  }
  return [...simplifyBank(left, 0.01 * scale), ...simplifyBank(right, 0.01 * scale).reverse()];
}
