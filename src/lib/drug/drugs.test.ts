import { expect, describe, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import { generate, getDefaultConfig } from './drugs';
import * as DrugTypes from './drug_types';
import * as EffectTypes from './effect_types';

const STRENGTHS = ['powerful', 'strong', 'really potent', 'potent', 'weak', 'very weak'];

function generateDrug(seed: string) {
  return generate(getDefaultConfig(), new RNG(seed));
}

describe('getDefaultConfig', () => {
  it('offers every drug type and effect type', () => {
    const config = getDefaultConfig();

    expect(config.drugTypes.map((type) => type.name)).toEqual(
      DrugTypes.all().map((type) => type.name),
    );
    expect(config.effectTypes.map((type) => type.name)).toEqual(
      EffectTypes.all().map((type) => type.name),
    );
  });

  it('returns a fresh config each call so callers cannot mutate the default', () => {
    const first = getDefaultConfig();
    const originalLength = first.drugTypes.length;
    first.drugTypes.length = 0;

    expect(getDefaultConfig().drugTypes).toHaveLength(originalLength);
  });
});

describe('generate', () => {
  it('is deterministic for a given seed', () => {
    expect(generateDrug('spice')).toEqual(generateDrug('spice'));
  });

  it('produces different drugs for different seeds', () => {
    const descriptions = new Set(
      Array.from({ length: 10 }, (_, index) => generateDrug(`vary-${index}`).description),
    );

    expect(descriptions.size).toBeGreaterThan(1);
  });

  it('picks a drug type and effect type from the config', () => {
    const config = getDefaultConfig();
    const drug = generate(config, new RNG('typed'));

    expect(config.drugTypes).toContainEqual(drug.drugType);
    expect(config.effectTypes).toContainEqual(drug.effectType);
  });

  it('picks a delivery method its drug type actually supports', () => {
    for (let index = 0; index < 20; index++) {
      const drug = generateDrug(`method-${index}`);

      expect(drug.drugType.methods).toContain(drug.method);
    }
  });

  it('picks an effect description its effect type actually lists', () => {
    for (let index = 0; index < 20; index++) {
      const drug = generateDrug(`effect-${index}`);

      expect(drug.effectType.effects).toContain(drug.effectDescription);
    }
  });

  it('honours a config narrowed to a single drug type and effect type', () => {
    const drugType = DrugTypes.all()[0];
    const effectType = EffectTypes.all()[0];
    const drug = generate({ drugTypes: [drugType], effectTypes: [effectType] }, new RNG('narrow'));

    expect(drug.drugType).toEqual(drugType);
    expect(drug.effectType).toEqual(effectType);
  });

  it('gives the drug a strength from the fixed list', () => {
    expect(STRENGTHS).toContain(generateDrug('strong').strength);
  });

  it('gives the drug a two-word colour', () => {
    expect(generateDrug('colour').color.split(' ')).toHaveLength(2);
  });

  it('gives the drug a duration sentence', () => {
    expect(generateDrug('duration').duration).toMatch(/^One dose lasts for .+\.$/);
  });

  it('gives the drug a commonality sentence', () => {
    expect(generateDrug('common').commonality).toMatch(/\.$/);
  });

  it('lists between one and three side effects', () => {
    for (let index = 0; index < 20; index++) {
      const sideEffect = generateDrug(`side-${index}`).sideEffect;
      const count = sideEffect.split(/, | and /).filter(Boolean).length;

      expect(count).toBeGreaterThanOrEqual(1);
      expect(count).toBeLessThanOrEqual(3);
    }
  });

  it('names the drug in one of the three name styles', () => {
    const names = new Set(
      Array.from({ length: 40 }, (_, index) => generateDrug(`name-${index}`).name),
    );

    expect([...names].every((name) => name.length > 0)).toBe(true);
    expect([...names].some((name) => /-\d+$/.test(name))).toBe(true);
    expect([...names].some((name) => name.includes(' '))).toBe(true);
    expect([...names].some((name) => !name.includes(' ') && !name.includes('-'))).toBe(true);
  });

  it('keeps numbered names inside the 2 to 13 range', () => {
    for (let index = 0; index < 60; index++) {
      const match = /-(\d+)$/.exec(generateDrug(`number-${index}`).name);

      if (match) {
        expect(Number(match[1])).toBeGreaterThanOrEqual(2);
        expect(Number(match[1])).toBeLessThanOrEqual(13);
      }
    }
  });

  it('describes the drug using its own attributes', () => {
    const drug = generateDrug('described');

    expect(drug.description).toContain(drug.name);
    expect(drug.description).toContain(drug.strength);
    expect(drug.description).toContain(drug.effectType.name);
    expect(drug.description).toContain(drug.color);
    expect(drug.description).toContain(drug.drugType.name);
    expect(drug.description).toContain(drug.method);
    expect(drug.description).toContain(drug.effectDescription);
    expect(drug.description).toContain(drug.duration);
    expect(drug.description).toContain(drug.sideEffect);
    expect(drug.description).toContain(drug.commonality);
  });

  it('never leaves an undefined fragment in the description', () => {
    for (let index = 0; index < 40; index++) {
      expect(generateDrug(`clean-${index}`).description).not.toContain('undefined');
    }
  });
});

describe('DrugTypes.all', () => {
  it('lists drug types with unique names', () => {
    const names = DrugTypes.all().map((type) => type.name);

    expect(new Set(names).size).toBe(names.length);
  });

  it('gives every drug type at least one delivery method', () => {
    for (const type of DrugTypes.all()) {
      expect(type.methods.length).toBeGreaterThan(0);
      expect(type.methods.every((method) => method.length > 0)).toBe(true);
    }
  });
});

describe('EffectTypes.all', () => {
  it('lists effect types with unique names', () => {
    const names = EffectTypes.all().map((type) => type.name);

    expect(new Set(names).size).toBe(names.length);
  });

  it('gives every effect type at least one effect, written as a sentence', () => {
    for (const type of EffectTypes.all()) {
      expect(type.effects.length).toBeGreaterThan(0);
      for (const effect of type.effects) {
        expect(effect).toMatch(/\.$/);
      }
    }
  });
});
