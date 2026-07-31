import { expect, describe, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import {
  describeMilitary,
  generateCivilization,
  generateCivilizationName,
  generateMilitary,
  getCivilizationDescription,
  getDefaultCivilizationGenerationConfig,
  getFriendlyPopulation,
} from './civilizations';
import type { CivilizationGenerationConfig, GovernmentType, Military } from './civilizations';

function configFor(
  seed: string,
  overrides: Partial<CivilizationGenerationConfig> = {},
): CivilizationGenerationConfig {
  return { ...getDefaultCivilizationGenerationConfig(), rng: new RNG(seed), ...overrides };
}

describe('getDefaultCivilizationGenerationConfig', () => {
  it('spans populations from a thousand to a billion', () => {
    expect(getDefaultCivilizationGenerationConfig().population_range).toEqual([1000, 1000000000]);
  });

  it('spans technology and military strength from 1 to 10', () => {
    const config = getDefaultCivilizationGenerationConfig();

    expect(config.technology_level_range).toEqual([1, 10]);
    expect(config.military_strength_range).toEqual([1, 10]);
  });

  it('supplies an RNG', () => {
    expect(getDefaultCivilizationGenerationConfig().rng).toBeInstanceOf(RNG);
  });
});

describe('getFriendlyPopulation', () => {
  it('gives an exact figure below a thousand', () => {
    expect(getFriendlyPopulation(999)).toBe('999');
    expect(getFriendlyPopulation(0)).toBe('0');
  });

  it('rounds to thousands from a thousand up', () => {
    expect(getFriendlyPopulation(1000)).toBe('1 thousand');
    expect(getFriendlyPopulation(1500)).toBe('2 thousand');
    expect(getFriendlyPopulation(999999)).toBe('1000 thousand');
  });

  it('rounds to millions from a million up', () => {
    expect(getFriendlyPopulation(1000000)).toBe('1 million');
    expect(getFriendlyPopulation(2400000)).toBe('2 million');
  });

  it('rounds to billions from a billion up', () => {
    expect(getFriendlyPopulation(1000000000)).toBe('1 billion');
    expect(getFriendlyPopulation(7500000000)).toBe('8 billion');
  });

  it('rounds to trillions from a trillion up', () => {
    expect(getFriendlyPopulation(1000000000000)).toBe('1 trillion');
    expect(getFriendlyPopulation(3200000000000)).toBe('3 trillion');
  });
});

describe('generateMilitary', () => {
  it('is deterministic for a given seed', () => {
    expect(generateMilitary([0.001, 0.01], [1, 10], new RNG('army'))).toEqual(
      generateMilitary([0.001, 0.01], [1, 10], new RNG('army')),
    );
  });

  it('keeps size inside the requested range', () => {
    for (let index = 0; index < 20; index++) {
      const military = generateMilitary([0.001, 0.01], [1, 10], new RNG(`size-${index}`));

      expect(military.size).toBeGreaterThanOrEqual(0.001);
      expect(military.size).toBeLessThanOrEqual(0.01);
    }
  });

  it('keeps quality inside the requested range', () => {
    for (let index = 0; index < 20; index++) {
      const military = generateMilitary([0.001, 0.01], [3, 6], new RNG(`quality-${index}`));

      expect(military.quality).toBeGreaterThanOrEqual(3);
      expect(military.quality).toBeLessThanOrEqual(6);
    }
  });

  it('clamps equipment and training levels to 1 through 10', () => {
    for (let index = 0; index < 40; index++) {
      const military = generateMilitary([0.001, 0.01], [1, 10], new RNG(`clamp-${index}`));

      expect(military.equipment_level).toBeGreaterThanOrEqual(1);
      expect(military.equipment_level).toBeLessThanOrEqual(10);
      expect(military.training_level).toBeGreaterThanOrEqual(1);
      expect(military.training_level).toBeLessThanOrEqual(10);
    }
  });

  it('never gives equipment a higher level than the overall quality', () => {
    for (let index = 0; index < 40; index++) {
      const military = generateMilitary([0.001, 0.01], [1, 10], new RNG(`equip-${index}`));

      expect(military.equipment_level).toBeLessThanOrEqual(military.quality);
    }
  });
});

describe('describeMilitary', () => {
  const military: Military = { quality: 5, size: 0.01, equipment_level: 4, training_level: 6 };

  it('names the quality band matching the quality score', () => {
    expect(describeMilitary(military)).toContain('a good military');
  });

  it('describes the weakest and strongest quality bands', () => {
    expect(describeMilitary({ ...military, quality: 1 })).toContain('a terrible military');
    expect(describeMilitary({ ...military, quality: 10 })).toContain('an unstoppable military');
  });

  it('formats size as a percentage of the population', () => {
    expect(describeMilitary(military)).toContain('a size of 1% of the population');
  });

  it('reports equipment and training levels', () => {
    expect(describeMilitary(military)).toContain('an equipment level of 4');
    expect(describeMilitary(military)).toContain('a training level of 6');
  });

  it('uses the right article for each quality band', () => {
    expect(describeMilitary({ ...military, quality: 8 })).toContain('an elite military');
    expect(describeMilitary({ ...military, quality: 6 })).toContain('a strong military');
  });
});

describe('generateCivilizationName', () => {
  const governmentType: GovernmentType = {
    name: 'republic',
    adjective: 'republican',
    description: 'A republic.',
    name_options: ['{name} Republic'],
    commonality: 5,
  };

  it('is deterministic for a given seed', () => {
    expect(generateCivilizationName(governmentType, new RNG('named'))).toBe(
      generateCivilizationName(governmentType, new RNG('named')),
    );
  });

  it('substitutes the generated name into the template', () => {
    const name = generateCivilizationName(governmentType, new RNG('named'));

    expect(name.endsWith(' Republic')).toBe(true);
    expect(name).not.toContain('{name}');
  });

  it('uses every name option across enough seeds', () => {
    const multiOption: GovernmentType = {
      ...governmentType,
      name_options: ['{name} Republic', 'Republic of {name}'],
    };
    const used = new Set(
      Array.from({ length: 40 }, (_, index) =>
        generateCivilizationName(multiOption, new RNG(`option-${index}`)).startsWith('Republic of'),
      ),
    );

    expect(used.size).toBe(2);
  });
});

describe('generateCivilization', () => {
  it('is deterministic for a given seed', () => {
    expect(generateCivilization(configFor('civ'))).toEqual(generateCivilization(configFor('civ')));
  });

  it('produces different civilizations for different seeds', () => {
    const names = new Set(
      Array.from(
        { length: 10 },
        (_, index) => generateCivilization(configFor(`vary-${index}`)).name,
      ),
    );

    expect(names.size).toBeGreaterThan(1);
  });

  it('keeps population inside the configured range', () => {
    const civilization = generateCivilization(
      configFor('population', { population_range: [500, 600] }),
    );

    expect(civilization.population).toBeGreaterThanOrEqual(500);
    expect(civilization.population).toBeLessThanOrEqual(600);
  });

  it('keeps technology level inside the configured range', () => {
    const civilization = generateCivilization(
      configFor('tech', { technology_level_range: [4, 4] }),
    );

    expect(civilization.technology_level).toBe(4);
  });

  it('keeps military quality inside the configured strength range', () => {
    const civilization = generateCivilization(
      configFor('strength', { military_strength_range: [7, 7] }),
    );

    expect(civilization.military.quality).toBe(7);
  });

  it('gives the civilization a government type and an economy type', () => {
    const civilization = generateCivilization(configFor('types'));

    expect(civilization.government_type.name).toBeTruthy();
    expect(civilization.economy_type.name).toBeTruthy();
  });

  it('describes the civilization it generated', () => {
    const civilization = generateCivilization(configFor('described'));

    expect(civilization.description).toBe(getCivilizationDescription(civilization));
    expect(civilization.description).not.toContain('undefined');
  });
});

describe('getCivilizationDescription', () => {
  it('mentions the name, government, population, technology, economy and military', () => {
    const civilization = generateCivilization(configFor('full'));
    const description = getCivilizationDescription(civilization);

    expect(description).toContain(civilization.name);
    expect(description).toContain(civilization.government_type.adjective);
    expect(description).toContain(getFriendlyPopulation(civilization.population));
    expect(description).toContain(`technology level of ${civilization.technology_level}`);
    expect(description).toContain(civilization.economy_type.adjective);
    expect(description).toContain(describeMilitary(civilization.military));
  });

  it('reads as a set of complete sentences', () => {
    const description = getCivilizationDescription(generateCivilization(configFor('sentences')));

    expect(description.startsWith('The ')).toBe(true);
    expect(description.endsWith('.')).toBe(true);
  });
});
