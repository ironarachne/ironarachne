import type { RegionMap } from './map_graph.js';
import type { BiomeClassification } from '../environment/biomes/biome_types.js';
import * as BiomeClassifications from '../environment/biomes/biome_classifications.js';
import type { RNG } from '@ironarachne/rng';

export interface BiomeAssignmentConfig {
  rng: RNG;
  paletteSize?: number;
}

/**
 * Calculates a basic distance between a node's climate and a biome's ideal climate.
 */
function getBiomeDistance(
  temp: number,
  moisture: number,
  elevation: number,
  b: BiomeClassification,
): number {
  const bTemp = (b.temperatureMin + b.temperatureMax) / 2;
  // Biome humidity is 0.0 - 1.0, similar to our moisture
  const bMoist = (b.humidityMin + b.humidityMax) / 2;
  const bElev = (b.altitudeMin + b.altitudeMax) / 2;

  const dt = temp - bTemp;
  const dm = moisture - bMoist;
  const de = elevation - bElev;

  // Weight moisture somewhat heavily (2000), elevation moderately (1000), temperature lightly (1)
  return Math.sqrt(dt * dt + dm * dm * 2000 + de * de * 1000);
}

function buildBiomePalette(map: RegionMap, config: BiomeAssignmentConfig): string[] {
  const targetCount = config.paletteSize ?? 5;
  const landNodes = map.nodes.filter((n) => !n.isOcean && !n.isWater);
  if (landNodes.length === 0) return [];

  const temps = landNodes.map((n) => n.temperature);
  const moistures = landNodes.map((n) => n.moisture);
  const elevations = landNodes.map((n) => n.elevation);

  const tempRange = [Math.min(...temps), Math.max(...temps)];
  const moistRange = [Math.min(...moistures), Math.max(...moistures)];
  const elevRange = [Math.min(...elevations), Math.max(...elevations)];

  const tempMid = (tempRange[0] + tempRange[1]) / 2;
  const moistMid = (moistRange[0] + moistRange[1]) / 2;
  const elevMid = (elevRange[0] + elevRange[1]) / 2;

  // 9 sample points: the extremes + the middle
  const samplePoints = [
    [tempRange[0], moistRange[0], elevRange[0]],
    [tempRange[0], moistRange[0], elevRange[1]],
    [tempRange[0], moistRange[1], elevRange[0]],
    [tempRange[0], moistRange[1], elevRange[1]],
    [tempRange[1], moistRange[0], elevRange[0]],
    [tempRange[1], moistRange[0], elevRange[1]],
    [tempRange[1], moistRange[1], elevRange[0]],
    [tempRange[1], moistRange[1], elevRange[1]],
    [tempMid, moistMid, elevMid],
  ];

  const palette = new Set<string>();
  const allTerrestrial = BiomeClassifications.getAll().filter((b) => !b.isAquatic);

  for (const [t, m, e] of samplePoints) {
    let bestBiome = allTerrestrial[0];
    let bestDist = Infinity;
    for (const b of allTerrestrial) {
      const d = getBiomeDistance(t, m, e, b);
      if (d < bestDist) {
        bestDist = d;
        bestBiome = b;
      }
    }
    palette.add(bestBiome.name);
  }

  let paletteArray = Array.from(palette);

  if (paletteArray.length > targetCount) {
    paletteArray = config.rng.shuffle(paletteArray).slice(0, targetCount);
  }

  return paletteArray;
}

/**
 * Selects the best fitting biome (based on existing environment data) for each node based on temperature, moisture, and elevation.
 * Maps these properties back to a string ID corresponding to the biome's name.
 *
 * @param {RegionMap} map The base map filled with Temp/Moisture/Elevation
 * @param {BiomeAssignmentConfig} config Configuration containing RNG and palette options
 * @returns {RegionMap} Modified map with biome assignments.
 */
export function assignBiomes(map: RegionMap, config: BiomeAssignmentConfig): RegionMap {
  const newMap: RegionMap = structuredClone(map);

  const allBiomes = BiomeClassifications.getAll();
  const palette = buildBiomePalette(newMap, config);
  const allowedBiomes = allBiomes.filter((b) => palette.includes(b.name) || b.isAquatic);

  // Phase 1: Initial assignment
  for (const node of newMap.nodes) {
    if (node.isOcean) {
      node.biomeId = 'ocean'; // Fallback / placeholder for ocean
      continue;
    }
    if (node.isWater) {
      node.biomeId = 'lake'; // Fallback / placeholder for fresh water
      continue;
    }

    const nTemp = node.temperature;
    const nMoist = node.moisture;
    const nElev = node.elevation;

    let bestBiome = allowedBiomes[0];
    let bestDist = Infinity;

    for (const b of allowedBiomes) {
      if (b.isAquatic) continue; // land nodes never get aquatic biomes

      const d = getBiomeDistance(nTemp, nMoist, nElev, b);
      if (d < bestDist) {
        bestDist = d;
        bestBiome = b;
      }
    }

    node.biomeId = bestBiome.name;
  }

  // Phase 2: Smoothing via neighbors
  for (let pass = 0; pass < 2; pass++) {
    for (const node of newMap.nodes) {
      if (node.isOcean || node.isWater) continue;

      const neighborBiomes: Record<string, number> = {};
      for (const neighborId of node.neighbors) {
        const nb = newMap.nodes[neighborId];
        if (!nb.isOcean && !nb.isWater && nb.biomeId) {
          neighborBiomes[nb.biomeId] = (neighborBiomes[nb.biomeId] || 0) + 1;
        }
      }

      const sortedNeighbors = Object.entries(neighborBiomes).sort((a, b) => b[1] - a[1]);
      const mostCommon = sortedNeighbors[0]?.[0];

      if (mostCommon && node.biomeId && mostCommon !== node.biomeId) {
        const currentBiome = BiomeClassifications.getByName(node.biomeId);
        const neighborBiome = BiomeClassifications.getByName(mostCommon);

        const currentDist = getBiomeDistance(
          node.temperature,
          node.moisture,
          node.elevation,
          currentBiome,
        );
        const neighborDist = getBiomeDistance(
          node.temperature,
          node.moisture,
          node.elevation,
          neighborBiome,
        );

        // Adopt neighbor's biome if it's reasonably close to this node's ideal climate (20% tolerance)
        if (neighborDist < currentDist * 1.2) {
          node.biomeId = mostCommon;
        }
      }
    }
  }

  return newMap;
}
