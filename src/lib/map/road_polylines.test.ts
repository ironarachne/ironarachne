import { describe, expect, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import { assignBiomes } from './biome.js';
import { buildBaseMapGraph } from './builder.js';
import { assignMoisture, assignTemperature } from './climate.js';
import { assignElevation } from './elevation.js';
import { generateRoads } from './road.js';
import { buildRoadCentroidPolylines } from './road_polylines.js';
import { simulateWater } from './water.js';

function landNodeIds(map: import('./map_graph.js').RegionMap): number[] {
  return map.nodes.filter((n) => !n.isOcean && !n.isWater).map((n) => n.id);
}

describe('buildRoadCentroidPolylines', () => {
  it('covers every road edge exactly once across polylines', () => {
    const rng = new RNG('road-polyline-segments');
    let map = buildBaseMapGraph({ width: 22, height: 18, seed: 'poly', pointSpacing: 2, rng });
    map = assignElevation(map, { seed: 'e', islandShape: 'none', frequency: 0.88, hasMountainRange: false });
    map = simulateWater(map, { seaLevel: -0.1, springCountPercentage: 0.1, rng });
    map = assignTemperature(map, {
      seed: 't',
      baseTemp: 28,
      latitude: 40,
      elevationLapseRate: 6.5,
      frequency: 2.2,
    });
    map = assignMoisture(map, { seed: 'm', baseMoisture: 0.45, frequency: 2.2 });
    map = assignBiomes(map, { rng, paletteSize: 5 });

    const land = landNodeIds(map);
    const towns = land.filter((_, i) => i % 4 === 0).slice(0, 6);
    expect(towns.length).toBeGreaterThanOrEqual(3);

    const wired = generateRoads(map, towns);
    const roadEdgeCount = wired.edges.filter((e) => e.road && e.road > 0).length;
    expect(roadEdgeCount).toBeGreaterThan(0);

    const polylines = buildRoadCentroidPolylines(wired);
    const segmentCount = polylines.reduce((acc, p) => acc + Math.max(0, p.length - 1), 0);
    expect(segmentCount).toBe(roadEdgeCount);
  });
});
