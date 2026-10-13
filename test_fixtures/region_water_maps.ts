import type { RegionMap } from '../src/lib/map';
import type { Vertex } from '../src/lib/geometry';

/** One explicit water boundary, including thin channels the procedural examples may not produce. */
export function regionWaterMap(shoreline: Vertex[], ocean: boolean): RegionMap {
  const edges = shoreline.map((a, id) => {
    const b = shoreline[(id + 1) % shoreline.length];
    return {
      id,
      d0: 0,
      v0: id,
      v1: (id + 1) % shoreline.length,
      river: 0,
      midpoint: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
    };
  });
  const geography = {
    elevation: 0,
    moisture: 1,
    temperature: 15,
    isWater: true,
    isOcean: ocean,
    isCoast: true,
  };
  return {
    width: 35,
    height: 35,
    nodes: [
      {
        id: 0,
        center: { x: 17.5, y: 17.5 },
        polygon: {
          vertices: shoreline,
          edges: edges.map((edge) => ({ a: shoreline[edge.v0], b: shoreline[edge.v1] })),
        },
        neighbors: [],
        corners: shoreline.map((_, id) => id),
        edges: edges.map((edge) => edge.id),
        biomeId: ocean ? 'ocean' : 'lake',
        ...geography,
      },
    ],
    corners: shoreline.map((point, id) => ({
      id,
      point,
      touches: [0],
      protrudes: [id, (id + shoreline.length - 1) % shoreline.length],
      adjacent: [(id + 1) % shoreline.length, (id + shoreline.length - 1) % shoreline.length],
      river: 0,
      ...geography,
    })),
    edges,
  };
}

export const WATER_REVIEW_MAPS = {
  ocean: regionWaterMap(
    [
      { x: 0, y: 0 },
      { x: 25, y: 0 },
      { x: 28, y: 6 },
      { x: 24, y: 12 },
      { x: 27, y: 18 },
      { x: 24, y: 25 },
      { x: 26, y: 35 },
      { x: 0, y: 35 },
    ],
    true,
  ),
  lake: regionWaterMap(
    [
      { x: 7, y: 5 },
      { x: 23, y: 4 },
      { x: 29, y: 11 },
      { x: 25, y: 18 },
      { x: 28, y: 24 },
      { x: 17, y: 29 },
      { x: 6, y: 25 },
      { x: 9, y: 17 },
    ],
    false,
  ),
  inlet: regionWaterMap(
    [
      { x: 3, y: 3 },
      { x: 32, y: 3 },
      { x: 32, y: 30 },
      { x: 18, y: 30 },
      { x: 18, y: 12 },
      { x: 17.6, y: 12 },
      { x: 17.6, y: 30 },
      { x: 3, y: 30 },
    ],
    true,
  ),
};
