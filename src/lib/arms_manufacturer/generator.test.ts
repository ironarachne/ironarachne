import { expect, describe, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import type { ArmsManufacturer } from './arms_manufacturer';
import {
  generate as generateArmsManufacturer,
  randomName,
  randomOutlook,
  randomReputation,
} from './generator';
import { SciFiWeaponTypes } from '$lib/weapons';

const SUFFIXES = [
  'Heavy Industries',
  'Arms, Limited',
  'Incorporated',
  'Consolidated',
  'Corporation',
  'Applied Sciences',
];

function generate(seed: string): ArmsManufacturer {
  return generateArmsManufacturer(new RNG(seed));
}

describe('generate', () => {
  it('is deterministic for a given seed', () => {
    expect(generate('acme')).toEqual(generate('acme'));
  });

  it('produces different manufacturers for different seeds', () => {
    const names = new Set(Array.from({ length: 10 }, (_, index) => generate(`vary-${index}`).name));

    expect(names.size).toBeGreaterThan(1);
  });

  it('returns a manufacturer carrying a name, a description and models', () => {
    const manufacturer = generate('type');

    expect(typeof manufacturer.name).toBe('string');
    expect(typeof manufacturer.description).toBe('string');
    expect(Array.isArray(manufacturer.models)).toBe(true);
  });

  it('names the manufacturer with a made-up word and a corporate suffix', () => {
    const name = generate('named').name;

    expect(SUFFIXES.some((suffix) => name.endsWith(suffix))).toBe(true);
    expect(name.split(' ')[0].length).toBeGreaterThan(0);
  });

  it('uses every suffix across enough seeds', () => {
    const used = new Set(
      Array.from({ length: 120 }, (_, index) => {
        const name = generate(`suffix-${index}`).name;
        return SUFFIXES.find((suffix) => name.endsWith(suffix));
      }),
    );

    expect(used.size).toBe(SUFFIXES.length);
    expect(used.has(undefined)).toBe(false);
  });

  it('opens the description with the manufacturer name', () => {
    const manufacturer = generate('described');

    expect(manufacturer.description.startsWith(manufacturer.name)).toBe(true);
  });

  it('states a specialty, an outlook and a reputation', () => {
    const description = generate('described').description;

    expect(description).toMatch(/(specializes in|is known for their) .+s\. /);
    expect(description).toMatch(/(They|They are|Their) /);
    expect(description).not.toContain('undefined');
  });

  it('names a real weapon type as its specialty', () => {
    const description = generate('specialty').description;

    expect(SciFiWeaponTypes.all.some((type) => description.includes(`${type.name}s.`))).toBe(true);
  });

  it('generates between three and six models', () => {
    for (let index = 0; index < 20; index++) {
      const models = generate(`models-${index}`).models;

      expect(models.length).toBeGreaterThanOrEqual(3);
      expect(models.length).toBeLessThanOrEqual(6);
    }
  });

  it('gives every model a name, damage type and description', () => {
    for (const model of generate('complete').models) {
      expect(model.name).toBeTruthy();
      expect(model.damage).toBeTruthy();
      expect(model.description).toBeTruthy();
      expect(model.description).not.toContain('undefined');
    }
  });

  it('builds its models from at most two weapon types, the specialty and a secondary', () => {
    for (let index = 0; index < 10; index++) {
      const models = generate(`types-${index}`).models;
      const typeNames = new Set(
        models.map(
          (model) => SciFiWeaponTypes.all.find((type) => model.name.endsWith(type.name))?.name,
        ),
      );

      expect(typeNames.has(undefined)).toBe(false);
      expect(typeNames.size).toBeLessThanOrEqual(2);
    }
  });

  it('never picks the same weapon type as both specialty and secondary', () => {
    for (let index = 0; index < 30; index++) {
      const description = generate(`distinct-${index}`).description;
      const specialty = SciFiWeaponTypes.all.find((type) => description.includes(`${type.name}s.`));

      expect(specialty).toBeDefined();
    }
  });
});

describe('randomOutlook', () => {
  it('is deterministic for a given seed', () => {
    expect(randomOutlook(new RNG('o'))).toBe(randomOutlook(new RNG('o')));
  });

  it('returns a sentence starting with a space', () => {
    const outlook = randomOutlook(new RNG('o'));

    expect(outlook.startsWith(' ')).toBe(true);
    expect(outlook).toMatch(/\.$/);
  });

  it('varies across seeds', () => {
    const outlooks = new Set(
      Array.from({ length: 30 }, (_, index) => randomOutlook(new RNG(`o${index}`))),
    );

    expect(outlooks.size).toBeGreaterThan(1);
  });
});

describe('randomReputation', () => {
  it('is deterministic for a given seed', () => {
    expect(randomReputation(new RNG('r'))).toBe(randomReputation(new RNG('r')));
  });

  it('returns a sentence starting with a space', () => {
    const reputation = randomReputation(new RNG('r'));

    expect(reputation.startsWith(' ')).toBe(true);
    expect(reputation).toMatch(/\.$/);
  });

  it('varies across seeds', () => {
    const reputations = new Set(
      Array.from({ length: 30 }, (_, index) => randomReputation(new RNG(`r${index}`))),
    );

    expect(reputations.size).toBeGreaterThan(1);
  });
});

describe('randomName', () => {
  it('is deterministic for a given seed', () => {
    expect(randomName(new RNG('n'))).toBe(randomName(new RNG('n')));
  });

  it('joins a name fragment to a suffix with a space', () => {
    const name = randomName(new RNG('n'));

    expect(name).toContain(' ');
    expect(SUFFIXES.some((suffix) => name.endsWith(suffix))).toBe(true);
  });
});
