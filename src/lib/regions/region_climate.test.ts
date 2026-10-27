import { describe, expect, it } from 'vitest';
import { Climates } from '$lib/environment';
import { rollRegionSnapshot } from './region_roll';

const SEEDS = ['alpha', 'bravo', '5pkjdquccl04i', '5wyedz5q272fz'] as const;

describe('regional temperature summary', () => {
  it.each(SEEDS)(
    'is the realized dry-land mean for %s',
    (seed) => {
      const saved = rollRegionSnapshot(seed);
      const land = saved.map.nodes.filter((node) => !node.isWater && !node.isOcean);
      const mean = land.reduce((sum, node) => sum + node.temperature, 0) / land.length;

      expect(saved.environment.climate.temperature).toBeCloseTo(mean, 10);
      expect(saved.environment.climate.temperatureMin).toBeLessThan(
        saved.environment.climate.temperature,
      );
      expect(saved.environment.climate.temperatureMax).toBeGreaterThan(
        saved.environment.climate.temperature,
      );
      const adjustments = saved.environment.climate.seasons.map(
        (season) => season.temperatureAdjustment,
      );
      expect(adjustments).toContainEqual(
        expect.closeTo(
          saved.environment.climate.temperatureMin - saved.environment.climate.temperature,
          10,
        ),
      );
      expect(adjustments).toContainEqual(
        expect.closeTo(
          saved.environment.climate.temperatureMax - saved.environment.climate.temperature,
          10,
        ),
      );
    },
    30000,
  );

  it('keeps seasonal range and spatial spread as different measurements', () => {
    const warm = rollRegionSnapshot('alpha');
    const cold = rollRegionSnapshot('bravo');
    const seasonalRange = (region: typeof warm) =>
      region.environment.climate.temperatureMax - region.environment.climate.temperatureMin;

    expect(seasonalRange(warm)).toBeLessThan(seasonalRange(cold));
  }, 30000);

  it('gives every embedded settlement the climate at its own node', () => {
    for (const seed of SEEDS) {
      const saved = rollRegionSnapshot(seed);
      for (const entry of saved.settlements) {
        if (entry.snapshot.mapNodeId === undefined) continue;
        const node = saved.map.nodes[entry.snapshot.mapNodeId];
        const site = Climates.siteTemperature(saved.environment.climate, node.temperature);
        expect(entry.snapshot.environment.climate.temperature).toBeCloseTo(node.temperature, 10);
        expect(entry.snapshot.environment.climate.temperatureMin).toBeCloseTo(
          site.coldestMonth,
          10,
        );
        expect(entry.snapshot.environment.climate.temperatureMax).toBeCloseTo(
          site.warmestMonth,
          10,
        );
      }
    }
  }, 30000);

  it('allows a local cold patch to be colder than the regional seasonal minimum', () => {
    const saved = rollRegionSnapshot('bravo');
    const entry = saved.settlements.find((settlement) => {
      if (settlement.snapshot.mapNodeId === undefined) return false;
      const node = saved.map.nodes[settlement.snapshot.mapNodeId];
      return Climates.siteTemperature(saved.environment.climate, node.temperature).coldestMonth < 0;
    });
    expect(entry).toBeDefined();
    const node = saved.map.nodes[entry!.snapshot.mapNodeId!];
    const site = Climates.siteTemperature(saved.environment.climate, node.temperature);
    expect(site.coldestMonth).toBeLessThan(saved.environment.climate.temperatureMin);
    expect(entry!.snapshot.settlementTags).not.toContain('hot_climate');
  }, 30000);

  it('is deterministic for a fixed seed', () => {
    expect(rollRegionSnapshot('bravo')).toEqual(rollRegionSnapshot('bravo'));
  }, 30000);
});
