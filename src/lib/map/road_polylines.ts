import { distancePointToSegmentSquared } from '../geometry/distance_point_to_segment.js';
import type Vertex from '../geometry/vertex.js';
import type { RegionMap } from './map_graph.js';

function undirectedPairKey(a: number, b: number): string {
  return a < b ? `${a}-${b}` : `${b}-${a}`;
}

/**
 * Chains road edges into polylines of **cell centers** (Voronoi sites). Matches how settlements
 * are placed and how pathfinding costs use centroid distance; roads are no longer drawn on
 * boundary corners only.
 */
export function buildRoadCentroidPolylines(map: RegionMap): Vertex[][] {
  const roadEdges = map.edges.filter((e) => e.road && e.road > 0 && e.d1 !== undefined);
  if (roadEdges.length === 0) return [];

  const adj = new Map<number, number[]>();
  const link = (a: number, b: number) => {
    if (!adj.has(a)) adj.set(a, []);
    const list = adj.get(a)!;
    if (!list.includes(b)) list.push(b);
  };
  for (const e of roadEdges) {
    link(e.d0, e.d1);
    link(e.d1, e.d0);
  }

  const usedEdges = new Set<string>();

  function extendForward(start: number, bannedPrev: number): number[] {
    const out: number[] = [start];
    let prev = bannedPrev;
    let at = start;
    while (true) {
      let nx = -1;
      for (const nb of adj.get(at) ?? []) {
        if (nb === prev) continue;
        const k = undirectedPairKey(at, nb);
        if (usedEdges.has(k)) continue;
        nx = nb;
        break;
      }
      if (nx < 0) break;
      usedEdges.add(undirectedPairKey(at, nx));
      out.push(nx);
      prev = at;
      at = nx;
    }
    return out;
  }

  const polylines: Vertex[][] = [];

  for (const e of roadEdges) {
    const k = undirectedPairKey(e.d0, e.d1);
    if (usedEdges.has(k)) continue;
    usedEdges.add(k);

    const left = extendForward(e.d0, e.d1);
    const right = extendForward(e.d1, e.d0);

    const nodeIds: number[] = [];
    if (left.length > 1) {
      for (let i = left.length - 1; i >= 1; i--) nodeIds.push(left[i]!);
    }
    nodeIds.push(e.d0, e.d1);
    if (right.length > 1) {
      for (let i = 1; i < right.length; i++) nodeIds.push(right[i]!);
    }

    const verts: Vertex[] = [];
    for (const nid of nodeIds) {
      const c = map.nodes[nid]?.center;
      if (c) verts.push({ x: c.x, y: c.y });
    }
    if (verts.length >= 2) polylines.push(verts);
  }

  return polylines;
}

/** Minimum squared distance from a point (map coords) to any segment of precomputed road polylines. */
export function minDistanceSquaredToRoadPolylines(
  polylines: Vertex[][],
  px: number,
  py: number,
): number {
  const p: Vertex = { x: px, y: py };
  let best = Infinity;
  for (const poly of polylines) {
    for (let i = 0; i < poly.length - 1; i++) {
      const d = distancePointToSegmentSquared(p, poly[i]!, poly[i + 1]!);
      if (d < best) best = d;
    }
  }
  return best;
}

/** Minimum squared distance from a point to any road segment (rebuilds polylines; prefer cached polylines in hot loops). */
export function minDistanceSquaredToRoads(map: RegionMap, px: number, py: number): number {
  return minDistanceSquaredToRoadPolylines(buildRoadCentroidPolylines(map), px, py);
}

/** Minimum squared distance from a point to any river edge segment. */
export function minDistanceSquaredToRivers(map: RegionMap, px: number, py: number): number {
  const p: Vertex = { x: px, y: py };
  let best = Infinity;
  for (const e of map.edges) {
    if (!e.river || e.river <= 0) continue;
    const a = map.corners[e.v0]?.point;
    const b = map.corners[e.v1]?.point;
    if (!a || !b) continue;
    const d = distancePointToSegmentSquared(p, a, b);
    if (d < best) best = d;
  }
  return best;
}
