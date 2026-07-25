import type { RegionMap } from './map_graph.js';
import { createSimplexNoise2D } from '../noise/simplex.js';

export interface TemperatureConfig {
  seed: string;
  baseTemp: number; // e.g. 15 Celsius
  latitude: number; // 0 (Equator) to 90 (Poles)
  elevationLapseRate: number; // how much temp drops per elevation unit (e.g. 6.5 C per km)
  frequency: number;
}

export interface MoistureConfig {
  seed: string;
  baseMoisture: number; // 0 to 1
  frequency: number;
}

/**
 * Calculates temperature for each node and corner based on latitude, elevation, and noise.
 *
 * @param {RegionMap} map The map graph with elevation calculated.
 * @param {TemperatureConfig} config Configuration containing base temperature and latitude.
 * @returns {RegionMap} A new MapGraph instance with temperatures assigned.
 */
export function assignTemperature(map: RegionMap, config: TemperatureConfig): RegionMap {
  const newMap: RegionMap = structuredClone(map);
  const { width, height } = newMap;
  const noise = createSimplexNoise2D(config.seed);

  // Calculate latitude gradient across the map (assuming top is North, bottom is South or vice versa)
  // For simplicity, map Y is used as a variation of the base latitude.
  // 0 -> config.latitude - offset, height -> config.latitude + offset
  const latOffset = 10; // degrees span across the region map

  // Process corners first
  for (const corner of newMap.corners) {
    const yRatio = Math.max(0, Math.min(1, corner.point.y / height));
    const latBase = config.latitude + (yRatio * 2 - 1) * latOffset;
    // Base temp is roughly equator temp. Drop by ~50C from equator to poles.
    const latTemp = config.baseTemp - (Math.abs(latBase) / 90) * 50;

    // Noise adds local variation
    const nx = (corner.point.x / width) * config.frequency;
    const ny = (corner.point.y / height) * config.frequency;
    const localThrust = noise(nx, ny) * 5; // +/- 5 Celsius

    // Elevation drops temp
    const ev = Math.max(0, corner.elevation); // Only above sea level
    // Assume max elevation (ev=1.0) is roughly 3km
    const maxZ = 3.0;
    const elevationTemp = ev * maxZ * config.elevationLapseRate;

    corner.temperature = latTemp + localThrust - elevationTemp;
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
