import { describe, expect, it } from 'vitest';
import {
  assignTemperature,
  measureTemperatureEnvelope,
  summarizeLandTemperature,
  type TemperatureConfig,
} from './climate';
import { annualMeanAt, mapHeight } from '../environment/climates/climate_model';
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
  return { seed: 'climate', latitude, frequency: 0 };
}

describe('north-up map temperature', () => {
  it.each([40, -40, 0, 5, -5])('cools poleward at center latitude $latitude', (latitude) => {
    const original = fixture();
    const map = assignTemperature(original, config(latitude));
    const height = mapHeight(0);
    const latitudes = [10, 5, 0, -5, -10].map((offset) => latitude + offset);
    const expectedCornerTemperatures = latitudes.map((value) => annualMeanAt(value, height));
    map.corners.forEach((corner, index) => {
      expect(corner.temperature).toBeCloseTo(expectedCornerTemperatures[index], 10);
    });
    expect(map.nodes[0].temperature).toBeCloseTo(
      expectedCornerTemperatures.reduce((sum, value) => sum + value, 0) /
        expectedCornerTemperatures.length,
      10,
    );
    expect(original).toEqual(fixture());
  });

  it('keeps bounded local variation and elevation effects separate from latitude', () => {
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
        const lat = latitude + (1 - (index / 4) * 2) * 10;
        expect(cooled.corners[index].temperature).toBeCloseTo(
          corner.temperature +
            annualMeanAt(lat, mapHeight(elevated.corners[index].elevation)) -
            annualMeanAt(lat, mapHeight(0)),
          10,
        );
        return corner.temperature - baseline.corners[index].temperature;
      });
      expect(variation.every((value) => Math.abs(value) <= 2)).toBe(true);
      expect(variation.some((value) => Math.abs(value) > 0.01)).toBe(true);
      return variation;
    });
    results[0].forEach((value, index) => expect(value).toBeCloseTo(results[1][index], 10));
  });

  it('summarizes the realized dry land and its spatial envelope', () => {
    const map = assignTemperature(fixture(), config(40));
    map.nodes.push({
      ...map.nodes[0],
      id: 1,
      elevation: 1.2,
      isWater: false,
      isOcean: false,
    });
    map.corners.forEach((corner) => {
      corner.temperature = 4;
    });
    map.nodes[0].temperature = 4;
    map.nodes[1].temperature = 12;

    const summary = summarizeLandTemperature(map, 40);
    expect(summary.annualMean).toBe(8);
    expect(summary.coldestMonth).toBeLessThan(summary.annualMean);
    expect(summary.warmestMonth).toBeGreaterThan(summary.annualMean);
    expect(summary.seasons.map((season) => season.temperatureAdjustment)).toContain(
      summary.coldestMonth - summary.annualMean,
    );

    const envelope = measureTemperatureEnvelope(map);
    expect(envelope.meanAnnual).toBe(8);
    expect(envelope.coldestNodeId).toBe(0);
    expect(envelope.coldestAnnual).toBe(4);
    expect(envelope.warmestNodeId).toBe(1);
    expect(envelope.warmestAnnual).toBe(12);
  });
});
