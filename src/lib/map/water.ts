import type { RegionMap, MapCorner, MapEdge } from './map_graph.js';
import type { RNG } from '@ironarachne/rng';

export interface WaterConfig {
  seaLevel: number;
  springCountPercentage: number;
  rng: RNG;
}

/** Marks the cells covered by water before rivers add lakes at local minima. */
function classifyWaterCells(map: RegionMap, seaLevel: number): void {
  for (const node of map.nodes) {
    const submergedCorners = node.corners.filter(
      (id) => map.corners[id].elevation < seaLevel,
    ).length;
    node.isWater =
      node.isOcean ||
      node.elevation < seaLevel ||
      (node.corners.length > 0 && submergedCorners >= node.corners.length / 2);
  }
}

/** Every connected water cell reached from a boundary ocean seed belongs to the ocean. */
function normalizeOceanConnectedWater(map: RegionMap): void {
  const ocean = map.nodes.filter((node) => node.isOcean).map((node) => node.id);
  for (let i = 0; i < ocean.length; i++) {
    for (const id of map.nodes[ocean[i]].neighbors) {
      const neighbor = map.nodes[id];
      if (neighbor.isWater && !neighbor.isOcean) {
        neighbor.isOcean = true;
        ocean.push(id);
      }
    }
  }
}

/** Corner outlets and coasts follow the polygons that will actually appear as water. */
function updateWaterBoundaries(map: RegionMap): void {
  for (const corner of map.corners) {
    corner.isOcean = corner.touches.some((id) => map.nodes[id].isOcean);
    corner.isWater = corner.touches.some((id) => map.nodes[id].isWater);
    corner.isCoast = corner.isOcean && corner.touches.some((id) => !map.nodes[id].isWater);
  }
  for (const node of map.nodes) {
    node.isCoast = !node.isWater && node.neighbors.some((id) => map.nodes[id].isOcean);
  }
}

/** An unmapped local minimum becomes a lake when a river supplies it. */
function fillLake(map: RegionMap, corner: MapCorner): void {
  for (const id of corner.touches) {
    const node = map.nodes[id];
    node.isWater = true;
    for (const cornerId of node.corners) {
      map.corners[cornerId].isWater = true;
    }
  }
}

/**
 * Simulates downhill water flow from springs to calculate rivers and lakes.
 * Identifies ocean by rim connectivity through submerged cells; inland water is lake.
 *
 * @param {RegionMap} map The input MapGraph with elevation already calculated.
 * @param {WaterConfig} config Algorithm parameters.
 * @returns {RegionMap} A new RegionMap with populated water data.
 */
export function simulateWater(map: RegionMap, config: WaterConfig): RegionMap {
  // Deep clone
  const newMap: RegionMap = structuredClone(map);
  const { seaLevel, springCountPercentage, rng } = config;

  // 1–2. Classify mapped water before deriving the corner outlets rivers terminate at.
  classifyWaterCells(newMap, seaLevel);
  updateWaterBoundaries(newMap);

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
  const landCorners = newMap.corners.filter((c) => !c.isWater);
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
        if (currentCorner.isWater) break; // River reached mapped ocean or lake

        const next: number | undefined = currentCorner.downslope;
        if (next === undefined) {
          fillLake(newMap, currentCorner);
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

  // River sinks can create new water cells beside mapped ocean. Normalize only after every lake
  // exists, then derive coasts from the geography the rest of generation will consume.
  normalizeOceanConnectedWater(newMap);
  updateWaterBoundaries(newMap);
  return newMap;
}
