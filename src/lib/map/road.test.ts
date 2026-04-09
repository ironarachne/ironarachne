import { describe, expect, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import { assignBiomes } from './biome.js';
import { buildBaseMapGraph } from './builder.js';
import { assignMoisture, assignTemperature } from './climate.js';
import { assignElevation } from './elevation.js';
import type { RegionMap } from './map_graph.js';
import { generateRoads } from './road.js';
import { simulateWater } from './water.js';

function landNodeIds(map: RegionMap): number[] {
  return map.nodes.filter((n) => !n.isOcean && !n.isWater).map((n) => n.id);
}

function settlementsConnectedByRoads(map: RegionMap, townIds: number[]): boolean {
  const ids = [...new Set(townIds)].filter((id) => id >= 0 && id < map.nodes.length);
  if (ids.length <= 1) return true;

  const adj = new Map<number, number[]>();
  const link = (a: number, b: number) => {
    if (!adj.has(a)) adj.set(a, []);
    if (!adj.has(b)) adj.set(b, []);
    adj.get(a)!.push(b);
    adj.get(b)!.push(a);
  };

  for (const e of map.edges) {
    if (!e.road || e.road <= 0) continue;
    if (e.d1 === undefined) continue;
    link(e.d0, e.d1);
  }

  const start = ids[0]!;
  const seen = new Set<number>([start]);
  const stack = [start];
  while (stack.length > 0) {
    const u = stack.pop()!;
    for (const v of adj.get(u) ?? []) {
      if (!seen.has(v)) {
        seen.add(v);
        stack.push(v);
      }
    }
  }
  return ids.every((id) => seen.has(id));
}

function buildPipelineMap(rng: RNG, seedSuffix: string): RegionMap {
  let map = buildBaseMapGraph({
    width: 28,
    height: 22,
    seed: `road-pipe-${seedSuffix}`,
    pointSpacing: 2,
    rng,
  });
  map = assignElevation(map, {
    seed: `e-${seedSuffix}`,
    islandShape: 'none',
    frequency: 0.88,
    hasMountainRange: true,
  });
  map = simulateWater(map, { seaLevel: -0.1, springCountPercentage: 0.1, rng });
  map = assignTemperature(map, {
    seed: `t-${seedSuffix}`,
    baseTemp: 28,
    latitude: 40,
    elevationLapseRate: 6.5,
    frequency: 2.2,
  });
  map = assignMoisture(map, { seed: `m-${seedSuffix}`, baseMoisture: 0.45, frequency: 2.2 });
  map = assignBiomes(map, { rng, paletteSize: 5 });
  return map;
}

describe('generateRoads', () => {
  it('connects every settlement via roads (MST over shortest paths)', () => {
    for (let attempt = 0; attempt < 15; attempt++) {
      const rng = new RNG(`road-mst-${attempt}`);
      const map = buildPipelineMap(rng, String(attempt));
      const land = landNodeIds(map);
      const step = Math.max(1, Math.floor(land.length / 7));
      const towns = land.filter((_, i) => i % step === 0).slice(0, 7);
      if (towns.length < 4) continue;

      const wired = generateRoads(map, towns);
      expect(settlementsConnectedByRoads(wired, towns)).toBe(true);
    }
  });
});
