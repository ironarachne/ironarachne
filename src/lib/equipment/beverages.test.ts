import { describe, expect, it } from 'vitest';
import { beverageTypes, generateBeverage } from './beverages';
import { DENSITY_MAP } from './equipment_types';

const seeds = ['a', 'b', 'c', 'd', 'e', 'f'];

describe('beverageTypes', () => {
  it('describes every beverage with a non-negative price', () => {
    expect(beverageTypes.length).toBeGreaterThan(0);

    for (const type of beverageTypes) {
      expect(type.name.length).toBeGreaterThan(0);
      expect(type.description.length).toBeGreaterThan(0);
      expect(type.valuePerLiter).toBeGreaterThanOrEqual(0);
      expect(type.tags).toContain('beverage');
    }
  });

  it('names every beverage uniquely', () => {
    const names = beverageTypes.map((type) => type.name);

    expect(new Set(names).size).toBe(names.length);
  });

  it('tags every alcoholic drink as alcohol', () => {
    const alcoholic = beverageTypes.filter((type) => type.tags.includes('alcohol'));

    expect(alcoholic.length).toBeGreaterThan(0);
    for (const type of alcoholic) {
      expect(type.valuePerLiter).toBeGreaterThan(0);
    }
  });
});

describe('generateBeverage', () => {
  it('is reproducible from a seed', () => {
    expect(generateBeverage('seed-a')).toEqual(generateBeverage('seed-a'));
  });

  it('varies with the seed', () => {
    const ids = new Set(seeds.map((seed) => generateBeverage(seed).liquid.id));

    expect(ids.size).toBe(seeds.length);
  });

  it('puts the liquid in a container that can hold liquid', () => {
    for (const seed of seeds) {
      const { container, liquid } = generateBeverage(seed);

      expect(container.contents).toEqual([liquid.id]);
      expect(liquid.containerId).toBe(container.id);
    }
  });

  it('never locks the container', () => {
    for (const seed of seeds) {
      expect(generateBeverage(seed).container.lock).toBeUndefined();
    }
  });

  it('fills the container to between half and all of its capacity', () => {
    for (const seed of seeds) {
      const { container, liquid } = generateBeverage(seed);

      expect(liquid.manualVolume!).toBeGreaterThanOrEqual(container.maxVolume * 0.5 - 0.01);
      expect(liquid.manualVolume!).toBeLessThanOrEqual(container.maxVolume);
    }
  });

  it('reflects the fill in the container’s running totals', () => {
    for (const seed of seeds) {
      const { container, liquid } = generateBeverage(seed);

      expect(container.currentVolume).toBeCloseTo(liquid.manualVolume!, 2);
      expect(container.currentWeight).toBeCloseTo(liquid.weight, 2);
    }
  });

  it('derives the liquid weight from its volume and density', () => {
    const { liquid } = generateBeverage('seed-a');

    expect(liquid.weight).toBeCloseTo(
      liquid.manualVolume! * DENSITY_MAP[liquid.densityCategory],
      2,
    );
  });

  it('describes the liquid from its beverage type', () => {
    for (const seed of seeds) {
      const { liquid } = generateBeverage(seed);
      const type = beverageTypes.find((candidate) => candidate.name === liquid.name)!;

      expect(type).toBeDefined();
      expect(liquid.description).toBe(type.description);
      expect(liquid.properties).toEqual(type.tags);
      expect(liquid.itemMajorType).toBe('beverage');
    }
  });

  it('prices the liquid by volume, and gives water away', () => {
    for (const seed of seeds) {
      const { liquid } = generateBeverage(seed);
      const type = beverageTypes.find((candidate) => candidate.name === liquid.name)!;

      expect(liquid.value).toBe(Math.ceil(liquid.manualVolume! * type.valuePerLiter));
      if (type.valuePerLiter === 0) {
        expect(liquid.value).toBe(0);
      }
    }
  });
});
