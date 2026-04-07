import type { RegionMap, MapNode, MapEdge } from './map_graph.js';

export interface RoadConfig {
  waterPenalty: number;
  oceanPenalty: number;
  elevationPenalty: number;
  riverPenalty: number;
  roadDiscount: number;
}

const defaultConfig: RoadConfig = {
  waterPenalty: 10000,
  oceanPenalty: 100000,
  elevationPenalty: 80,
  riverPenalty: 25,
  roadDiscount: 0.2 // Cost is multiplied by this if road already exists
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

// A simple A* implementation for MapNodes
function findPath(map: RegionMap, startId: number, endId: number, config: RoadConfig): number[] | null {
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

  let expanded = 0;
  while (openSet.size > 0) {
    expanded++;

    // Get node with lowest fScore
    let currentId = -1;
    let lowestFScore = Infinity;

    for (const nodeId of openSet) {
      const score = fScore.get(nodeId) || Infinity;
      if (score < lowestFScore) {
        lowestFScore = score;
        currentId = nodeId;
      }
    }

    if (currentId === endId) {
      // Reconstruct path
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
      const neighbor = map.nodes[neighborId];

      // Calculate edge cost
      let cost = getDistance(current, neighbor);

      if (neighbor.isOcean) cost += config.oceanPenalty;
      else if (neighbor.isWater) cost += config.waterPenalty;

      cost += Math.abs(current.elevation - neighbor.elevation) * config.elevationPenalty * cost;

      const edge = findConnectingEdge(map, currentId, neighborId);
      if (edge) {
        if (edge.river > 0) {
          cost += config.riverPenalty;
        }
        if (edge.road !== undefined && edge.road > 0) {
          cost *= config.roadDiscount;
        }
      }

      const tentativeGScore = (gScore.has(currentId) ? gScore.get(currentId)! : Infinity) + cost;

      const neighborGScore = gScore.has(neighborId) ? gScore.get(neighborId)! : Infinity;

      if (tentativeGScore < neighborGScore) {
        cameFrom.set(neighborId, currentId);
        gScore.set(neighborId, tentativeGScore);
        fScore.set(neighborId, tentativeGScore + getDistance(neighbor, map.nodes[endId]));

        if (!openSet.has(neighborId)) {
          openSet.add(neighborId);
        }
      }
    }
  }

  console.log(`Path failed. Expanded ${expanded} nodes`);
  return null;
}

/**
 * Generates roads connecting the given town nodes.
 * Uses a Minimum Spanning Tree approximation by connecting each town to the MST built so far.
 *
 * @param {RegionMap} map The input MapGraph with elevation and water.
 * @param {number[]} townNodeIds The node IDs of towns to connect.
 * @param {RoadConfig} [config] Algorithm parameters.
 * @returns {RegionMap} A new RegionMap with populated road data on edges.
 */
export function generateRoads(map: RegionMap, townNodeIds: number[], config: RoadConfig = defaultConfig): RegionMap {
  console.log("Generating roads for towns:", townNodeIds);
  const newMap: RegionMap = structuredClone(map);

  if (townNodeIds.length < 2) return newMap;

  const connected = new Set<number>();
  const unconnected = new Set<number>(townNodeIds);

  // Start with the first town
  const startTown = townNodeIds[0];
  connected.add(startTown);
  unconnected.delete(startTown);

  while (unconnected.size > 0) {
    let bestPath: number[] | null = null;
    let bestUnconnected = -1;
    let shortestDist = Infinity;

    // Find the closest unconnected town to any connected town
    // To be efficient, we just find the closest straight-line distance and run A*
    let closestC = -1;
    let closestU = -1;

    for (const u of unconnected) {
      for (const c of connected) {
        const dist = getDistance(newMap.nodes[u], newMap.nodes[c]);
        // console.log("Checking distance between", u, "and", c, "->", dist);
        if (dist < shortestDist) {
          shortestDist = dist;
          closestU = u;
          closestC = c;
        }
      }
    }

    // Pathfind from closestC to closestU
    bestPath = findPath(newMap, closestC, closestU, config);
    console.log("Path between", closestC, "and", closestU, "is", bestPath?.length ? bestPath.length + " nodes" : "null");
    bestUnconnected = closestU;

    if (bestPath) {
      // Mark path as roads
      for (let i = 0; i < bestPath.length - 1; i++) {
        const edge = findConnectingEdge(newMap, bestPath[i], bestPath[i+1]);
        if (edge) {
          // Add road magnitude, multiple roads can stack on the same edge (main highways)
          edge.road = (edge.road || 0) + 1;
          // console.log("Added road to edge", edge.id);
        }
      }
    }

    // Mark as connected even if no path found to avoid infinite loops
    connected.add(bestUnconnected);
    unconnected.delete(bestUnconnected);
  }

  return newMap;
}
