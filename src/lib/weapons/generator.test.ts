import { expect, describe, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import { describe as describeWeapon, generate } from './generator';
import { getDefaultConfig, type WeaponGeneratorConfig } from './config';
import * as SciFiWeaponTypes from './scifi';
import type { WeaponType } from './weapons';

function configFor(weaponTypes: WeaponType[], seed: string): WeaponGeneratorConfig {
  const config = getDefaultConfig(new RNG(seed));
  config.weaponTypes = weaponTypes;
  return config;
}

const energyRifle = SciFiWeaponTypes.all[0];

describe('getDefaultConfig', () => {
  it('starts with no weapon types', () => {
    expect(getDefaultConfig(new RNG('a')).weaponTypes).toEqual([]);
  });

  it('keeps the RNG it was given', () => {
    const rng = new RNG('a');

    expect(getDefaultConfig(rng).rng).toBe(rng);
  });
});

describe('generate', () => {
  it('is deterministic for a given seed', () => {
    expect(generate(configFor([energyRifle], 'gun'))).toEqual(
      generate(configFor([energyRifle], 'gun')),
    );
  });

  it('names the weapon with a model number and the weapon type', () => {
    const weapon = generate(configFor([energyRifle], 'named'));

    expect(weapon.name.endsWith(` ${energyRifle.name}`)).toBe(true);
    expect(weapon.name.length).toBeGreaterThan(energyRifle.name.length + 1);
  });

  it('takes its damage type from the weapon type', () => {
    expect(generate(configFor([energyRifle], 'damage')).damage).toBe(energyRifle.damageType);
  });

  it('leaves the maker unset, for the caller to fill in', () => {
    expect(generate(configFor([energyRifle], 'maker')).maker).toBe('');
  });

  it('gives between one and three cosmetics, all drawn from the weapon type', () => {
    const allCosmetics = energyRifle.cosmetics.flatMap((component) => component.options);

    for (let index = 0; index < 20; index++) {
      const weapon = generate(configFor([energyRifle], `cosmetic-${index}`));

      expect(weapon.cosmetics.length).toBeGreaterThanOrEqual(1);
      expect(weapon.cosmetics.length).toBeLessThanOrEqual(3);
      expect(weapon.cosmetics.every((cosmetic) => allCosmetics.includes(cosmetic))).toBe(true);
    }
  });

  it('gives between one and three effects, all drawn from the weapon type', () => {
    const allEffects = energyRifle.effects.flatMap((component) => component.options);

    for (let index = 0; index < 20; index++) {
      const weapon = generate(configFor([energyRifle], `effect-${index}`));

      expect(weapon.effects.length).toBeGreaterThanOrEqual(1);
      expect(weapon.effects.length).toBeLessThanOrEqual(3);
      expect(weapon.effects.every((effect) => allEffects.includes(effect))).toBe(true);
    }
  });

  it('describes the weapon using its own effects and cosmetics', () => {
    const weapon = generate(configFor([energyRifle], 'describe'));

    for (const effect of weapon.effects) {
      expect(weapon.description).toContain(effect);
    }
    for (const cosmetic of weapon.cosmetics) {
      expect(weapon.description).toContain(cosmetic);
    }
  });

  it('opens the description with one of the weapon type bases', () => {
    const weapon = generate(configFor([energyRifle], 'base'));

    expect(energyRifle.bases.some((base) => weapon.description.startsWith(base))).toBe(true);
  });

  it('ends the description with a full stop', () => {
    expect(generate(configFor([energyRifle], 'stop')).description).toMatch(/\.$/);
  });

  it('produces different weapons for different seeds', () => {
    const names = new Set(
      Array.from(
        { length: 10 },
        (_, index) => generate(configFor([energyRifle], `vary-${index}`)).name,
      ),
    );

    expect(names.size).toBeGreaterThan(1);
  });

  it('picks from every configured weapon type across seeds', () => {
    const chosen = new Set(
      Array.from({ length: 60 }, (_, index) => {
        const weapon = generate(configFor(SciFiWeaponTypes.all, `pick-${index}`));
        return SciFiWeaponTypes.all.find((type) => weapon.name.endsWith(type.name))?.name;
      }),
    );

    expect(chosen.size).toBeGreaterThan(1);
    expect(chosen.has(undefined)).toBe(false);
  });

  it('generates a valid weapon for every sci-fi weapon type', () => {
    for (const weaponType of SciFiWeaponTypes.all) {
      const weapon = generate(configFor([weaponType], `each-${weaponType.name}`));

      expect(weapon.name).toContain(weaponType.name);
      expect(weapon.damage).toBe(weaponType.damageType);
      expect(weapon.description).not.toContain('undefined');
    }
  });
});

describe('describe', () => {
  it('joins effects and cosmetics into one sentence', () => {
    const config = configFor([energyRifle], 'desc');
    const weapon = {
      name: 'X-1 energy rifle',
      maker: '',
      damage: 'energy',
      cosmetics: ['a short barrel'],
      effects: ['fires green bolts'],
      description: '',
    };

    const description = describeWeapon(weapon, energyRifle, config.rng);

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
