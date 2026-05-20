import type { RegionMap, MapNode, MapEdge } from './map_graph.js';

export type RoadConfig = {
  /** Extra cost multiplier applied to step length when entering a mountain-class land cell (phase 1). */
  mountainPenalty: number;
  /** Softer mountain cost in phase 2 (multiplier × step length). */
  mountainPenaltySoft: number;
  /** Added cost when stepping into fresh water / lake cells. */
  waterPenalty: number;
  /** Softer water penalty (middle phases). */
  waterPenaltySoft: number;
  /** Added cost when stepping into ocean (only when ocean is allowed). */
  oceanPenalty: number;
  riverPenalty: number;
  roadDiscount: number;
  elevationPenalty: number;
};

const defaultConfig: RoadConfig = {
  mountainPenalty: 55,
  mountainPenaltySoft: 6,
  waterPenalty: 28000,
  waterPenaltySoft: 9000,
  oceanPenalty: 180000,
  riverPenalty: 22,
  roadDiscount: 0.22,
  elevationPenalty: 12,
};

function getDistance(a: MapNode, b: MapNode): number {
  const dx = a.center.x - b.center.x;
  const dy = a.center.y - b.center.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function findConnectingEdge(map: RegionMap, nodeA: number, nodeB: number): MapEdge | undefined {
  const nA = map.nodes[nodeA];
  for (const edgeId of nA.edges) {
    const edge = map.edges[edgeId];
    if ((edge.d0 === nodeA && edge.d1 === nodeB) || (edge.d0 === nodeB && edge.d1 === nodeA)) {
      return edge;
    }
  }
  return undefined;
}

function isMountainLandNode(node: MapNode): boolean {
  if (node.isOcean || node.isWater) return false;
  if (node.elevation > 0.82) return true;
  if (node.elevation > 0.58) return true;
  const b = node.biomeId?.toLowerCase() ?? '';
  return b.includes('mountain') || b.includes('alpine');
}

type PathfindMode =
  | 'terrain'
  | 'terrain_soft'
  | 'terrain_relax_water'
  | 'allow_ocean'
  | 'geometry_only';

function stepCost(
  map: RegionMap,
  fromId: number,
  toId: number,
  mode: PathfindMode,
  config: RoadConfig,
): number | null {
  const current = map.nodes[fromId];
  const neighbor = map.nodes[toId];
  if (!current || !neighbor) return null;

  if (mode !== 'allow_ocean' && mode !== 'geometry_only' && neighbor.isOcean) {
    return null;
  }

  if (mode === 'terrain' && neighbor.isWater && !neighbor.isOcean) {
    return null;
  }

  const edge = findConnectingEdge(map, fromId, toId);
  let c = getDistance(current, neighbor);

  if (mode === 'geometry_only') {
    if (edge && edge.road !== undefined && edge.road > 0) {
      c *= config.roadDiscount;
    }
    return c;
  }

  if (neighbor.isOcean) {
    c += config.oceanPenalty;
  } else if (neighbor.isWater) {
    c +=
      mode === 'terrain_relax_water' || mode === 'allow_ocean'
        ? config.waterPenaltySoft
        : config.waterPenalty;
  }

  const elevDelta = Math.abs(current.elevation - neighbor.elevation);
  c += elevDelta * config.elevationPenalty * c;

  if (isMountainLandNode(neighbor)) {
    let mult = 0;
    if (mode === 'terrain') mult = config.mountainPenalty;
    else if (mode === 'terrain_soft' || mode === 'terrain_relax_water')
      mult = config.mountainPenaltySoft;
    c += mult * c;
  }

  if (edge) {
    if (edge.river > 0) {
      c += config.riverPenalty;
    }
    if (edge.road !== undefined && edge.road > 0) {
      c *= config.roadDiscount;
    }
  }

  return c;
}

function findPathOneMode(
  map: RegionMap,
  startId: number,
  endId: number,
  mode: PathfindMode,
  config: RoadConfig,
): number[] | null {
  const openSet = new Set<number>([startId]);
  const cameFrom = new Map<number, number>();
  const gScore = new Map<number, number>();
  const fScore = new Map<number, number>();

  for (const node of map.nodes) {
    gScore.set(node.id, Infinity);
    fScore.set(node.id, Infinity);
  }

  gScore.set(startId, 0);
  fScore.set(startId, getDistance(map.nodes[startId], map.nodes[endId]));

  while (openSet.size > 0) {
    let currentId = -1;
    let lowestFScore = Infinity;
    for (const nodeId of openSet) {
      const score = fScore.get(nodeId) ?? Infinity;
      if (score < lowestFScore) {
        lowestFScore = score;
        currentId = nodeId;
      }
    }

    if (currentId === endId) {
      const path: number[] = [currentId];
      let curr = currentId;
      while (cameFrom.has(curr)) {
        curr = cameFrom.get(curr)!;
        path.unshift(curr);
      }
      return path;
    }

    openSet.delete(currentId);
    const current = map.nodes[currentId];

    for (const neighborId of current.neighbors) {
      const cost = stepCost(map, currentId, neighborId, mode, config);
      if (cost === null || !Number.isFinite(cost)) continue;

      const tentativeGScore = (gScore.get(currentId) ?? Infinity) + cost;
      const neighborGScore = gScore.get(neighborId) ?? Infinity;

      if (tentativeGScore < neighborGScore) {
        cameFrom.set(neighborId, currentId);
        gScore.set(neighborId, tentativeGScore);
        fScore.set(
          neighborId,
          tentativeGScore + getDistance(map.nodes[neighborId], map.nodes[endId]),
        );
        if (!openSet.has(neighborId)) {
          openSet.add(neighborId);
        }
      }
    }
  }

  return null;
}

const PATHFIND_SEQUENCE: PathfindMode[] = [
  'terrain',
  'terrain_soft',
  'terrain_relax_water',
  'allow_ocean',
  'geometry_only',
];

function pathTotalCost(
  map: RegionMap,
  path: number[],
  mode: PathfindMode,
  config: RoadConfig,
): number {
  let sum = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const c = stepCost(map, path[i]!, path[i + 1]!, mode, config);
    sum += c ?? 0;
  }
  return sum;
}

/** Cost under the same rules used to obtain the path (first mode that succeeded). */
function findPathWithCost(
  map: RegionMap,
  startId: number,
  endId: number,
  config: RoadConfig,
): { path: number[]; mode: PathfindMode } | null {
  for (const mode of PATHFIND_SEQUENCE) {
    const path = findPathOneMode(map, startId, endId, mode, config);
    if (path) return { path, mode };
  }
  return null;
}

/**
 * Connects all given town nodes with roads using Prim's algorithm on the complete graph
 * of towns, where edge weight is shortest-path cost under terrain-aware routing (with fallbacks).
 * Step costs use **cell centers** (Voronoi sites); `MapEdge.road` marks dual edges, and SVG/ASCII
 * draw roads through `buildRoadCentroidPolylines` so lines meet settlements at centroids.
 */
export function generateRoads(
  map: RegionMap,
  townNodeIds: number[],
  config: RoadConfig = defaultConfig,
): RegionMap {
  const newMap: RegionMap = structuredClone(map);

  const uniqueSorted = [...new Set(townNodeIds)]
    .filter((id) => id >= 0 && id < newMap.nodes.length && newMap.nodes[id])
    .sort((a, b) => a - b);

  if (uniqueSorted.length < 2) {
    return newMap;
  }

  const inMst = new Set<number>([uniqueSorted[0]!]);
  const outside = new Set(uniqueSorted.slice(1));

  while (outside.size > 0) {
    let best: { path: number[]; mode: PathfindMode; newTown: number } | null = null;
    let bestKey = Infinity;

    for (const t of outside) {
      for (const s of inMst) {
        const got = findPathWithCost(newMap, s, t, config);
        if (!got) continue;
        const cost = pathTotalCost(newMap, got.path, got.mode, config);
        if (cost < bestKey) {
          bestKey = cost;
          best = { path: got.path, mode: got.mode, newTown: t };
        }
      }
    }

    if (!best) {
      break;
    }

    for (let i = 0; i < best.path.length - 1; i++) {
      const edge = findConnectingEdge(newMap, best.path[i]!, best.path[i + 1]!);
      if (edge) {
        edge.road = (edge.road || 0) + 1;
      }
    }

    inMst.add(best.newTown);
    outside.delete(best.newTown);
  }

  return newMap;
}

export function getDefaultRoadConfig(): RoadConfig {
  return { ...defaultConfig };
}
