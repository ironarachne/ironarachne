import { distancePointToSegmentSquared, type Vertex } from '$lib/geometry';
import type { RegionMap } from './map_graph';
import type { RiverChannelReach, RiverNetwork } from './river_network_types';

export function riverTolerance(map: RegionMap): number {
  return Math.max(map.width, map.height) * 1e-7;
}

export function pointInRiverPolygon(point: Vertex, outline: Vertex[], tolerance = 1e-8): boolean {
  let inside = false;
  for (let i = 0; i < outline.length; i++) {
    const a = outline[i],
      b = outline[(i + 1) % outline.length];
    if (distancePointToSegmentSquared(point, a, b) <= tolerance * tolerance) return true;
    if (
      a.y > point.y !== b.y > point.y &&
      point.x < a.x + ((point.y - a.y) * (b.x - a.x)) / (b.y - a.y)
    )
      inside = !inside;
  }
  return inside;
}

/** A proper intersection, excluding coincident endpoints and collinear bank segments. */
export function riverSegmentIntersection(
  a: Vertex,
  b: Vertex,
  c: Vertex,
  d: Vertex,
): Vertex | null {
  const dx = b.x - a.x,
    dy = b.y - a.y,
    ex = d.x - c.x,
    ey = d.y - c.y;
  const denominator = dx * ey - dy * ex;
  if (Math.abs(denominator) < 1e-12) return null;
  const t = ((c.x - a.x) * ey - (c.y - a.y) * ex) / denominator;
  const u = ((c.x - a.x) * dy - (c.y - a.y) * dx) / denominator;
  return t > 1e-8 && t < 1 - 1e-8 && u > 1e-8 && u < 1 - 1e-8
    ? { x: a.x + t * dx, y: a.y + t * dy }
    : null;
}

export function riverPolygonArea(points: Vertex[]): number {
  return (
    Math.abs(
      points.reduce((sum, a, i) => {
        const b = points[(i + 1) % points.length];
        return sum + a.x * b.y - b.x * a.y;
      }, 0),
    ) / 2
  );
}

export function simpleRiverPolygon(points: Vertex[]): boolean {
  if (points.length < 3 || riverPolygonArea(points) < 1e-12) return false;
  if (
    points.some(
      (p, i) =>
        Math.hypot(
          p.x - points[(i + 1) % points.length].x,
          p.y - points[(i + 1) % points.length].y,
        ) < 1e-10,
    )
  )
    return false;
  for (let i = 0; i < points.length; i++)
    for (let j = i + 2; j < points.length; j++) {
      if (i === 0 && j === points.length - 1) continue;
      if (
        riverSegmentIntersection(
          points[i],
          points[(i + 1) % points.length],
          points[j],
          points[(j + 1) % points.length],
        )
      )
        return false;
      if (
        Math.min(
          distancePointToSegmentSquared(points[i], points[j], points[(j + 1) % points.length]),
          distancePointToSegmentSquared(points[j], points[i], points[(i + 1) % points.length]),
        ) < 1e-20
      )
        return false;
    }
  return true;
}

/** Version 1 uses linear samples, averaged segment normals and bounded miters. */
export function riverEnvelope(reach: RiverChannelReach, bank = 0): Vertex[] {
  const left: Vertex[] = [],
    right: Vertex[] = [];
  const samples = reach.samples;
  for (let i = 0; i < samples.length; i++) {
    const point = samples[i].point;
    const normal = (a: Vertex, b: Vertex) => {
      const length = Math.hypot(b.x - a.x, b.y - a.y) || 1;
      return { x: -(b.y - a.y) / length, y: (b.x - a.x) / length };
    };
    const before = normal(samples[Math.max(0, i - 1)].point, point);
    const after = normal(point, samples[Math.min(samples.length - 1, i + 1)].point);
    const nx = before.x + after.x,
      ny = before.y + after.y;
    const length = Math.hypot(nx, ny) || 1;
    const dot = Math.abs(
      (nx * (i === 0 ? after.x : before.x) + ny * (i === 0 ? after.y : before.y)) / length,
    );
    const radius =
      (samples[i].waterWidth / 2 + (samples[i].waterWidth === 0 ? 0 : bank)) / Math.max(0.5, dot);
    left.push({ x: point.x + (nx / length) * radius, y: point.y + (ny / length) * radius });
    right.push({ x: point.x - (nx / length) * radius, y: point.y - (ny / length) * radius });
  }
  const outline = [...left, ...right.reverse()];
  const simplified = outline.filter(
    (point, i) =>
      i === 0 || Math.hypot(point.x - outline[i - 1].x, point.y - outline[i - 1].y) > 1e-10,
  );
  if (
    simplified.length > 1 &&
    Math.hypot(simplified[0].x - simplified.at(-1)!.x, simplified[0].y - simplified.at(-1)!.y) <
      1e-10
  )
    simplified.pop();
  return simplified;
}

export function closestRiverPoint(p: Vertex, a: Vertex, b: Vertex): Vertex {
  const dx = b.x - a.x,
    dy = b.y - a.y;
  const t = Math.max(
    0,
    Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy || 1)),
  );
  return { x: a.x + t * dx, y: a.y + t * dy };
}

export function riverPolygonsOverlap(a: Vertex[], b: Vertex[]): boolean {
  return (
    a.some((p) => pointInRiverPolygon(p, b)) ||
    b.some((p) => pointInRiverPolygon(p, a)) ||
    a.some((p, i) =>
      b.some(
        (q, j) =>
          riverSegmentIntersection(p, a[(i + 1) % a.length], q, b[(j + 1) % b.length]) !== null,
      ),
    )
  );
}

export function incomingRiverReaches(
  network: RiverNetwork,
  junctionId: string,
): RiverChannelReach[] {
  return network.reaches.filter((reach) => reach.toJunctionId === junctionId);
}
export function outgoingRiverReaches(
  network: RiverNetwork,
  junctionId: string,
): RiverChannelReach[] {
  return network.reaches.filter((reach) => reach.fromJunctionId === junctionId);
}
export function riverOutlets(network: RiverNetwork, junctionId: string): string[] {
  const visited = new Set<string>(),
    outlets = new Set<string>(),
    pending = [junctionId];
  const junctions = new Map(network.junctions.map((junction) => [junction.id, junction]));
  const outgoing = new Map(
    network.junctions.map((junction) => [junction.id, outgoingRiverReaches(network, junction.id)]),
  );
  while (pending.length) {
    const id = pending.pop()!;
    if (visited.has(id)) continue;
    visited.add(id);
    if (junctions.get(id)?.role.kind === 'outlet') outlets.add(id);
    for (const reach of outgoing.get(id) ?? []) pending.push(reach.toJunctionId);
  }
  return [...outlets].sort();
}
export function isRiverWaterAt(network: RiverNetwork, point: Vertex): boolean {
  return network.reaches.some(
    (reach) =>
      pointInRiverPolygon(point, riverEnvelope(reach)) &&
      !network.islands.some(
        (island) => island.reachId === reach.id && pointInRiverPolygon(point, island.outline),
      ),
  );
}

/** Interpolate the cell's centre/corner triangle fan, including exact drainage-edge elevations. */
export function riverTerrainElevation(
  map: RegionMap,
  nodeIds: number[],
  point: Vertex,
): number | null {
  for (const id of nodeIds) {
    const node = map.nodes[id];
    if (!node || !pointInRiverPolygon(point, node.polygon.vertices, riverTolerance(map))) continue;
    // Clipped/merged cells can have overlapping fans; shared-edge elevation takes precedence.
    for (let i = 0; i < node.corners.length; i++) {
      const a = map.corners[node.corners[i]],
        b = map.corners[node.corners[(i + 1) % node.corners.length]];
      if (distancePointToSegmentSquared(point, a.point, b.point) <= riverTolerance(map) ** 2) {
        const q = closestRiverPoint(point, a.point, b.point);
        const length = Math.hypot(b.point.x - a.point.x, b.point.y - a.point.y);
        const t = length > 0 ? Math.hypot(q.x - a.point.x, q.y - a.point.y) / length : 0;
        return a.elevation + (b.elevation - a.elevation) * t;
      }
    }
    for (let i = 0; i < node.corners.length; i++) {
      const a = map.corners[node.corners[i]],
        b = map.corners[node.corners[(i + 1) % node.corners.length]];
      const c = node.center;
      const den = (b.point.y - c.y) * (a.point.x - c.x) + (c.x - b.point.x) * (a.point.y - c.y);
      if (Math.abs(den) < 1e-12) continue;
      const u = ((b.point.y - c.y) * (point.x - c.x) + (c.x - b.point.x) * (point.y - c.y)) / den;
      const v = ((c.y - a.point.y) * (point.x - c.x) + (a.point.x - c.x) * (point.y - c.y)) / den;
      if (u >= -1e-6 && v >= -1e-6 && u + v <= 1 + 1e-6)
        return u * a.elevation + v * b.elevation + (1 - u - v) * node.elevation;
    }
  }
  return null;
}
