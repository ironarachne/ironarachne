import { expect, describe, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import {
  generateRegionOfControl,
  getDefaultRegionOfControlGenerationConfig,
  getRegionTypeByName,
  getRegionTypeByScale,
  getRegionTypes,
  getRegionTypesForTechnologyLevel,
} from './regions_of_control';
import type { RegionOfControlGenerationConfig } from './regions_of_control';

function configFor(
  seed: string,
  overrides: Partial<RegionOfControlGenerationConfig> = {},
): RegionOfControlGenerationConfig {
  return { ...getDefaultRegionOfControlGenerationConfig(new RNG(seed)), ...overrides };
}

describe('getRegionTypes', () => {
  it('lists region types with unique names', () => {
    const names = getRegionTypes().map((type) => type.name);

    expect(new Set(names).size).toBe(names.length);
  });

  it('lists region types with unique scales', () => {
    const scales = getRegionTypes().map((type) => type.scale);

    expect(new Set(scales).size).toBe(scales.length);
  });

  it('gives every type a positive capacity and commonality', () => {
    for (const type of getRegionTypes()) {
      expect(type.population_capacity).toBeGreaterThan(0);
      expect(type.commonality).toBeGreaterThan(0);
    }
  });

  it('never lowers population capacity as scale rises', () => {
    const byScale = [...getRegionTypes()].sort((a, b) => a.scale - b.scale);

    for (let index = 1; index < byScale.length; index++) {
      expect(byScale[index].population_capacity).toBeGreaterThanOrEqual(
        byScale[index - 1].population_capacity,
      );
    }
  });

  it('spans a wide range of capacities from the smallest scale to the largest', () => {
    const byScale = [...getRegionTypes()].sort((a, b) => a.scale - b.scale);

    expect(byScale.at(-1)!.population_capacity).toBeGreaterThan(
      byScale[0].population_capacity * 100,
    );
  });

  it('returns a fresh list each call so callers cannot mutate the source', () => {
    const first = getRegionTypes();
    const originalName = first[0].name;
    first[0].name = 'mutated';

    expect(getRegionTypes()[0].name).toBe(originalName);
  });
});

describe('getRegionTypeByName', () => {
  it('returns the region type with that name', () => {
    expect(getRegionTypeByName('Settlement').scale).toBe(1);
  });

  it('matches names case-sensitively', () => {
    expect(() => getRegionTypeByName('settlement')).toThrow(
      'Region type with name settlement not found.',
    );
  });

  it('throws when no region type matches', () => {
    expect(() => getRegionTypeByName('Dyson Sphere')).toThrow(
      'Region type with name Dyson Sphere not found.',
    );
  });

  it('finds every listed region type by its own name', () => {
    for (const type of getRegionTypes()) {
      expect(getRegionTypeByName(type.name).scale).toBe(type.scale);
    }
  });
});

describe('getRegionTypeByScale', () => {
  it('returns the region type at that scale', () => {
    expect(getRegionTypeByScale(1).name).toBe('Settlement');
  });

  it('throws when no region type has that scale', () => {
    expect(() => getRegionTypeByScale(99)).toThrow('Region type with scale 99 not found.');
  });

  it('finds every listed region type by its own scale', () => {
    for (const type of getRegionTypes()) {
      expect(getRegionTypeByScale(type.scale).name).toBe(type.name);
    }
  });
});

describe('getRegionTypesForTechnologyLevel', () => {
  it('returns only types the technology level can reach', () => {
    const types = getRegionTypesForTechnologyLevel(3, getRegionTypes());

    expect(types.length).toBeGreaterThan(0);
    for (const type of types) {
      expect(type.technology_level_requirement).toBeLessThanOrEqual(3);
    }
  });

  it('includes a type whose requirement exactly matches the level', () => {
    const withRequirementTwo = getRegionTypes().filter(
      (type) => type.technology_level_requirement === 2,
    );

    if (withRequirementTwo.length > 0) {
      const names = getRegionTypesForTechnologyLevel(2, getRegionTypes()).map((type) => type.name);

      expect(names).toContain(withRequirementTwo[0].name);
    }
  });

  it('returns more types as the technology level rises', () => {
    expect(getRegionTypesForTechnologyLevel(10, getRegionTypes()).length).toBeGreaterThanOrEqual(
      getRegionTypesForTechnologyLevel(0, getRegionTypes()).length,
    );
  });

  it('throws when no type is reachable at that level', () => {
    expect(() => getRegionTypesForTechnologyLevel(-1, getRegionTypes())).toThrow(
      'No region types found for technology level -1.',
    );
  });

  it('throws when given an empty list of region types', () => {
    expect(() => getRegionTypesForTechnologyLevel(5, [])).toThrow(
      'No region types found for technology level 5.',
    );
  });
});

describe('getDefaultRegionOfControlGenerationConfig', () => {
  it('offers every region type', () => {
    expect(
      getDefaultRegionOfControlGenerationConfig(new RNG('default')).region_types.map(
        (type) => type.name,
      ),
    ).toEqual(getRegionTypes().map((type) => type.name));
  });

  it('defaults to a population density between 50 and 60 per cent of capacity', () => {
    expect(
      getDefaultRegionOfControlGenerationConfig(new RNG('default')).population_density_range,
    ).toEqual([0.5, 0.6]);
  });

  it('starts with no controlling civilization and technology level zero', () => {
    const config = getDefaultRegionOfControlGenerationConfig(new RNG('default'));

    expect(config.controlling_civilization).toBe('');
    expect(config.technology_level).toBe(0);
  });
});

describe('generateRegionOfControl', () => {
  it('is deterministic for a given seed', () => {
    expect(generateRegionOfControl(configFor('region'))).toEqual(
      generateRegionOfControl(configFor('region')),
    );
  });

  it('picks a region type the technology level allows', () => {
    for (let index = 0; index < 20; index++) {
      const region = generateRegionOfControl(configFor(`tech-${index}`, { technology_level: 3 }));

      expect(region.region_type.technology_level_requirement).toBeLessThanOrEqual(3);
    }
  });

  it('sets population from the region capacity and the density range', () => {
    for (let index = 0; index < 20; index++) {
      const region = generateRegionOfControl(configFor(`population-${index}`));
      const capacity = region.region_type.population_capacity;

      expect(region.population).toBeGreaterThanOrEqual(Math.floor(capacity * 0.5));
      expect(region.population).toBeLessThanOrEqual(Math.ceil(capacity * 0.6));
    }
  });

  it('records the controlling civilization it was given', () => {
    const region = generateRegionOfControl(
      configFor('controlled', { controlling_civilization: 'Terran Republic' }),
    );

    expect(region.controlling_civilization).toBe('Terran Republic');
  });

  it('leaves the name and description for the caller to fill in', () => {
    const region = generateRegionOfControl(configFor('unnamed'));

    expect(region.name).toBe('');
    expect(region.description).toBe('');
  });

  it('honours a config narrowed to a single region type', () => {
    const settlement = getRegionTypeByName('Settlement');
    const region = generateRegionOfControl(
      configFor('narrow', { region_types: [settlement], technology_level: 10 }),
    );

    expect(region.region_type.name).toBe('Settlement');
  });

  it('throws when no region type is reachable at the configured technology level', () => {
    expect(() =>
      generateRegionOfControl(configFor('unreachable', { technology_level: -1 })),
    ).toThrow('No region types found for technology level -1.');
  });
});
