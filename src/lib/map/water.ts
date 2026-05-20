import type { RegionMap, MapNode, MapCorner, MapEdge } from './map_graph.js';
import type { RNG } from '@ironarachne/rng';

export interface WaterConfig {
  seaLevel: number;
  springCountPercentage: number;
  rng: RNG;
}

/**
 * Simulates downhill water flow from springs to calculate rivers and lakes.
 * Identifies oceans and coasts based on an elevation threshold.
 *
 * @param {RegionMap} map The input MapGraph with elevation already calculated.
 * @param {WaterConfig} config Algorithm parameters.
 * @returns {RegionMap} A new RegionMap with populated water data.
 */
export function simulateWater(map: RegionMap, config: WaterConfig): RegionMap {
  // Deep clone
  const newMap: RegionMap = structuredClone(map);
  const { seaLevel, springCountPercentage, rng } = config;

  // 1. Identify Ocean corners
  for (const corner of newMap.corners) {
    if (corner.elevation < seaLevel) {
      corner.isOcean = true;
      corner.isWater = true;
    }
  }

  // Identify Ocean nodes
  for (const node of newMap.nodes) {
    let waterCorners = 0;
    for (const cid of node.corners) {
      if (newMap.corners[cid].isWater) waterCorners++;
    }

    // If the majority of corners are water, the node is water/ocean
    if (node.elevation < seaLevel || waterCorners >= node.corners.length / 2) {
      node.isOcean = true;
      node.isWater = true;
    }
  }

  // 2. Identify Coasts (Land nodes bordering Ocean nodes)
  for (const node of newMap.nodes) {
    if (node.isOcean) continue;

    // Check neighbors
    for (const neighborId of node.neighbors) {
      const neighbor = newMap.nodes[neighborId];
      if (neighbor.isOcean) {
        node.isCoast = true;
        break;
      }
    }
  }

  // Set coast for corners
  for (const corner of newMap.corners) {
    if (corner.isOcean) continue;
    let touchesOcean = false;
    let touchesLand = false;

    for (const nodeId of corner.touches) {
      const node = newMap.nodes[nodeId];
      if (node.isOcean) touchesOcean = true;
      else touchesLand = true;
    }

    if (touchesOcean && touchesLand) {
      corner.isCoast = true;
    }
  }

  // 3. Compute Downslopes
  for (const corner of newMap.corners) {
    let lowestNeighbor: number | undefined = undefined;
    let minElevation = corner.elevation;

    for (const adjId of corner.adjacent) {
      const adjCorner = newMap.corners[adjId];
      if (adjCorner.elevation < minElevation) {
        minElevation = adjCorner.elevation;
        lowestNeighbor = adjId;
      }
    }
    corner.downslope = lowestNeighbor;
  }

  // 4. Generate Rivers using Downslopes
  const landCorners = newMap.corners.filter((c) => !c.isOcean);
  const riverCount = Math.floor(landCorners.length * springCountPercentage);

  if (landCorners.length > 0) {
    for (let i = 0; i < riverCount; i++) {
      // Pick random land corner as spring
      const spring = landCorners[rng.int(0, landCorners.length - 1)];
      // Spring must be sufficiently high above sea level relative to map scale
      if (spring.elevation < seaLevel + 0.1) continue;

      let current: number | undefined = spring.id;
      while (current !== undefined) {
        const currentCorner: MapCorner = newMap.corners[current as number];
        if (currentCorner.isOcean) break; // River reached ocean

        const next: number | undefined = currentCorner.downslope;
        if (next === undefined) {
          // Local minima: a lake forms
          currentCorner.isWater = true;

          // Mark surrounding polygon node as Lake (water, but not ocean)
          for (const touchId of currentCorner.touches) {
            const n = newMap.nodes[touchId];
            if (!n.isOcean) {
              n.isWater = true;
            }
          }
          break; // Stop river flow
        }

        // Flow downhill
        currentCorner.river++;

        // Find the edge connecting current and next corners
        let connectingEdge: MapEdge | undefined = undefined;
        for (const edgeId of currentCorner.protrudes) {
          const edge = newMap.edges[edgeId];
          if (
            (edge.v0 === current && edge.v1 === next) ||
            (edge.v1 === current && edge.v0 === next)
          ) {
            connectingEdge = edge;
            break;
          }
        }

        if (connectingEdge) {
          connectingEdge.river++;
        }

        current = next;
      }
    }
  }

  return newMap;
}
