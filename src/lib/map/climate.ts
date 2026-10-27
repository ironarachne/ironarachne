import type { RegionMap } from './map_graph.js';
import { createSimplexNoise2D } from '../noise/simplex.js';
import {
  LOCAL_VARIATION_C,
  annualMeanAt,
  mapHeight,
  seasonCalendar,
  seasonExtremeAmplitude,
} from '../environment/climates/climate_model.js';
import type {
  RegionalTemperatureSummary,
  SpatialTemperatureEnvelope,
} from '../environment/climates/climate_types.js';

export interface TemperatureConfig {
  seed: string;
  latitude: number; // Signed center latitude: positive north, negative south, 0 at the equator
  frequency: number;
}

export interface MoistureConfig {
  seed: string;
  baseMoisture: number; // 0 to 1
  frequency: number;
}

function percentile(values: number[], fraction: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.max(0, Math.ceil(sorted.length * fraction) - 1)];
}

function landNodes(map: RegionMap) {
  return map.nodes.filter((node) => !node.isOcean && !node.isWater);
}

/**
 * Calculates the local annual mean for each node and corner from the shared temperature model.
 *
 * Latitude changes across the map from north to south, and elevation is normalized once by the
 * model. The only local term is a bounded seeded variation; it cannot invent a regional climate.
 *
 * @param {RegionMap} map The map graph with elevation calculated.
 * @param {TemperatureConfig} config Seed, signed center latitude and noise frequency.
 * @returns {RegionMap} A new MapGraph instance with temperatures assigned.
 */
export function assignTemperature(map: RegionMap, config: TemperatureConfig): RegionMap {
  const newMap: RegionMap = structuredClone(map);
  const { width, height } = newMap;
  const noise = createSimplexNoise2D(config.seed);

  // North is up: Y increases southward, so signed latitude decreases with Y.
  // The map spans 10 degrees either side of its center latitude (20 degrees total).
  const latOffset = 10;

  // Process corners first
  for (const corner of newMap.corners) {
    const yRatio = Math.max(0, Math.min(1, corner.point.y / height));
    const latBase = config.latitude + (1 - yRatio * 2) * latOffset;

    const nx = (corner.point.x / width) * config.frequency;
    const ny = (corner.point.y / height) * config.frequency;
    const localThrust = noise(nx, ny) * LOCAL_VARIATION_C;

    corner.temperature = annualMeanAt(latBase, mapHeight(corner.elevation)) + localThrust;
  }

  // Process Nodes
  for (const node of newMap.nodes) {
    let sumTemp = 0;
    for (const cId of node.corners) {
      sumTemp += newMap.corners[cId].temperature;
    }
    node.temperature = sumTemp / node.corners.length;
  }

  return newMap;
}

/**
 * The regional temperature summary: what the realized dry land actually averages, with the
 * seasonal amplitude for the region's center latitude.
 *
 * The summary is derived from the map rather than drawn separately, so it cannot disagree with
 * the cells it describes. It is generation-time data, never a persisted field.
 */
export function summarizeLandTemperature(
  map: RegionMap,
  referenceLatitude: number,
): RegionalTemperatureSummary {
  const land = landNodes(map);
  if (land.length === 0) {
    return {
      annualMean: 0,
      coldestMonth: 0,
      warmestMonth: 0,
      referenceLatitude,
      referenceHeight: 0.5,
      seasons: seasonCalendar(referenceLatitude),
    };
  }

  const annualMean = land.reduce((sum, node) => sum + node.temperature, 0) / land.length;
  const amplitude = seasonExtremeAmplitude(referenceLatitude);
  const referenceHeight = percentile(
    land.map((node) => mapHeight(node.elevation)),
    0.5,
  );

  return {
    annualMean,
    coldestMonth: annualMean - amplitude,
    warmestMonth: annualMean + amplitude,
    referenceLatitude,
    referenceHeight,
    seasons: seasonCalendar(referenceLatitude),
  };
}

/**
 * The distribution of dry-land annual means, including the cells at its ends.
 *
 * Spatial claims use this envelope; the regional summary's seasonal minimum is not a floor over
 * the map. It is derived on demand and never persisted.
 */
export function measureTemperatureEnvelope(map: RegionMap): SpatialTemperatureEnvelope {
  const land = landNodes(map);
  if (land.length === 0) {
    return {
      meanAnnual: 0,
      coldestNodeId: -1,
      coldestAnnual: 0,
      warmestNodeId: -1,
      warmestAnnual: 0,
      p10Annual: 0,
      p90Annual: 0,
    };
  }

  const sorted = [...land].sort((a, b) => a.temperature - b.temperature || a.id - b.id);
  const temperatures = sorted.map((node) => node.temperature);
  return {
    meanAnnual: temperatures.reduce((sum, value) => sum + value, 0) / temperatures.length,
    coldestNodeId: sorted[0].id,
    coldestAnnual: sorted[0].temperature,
    warmestNodeId: sorted[sorted.length - 1].id,
    warmestAnnual: sorted[sorted.length - 1].temperature,
    p10Annual: percentile(temperatures, 0.1),
    p90Annual: percentile(temperatures, 0.9),
  };
}

/**
 * Calculates moisture based on distance to water (rivers/oceans) and procedural noise.
 *
 * @param {RegionMap} map The MapGraph with water simulated.
 * @param {MoistureConfig} config Seed and base moisture configuration.
 * @returns {RegionMap} A mutated MapGraph with moisture mapped.
 */
export function assignMoisture(map: RegionMap, config: MoistureConfig): RegionMap {
  const newMap: RegionMap = structuredClone(map);
  const noise = createSimplexNoise2D(config.seed + '-moist');
  const { width, height } = newMap;

  // Initialize moisture Queue using BFS to bleed moisture out from freshwater/oceans
  const maxMoisture = 1.0;
  for (const c of newMap.corners) {
    if (c.isWater || c.river > 0 || c.isOcean) {
      c.moisture = maxMoisture;
    } else {
      c.moisture = 0;
    }
  }

  // Bleed moisture outward using a multi-pass relaxation
  const passes = 3;
  for (let i = 0; i < passes; i++) {
    const prevMoisture = newMap.corners.map((c) => c.moisture);
    for (const corner of newMap.corners) {
      if (corner.moisture === maxMoisture) continue;

      let sum = 0;
      let count = 0;
      for (const adj of corner.adjacent) {
        sum += prevMoisture[adj];
        count++;
      }

      const avg = sum / count;
      // Fade heavily with distance
      corner.moisture = avg * 0.9;
    }
  }

  // Add noise variation to Moisture and copy to Nodes
  for (const corner of newMap.corners) {
    const nx = (corner.point.x / width) * config.frequency;
    const ny = (corner.point.y / height) * config.frequency;
    const nMoist = (noise(nx, ny) + 1) / 2; // [0,1]

    // Blend distance moisture and noise, using baseMoisture as a baseline offset against 0.5
    corner.moisture = corner.moisture * 0.7 + nMoist * 0.3 + (config.baseMoisture - 0.5);
    // Clamp
    corner.moisture = Math.max(0, Math.min(1, corner.moisture));
  }

  for (const node of newMap.nodes) {
    let sumMoist = 0;
    for (const cId of node.corners) {
      sumMoist += newMap.corners[cId].moisture;
    }
    node.moisture = sumMoist / node.corners.length;
  }

  return newMap;
}
