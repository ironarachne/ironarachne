import { expect, describe, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import WeaponGenerator from './generator';
import WeaponGeneratorConfig from './config';
import * as SciFiWeaponTypes from './scifi';
import type { WeaponType } from './weapons';

function generatorFor(weaponTypes: WeaponType[], seed: string): WeaponGenerator {
  const rng = new RNG(seed);
  const generator = new WeaponGenerator(rng);
  const config = new WeaponGeneratorConfig(rng);
  config.weaponTypes = weaponTypes;
  generator.config = config;
  return generator;
}

const energyRifle = SciFiWeaponTypes.all[0];

describe('WeaponGeneratorConfig', () => {
  it('starts with no weapon types', () => {
    expect(new WeaponGeneratorConfig(new RNG('a')).weaponTypes).toEqual([]);
  });

  it('keeps the RNG it was given', () => {
    const rng = new RNG('a');

    expect(new WeaponGeneratorConfig(rng).rng).toBe(rng);
  });
});

describe('WeaponGenerator', () => {
  it('keeps the RNG it was given', () => {
    const rng = new RNG('a');

    expect(new WeaponGenerator(rng).rng).toBe(rng);
  });

  it('starts with an empty config', () => {
    expect(new WeaponGenerator(new RNG('a')).config.weaponTypes).toEqual([]);
  });

  it('seeds itself from the clock when given no RNG', () => {
    expect(new WeaponGenerator().rng).toBeInstanceOf(RNG);
  });
});

describe('WeaponGenerator.generate', () => {
  it('is deterministic for a given seed', () => {
    expect(generatorFor([energyRifle], 'gun').generate()).toEqual(
      generatorFor([energyRifle], 'gun').generate(),
    );
  });

  it('names the weapon with a model number and the weapon type', () => {
    const weapon = generatorFor([energyRifle], 'named').generate();

    expect(weapon.name.endsWith(` ${energyRifle.name}`)).toBe(true);
    expect(weapon.name.length).toBeGreaterThan(energyRifle.name.length + 1);
  });

  it('takes its damage type from the weapon type', () => {
    expect(generatorFor([energyRifle], 'damage').generate().damage).toBe(energyRifle.damageType);
  });

  it('leaves the maker unset, for the caller to fill in', () => {
    expect(generatorFor([energyRifle], 'maker').generate().maker).toBe('');
  });

  it('gives between one and three cosmetics, all drawn from the weapon type', () => {
    const allCosmetics = energyRifle.cosmetics.flatMap((component) => component.options);

    for (let index = 0; index < 20; index++) {
      const weapon = generatorFor([energyRifle], `cosmetic-${index}`).generate();

      expect(weapon.cosmetics.length).toBeGreaterThanOrEqual(1);
      expect(weapon.cosmetics.length).toBeLessThanOrEqual(3);
      expect(weapon.cosmetics.every((cosmetic) => allCosmetics.includes(cosmetic))).toBe(true);
    }
  });

  it('gives between one and three effects, all drawn from the weapon type', () => {
    const allEffects = energyRifle.effects.flatMap((component) => component.options);

    for (let index = 0; index < 20; index++) {
      const weapon = generatorFor([energyRifle], `effect-${index}`).generate();

      expect(weapon.effects.length).toBeGreaterThanOrEqual(1);
      expect(weapon.effects.length).toBeLessThanOrEqual(3);
      expect(weapon.effects.every((effect) => allEffects.includes(effect))).toBe(true);
    }
  });

  it('describes the weapon using its own effects and cosmetics', () => {
    const weapon = generatorFor([energyRifle], 'describe').generate();

    for (const effect of weapon.effects) {
      expect(weapon.description).toContain(effect);
    }
    for (const cosmetic of weapon.cosmetics) {
      expect(weapon.description).toContain(cosmetic);
    }
  });

  it('opens the description with one of the weapon type bases', () => {
    const weapon = generatorFor([energyRifle], 'base').generate();

    expect(energyRifle.bases.some((base) => weapon.description.startsWith(base))).toBe(true);
  });

  it('ends the description with a full stop', () => {
    expect(generatorFor([energyRifle], 'stop').generate().description).toMatch(/\.$/);
  });

  it('produces different weapons for different seeds', () => {
    const names = new Set(
      Array.from(
        { length: 10 },
        (_, index) => generatorFor([energyRifle], `vary-${index}`).generate().name,
      ),
    );

    expect(names.size).toBeGreaterThan(1);
  });

  it('picks from every configured weapon type across seeds', () => {
    const chosen = new Set(
      Array.from({ length: 60 }, (_, index) => {
        const weapon = generatorFor(SciFiWeaponTypes.all, `pick-${index}`).generate();
        return SciFiWeaponTypes.all.find((type) => weapon.name.endsWith(type.name))?.name;
      }),
    );

    expect(chosen.size).toBeGreaterThan(1);
    expect(chosen.has(undefined)).toBe(false);
  });

  it('generates a valid weapon for every sci-fi weapon type', () => {
    for (const weaponType of SciFiWeaponTypes.all) {
      const weapon = generatorFor([weaponType], `each-${weaponType.name}`).generate();

      expect(weapon.name).toContain(weaponType.name);
      expect(weapon.damage).toBe(weaponType.damageType);
      expect(weapon.description).not.toContain('undefined');
    }
  });
});

describe('WeaponGenerator.describe', () => {
  it('joins effects and cosmetics into one sentence', () => {
    const generator = generatorFor([energyRifle], 'desc');
    const weapon = {
      name: 'X-1 energy rifle',
      maker: '',
      damage: 'energy',
      cosmetics: ['a short barrel'],
      effects: ['fires green bolts'],
      description: '',
    };

    const description = generator.describe(weapon, energyRifle);

    expect(description).toContain('fires green bolts and has a short barrel.');
  });
});

describe('scifi weapon types', () => {
  it('lists weapon types with unique names', () => {
    const names = SciFiWeaponTypes.all.map((type) => type.name);

    expect(new Set(names).size).toBe(names.length);
  });

  it('gives every type bases, cosmetics, effects and a damage type', () => {
    for (const type of SciFiWeaponTypes.all) {
      expect(type.bases.length).toBeGreaterThan(0);
      expect(type.cosmetics.length).toBeGreaterThan(0);
      expect(type.effects.length).toBeGreaterThan(0);
      expect(type.damageType).toBeTruthy();
    }
  });

  it('gives every component at least one option', () => {
    for (const type of SciFiWeaponTypes.all) {
      for (const component of [...type.cosmetics, ...type.effects]) {
        expect(component.options.length).toBeGreaterThan(0);
      }
    }
  });

  it('gives every type a sensible hand count and range', () => {
    for (const type of SciFiWeaponTypes.all) {
      expect([1, 2]).toContain(type.hands);
      expect(['short', 'long']).toContain(type.range);
    }
  });
});
