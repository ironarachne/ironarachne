import { describe, expect, it } from 'vitest';
import { assignTemperature, type TemperatureConfig } from './climate';
import type { RegionMap } from './map_graph';

function fixture(): RegionMap {
  const corners = [0, 25, 50, 75, 100].map((y, id) => ({
    id,
    point: { x: 25, y },
    touches: [0],
    protrudes: [],
    adjacent: [],
    elevation: 0,
    moisture: 0,
    temperature: 0,
    isWater: false,
    isOcean: false,
    isCoast: false,
    river: 0,
  }));
  return {
    width: 50,
    height: 100,
    corners,
    edges: [],
    nodes: [
      {
        id: 0,
        center: { x: 25, y: 50 },
        polygon: { vertices: [], edges: [] },
        neighbors: [],
        edges: [],
        corners: corners.map((corner) => corner.id),
        elevation: 0,
        moisture: 0,
        temperature: 0,
        isWater: false,
        isOcean: false,
        isCoast: false,
      },
    ],
  };
}

function config(latitude: number): TemperatureConfig {
  // Sampling simplex noise at (0, 0) gives zero, isolating the latitude baseline.
  return { seed: 'climate', baseTemp: 30, latitude, elevationLapseRate: 6.5, frequency: 0 };
}

describe('north-up map temperature', () => {
  it.each([
    { latitude: 40, expected: [50, 45, 40, 35, 30] },
    { latitude: -40, expected: [-30, -35, -40, -45, -50] },
    { latitude: 0, expected: [10, 5, 0, -5, -10] },
    { latitude: 5, expected: [15, 10, 5, 0, -5] },
    { latitude: -5, expected: [5, 0, -5, -10, -15] },
  ])('cools poleward at center latitude $latitude', ({ latitude, expected }) => {
    const original = fixture();
    const map = assignTemperature(original, config(latitude));
    const temperatures = expected.map((lat) => 30 - (Math.abs(lat) / 90) * 50);
    map.corners.forEach((corner, index) => {
      expect(corner.temperature).toBeCloseTo(temperatures[index], 10);
    });
    expect(map.nodes[0].temperature).toBeCloseTo(
      temperatures.reduce((sum, value) => sum + value, 0) / temperatures.length,
      10,
    );
    expect(original).toEqual(fixture());
  });

  it('keeps local noise and elevation effects separate from latitude', () => {
    const flat = fixture();
    const elevated = fixture();
    elevated.corners.forEach((corner, index) => {
      corner.elevation = (index - 1) / 4;
    });
    const results = [0, 40].map((latitude) => {
      const settings = { ...config(latitude), frequency: 2.5 };
      const baseline = assignTemperature(flat, config(latitude));
      const noisy = assignTemperature(flat, settings);
      const cooled = assignTemperature(elevated, settings);
      expect(cooled).toEqual(assignTemperature(elevated, settings));
      const variation = noisy.corners.map((corner, index) => {
        expect(cooled.corners[index].temperature).toBeCloseTo(
          corner.temperature - Math.max(0, elevated.corners[index].elevation) * 3 * 6.5,
          10,
        );
        return corner.temperature - baseline.corners[index].temperature;
      });
      expect(variation.some((value) => Math.abs(value) > 0.01)).toBe(true);
      return variation;
    });
    results[0].forEach((value, index) => expect(value).toBeCloseTo(results[1][index], 10));
  });
});
