import type { RegionMap } from './map_graph.js';

export type AltitudeBand = 'low' | 'mid' | 'high';
export type ReliefClass = 'flat' | 'hilly' | 'mountainous';
export type LandformClass = 'plain' | 'hill' | 'mountain' | 'highMountain';

export const ALTITUDE_LOW_MAX = 0.2;
export const ALTITUDE_HIGH_MIN = 0.8;
export const RELIEF_FLAT_MAX = 0.3;
export const RELIEF_HILLY_MAX = 0.5;
export const CELL_HILL_MIN = 0.15;
export const CELL_MOUNTAIN_MIN = 0.35;
export const CELL_HIGH_MOUNTAIN_MIN = 0.65;

export interface TerrainMetrics {
  medianElevation: number;
  p10Elevation: number;
  p90Elevation: number;
  reliefSpread: number;
  hillFraction: number;
  mountainFraction: number;
  highMountainFraction: number;
}

export interface ClassifiedTerrain {
  metrics: TerrainMetrics;
  byNodeId: Map<number, LandformClass>;
}

function percentile(values: number[], fraction: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.max(0, Math.ceil(sorted.length * fraction) - 1)];
}

export function classifyAltitude(elevation: number): AltitudeBand {
  if (elevation < ALTITUDE_LOW_MAX) return 'low';
  if (elevation > ALTITUDE_HIGH_MIN) return 'high';
  return 'mid';
}

export function classifyRelief(spread: number): ReliefClass {
  if (spread <= RELIEF_FLAT_MAX) return 'flat';
  if (spread <= RELIEF_HILLY_MAX) return 'hilly';
  return 'mountainous';
}

export function measureRegionTerrain(map: RegionMap): TerrainMetrics {
  return classifyRegionLandforms(map).metrics;
}

export function classifyRegionLandforms(map: RegionMap): ClassifiedTerrain {
  const land = map.nodes.filter((node) => !node.isOcean && !node.isWater);
  const elevations = land.map((node) => node.elevation);
  if (elevations.length === 0) {
    return {
      metrics: {
        medianElevation: 0,
        p10Elevation: 0,
        p90Elevation: 0,
        reliefSpread: 0,
        hillFraction: 0,
        mountainFraction: 0,
        highMountainFraction: 0,
      },
      byNodeId: new Map(),
    };
  }

  const medianElevation = percentile(elevations, 0.5);
  const p10Elevation = percentile(elevations, 0.1);
  const p90Elevation = percentile(elevations, 0.9);
  const byNodeId = new Map<number, LandformClass>();
  for (const node of land) {
    const relative = node.elevation - medianElevation;
    const landform =
      relative >= CELL_HIGH_MOUNTAIN_MIN
        ? 'highMountain'
        : relative >= CELL_MOUNTAIN_MIN
          ? 'mountain'
          : relative >= CELL_HILL_MIN
            ? 'hill'
            : 'plain';
    byNodeId.set(node.id, landform);
  }

  const count = land.length;
  return {
    metrics: {
      medianElevation,
      p10Elevation,
      p90Elevation,
      reliefSpread: p90Elevation - p10Elevation,
      hillFraction: [...byNodeId.values()].filter((value) => value === 'hill').length / count,
      mountainFraction:
        [...byNodeId.values()].filter((value) => value === 'mountain').length / count,
      highMountainFraction:
        [...byNodeId.values()].filter((value) => value === 'highMountain').length / count,
    },
    byNodeId,
  };
}
