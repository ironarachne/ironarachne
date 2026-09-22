import { describe, expect, it } from 'vitest';
import { classifyAltitude, classifyRelief, classifyRegionLandforms } from './region_terrain';
import type { RegionMap } from './map_graph';

function mapWithElevations(elevations: number[]): RegionMap {
  return {
    width: 10,
    height: 10,
    nodes: elevations.map((elevation, id) => ({
      id,
      center: { x: id, y: 0 },
      polygon: { vertices: [], edges: [] },
      neighbors: [],
      edges: [],
      corners: [],
      elevation,
      moisture: 0,
      temperature: 0,
      isWater: false,
      isOcean: false,
      isCoast: false,
    })),
    edges: [],
    corners: [],
  };
}

describe('region terrain classification', () => {
  it('uses the approved altitude and relief boundaries', () => {
    expect(classifyAltitude(0.199)).toBe('low');
    expect(classifyAltitude(0.2)).toBe('mid');
    expect(classifyAltitude(0.8)).toBe('mid');
    expect(classifyAltitude(0.801)).toBe('high');
    expect(classifyRelief(0.3)).toBe('flat');
    expect(classifyRelief(0.301)).toBe('hilly');
    expect(classifyRelief(0.5)).toBe('hilly');
    expect(classifyRelief(0.501)).toBe('mountainous');
  });

  it('measures only land and classifies cells relative to the median', () => {
    const map = mapWithElevations([0, 0.1, 0.2, 0.3, 1]);
    map.nodes[4].isWater = true;

    const result = classifyRegionLandforms(map);

    expect(result.metrics.medianElevation).toBe(0.1);
    expect(result.metrics.p10Elevation).toBe(0);
    expect(result.metrics.p90Elevation).toBe(0.3);
    expect(result.metrics.reliefSpread).toBeCloseTo(0.3);
    expect(result.byNodeId.get(3)).toBe('hill');
    expect(result.byNodeId.has(4)).toBe(false);
  });
});
