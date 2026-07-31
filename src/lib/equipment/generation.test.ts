import { describe, expect, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import { armorTypes } from './armor';
import type { Armor, Weapon } from './equipment_types';
import {
  createBaseArmor,
  createBaseWeapon,
  generateItem,
  getArmorGenerationConfig,
  getDefaultGenerationConfig,
  getWeaponGenerationConfig,
  roundValue,
} from './generation';
import { weaponTypes } from './weapons';

const seeds = ['a', 'b', 'c', 'd', 'e', 'f'];

describe('createBaseWeapon', () => {
  const type = weaponTypes[0];

  it('takes its shape from the weapon type', () => {
    const weapon = createBaseWeapon(type, new RNG('seed-a'));

    expect(weapon.name).toBe(type.name);
    expect(weapon.itemMajorType).toBe('weapon');
    expect(weapon.itemMinorType).toBe(type.name);
    expect(weapon.value).toBe(type.baseValue);
    expect(weapon.weaponType).toEqual(type);
    expect(weapon.allowedMaterialTypes).toEqual(type.allowedMaterialTypes);
  });

  it('tags the weapon with its own name and damage type', () => {
    const weapon = createBaseWeapon(type, new RNG('seed-a'));

    expect(weapon.properties).toContain('weapon');
    expect(weapon.properties).toContain(type.name);
    expect(weapon.properties).toContain(type.baseActions[0].damageType);
  });

  it('omits the damage type tag when the type has no actions', () => {
    const weapon = createBaseWeapon({ ...type, baseActions: [] }, new RNG('seed-a'));

    expect(weapon.properties).toEqual(['weapon', type.name]);
    expect(weapon.combatProfile.power).toBe(0);
  });

  it('copies the actions rather than sharing them', () => {
    const weapon = createBaseWeapon(type, new RNG('seed-a'));

    expect(weapon.actions).toEqual(type.baseActions);
    expect(weapon.actions).not.toBe(type.baseActions);
  });

  it('is reproducible from a seeded rng', () => {
    expect(createBaseWeapon(type, new RNG('seed-a'))).toEqual(
      createBaseWeapon(type, new RNG('seed-a')),
    );
  });
});

describe('createBaseArmor', () => {
  const type = armorTypes[0];

  it('takes its shape from the armor type', () => {
    const armor = createBaseArmor(type, new RNG('seed-a'));

    expect(armor.name).toBe(type.name);
    expect(armor.itemMajorType).toBe('armor');
    expect(armor.itemMinorType).toBe(type.name);
    expect(armor.value).toBe(type.baseValue);
    expect(armor.armorType).toEqual(type);
    expect(armor.combatProfile.defense).toBe(type.defense);
    expect(armor.properties).toEqual(['armor', type.name]);
  });

  it('is reproducible from a seeded rng', () => {
    expect(createBaseArmor(type, new RNG('seed-a'))).toEqual(
      createBaseArmor(type, new RNG('seed-a')),
    );
  });
});

describe('roundValue', () => {
  it.each([
    [0, 0],
    [999, 999],
    [1004, 1000],
    [1005, 1010],
    [9999, 10000],
    [10049, 10000],
    [10050, 10100],
    [100499, 100000],
    [100500, 101000],
    [1004999, 1000000],
    [1005000, 1010000],
  ])('rounds %i to %i', (input, expected) => {
    expect(roundValue(input)).toBe(expected);
  });

  it('leaves values below 1000 exact', () => {
    for (const value of [1, 7, 123, 999]) {
      expect(roundValue(value)).toBe(value);
    }
  });

  it('never rounds to a smaller order of magnitude', () => {
    for (const value of [1500, 15000, 150000, 1500000]) {
      expect(roundValue(value)).toBeGreaterThan(value * 0.9);
    }
  });
});

describe('getDefaultGenerationConfig', () => {
  it('enables every phase with populated tables', () => {
    const config = getDefaultGenerationConfig();

    expect(config.itemMajorType).toBe('any');
    expect(config.itemMinorType).toBeUndefined();
    expect(config.useRefine).toBe(true);
    expect(config.useEnchant).toBe(true);
    expect(config.useDecorate).toBe(true);
    expect(config.useUniqueNames).toBe(false);
    expect(config.materials.length).toBeGreaterThan(0);
    expect(config.refinements.length).toBeGreaterThan(0);
    expect(config.enchantments.length).toBeGreaterThan(0);
    expect(config.decorations.length).toBeGreaterThan(0);
  });
});

describe('getWeaponGenerationConfig', () => {
  it('narrows the config to weapons', () => {
    expect(getWeaponGenerationConfig().itemMajorType).toBe('weapon');
    expect(getWeaponGenerationConfig().itemMinorType).toBeUndefined();
  });

  it('carries a minor type through when one is given', () => {
    expect(getWeaponGenerationConfig('club').itemMinorType).toBe('club');
  });
});

describe('getArmorGenerationConfig', () => {
  it('narrows the config to armor', () => {
    expect(getArmorGenerationConfig().itemMajorType).toBe('armor');
    expect(getArmorGenerationConfig().itemMinorType).toBeUndefined();
  });

  it('carries a minor type through when one is given', () => {
    expect(getArmorGenerationConfig('hide armor').itemMinorType).toBe('hide armor');
  });
});

describe('generateItem', () => {
  it('is reproducible from a seed', () => {
    const config = getDefaultGenerationConfig();

    expect(generateItem('seed-a', config)).toEqual(generateItem('seed-a', config));
  });

  it('varies with the seed', () => {
    const config = getDefaultGenerationConfig();
    const names = new Set(seeds.map((seed) => generateItem(seed, config).name));

    expect(names.size).toBeGreaterThan(1);
  });

  it('produces either a weapon or armor from the default config', () => {
    for (const seed of seeds) {
      expect(['weapon', 'armor']).toContain(
        generateItem(seed, getDefaultGenerationConfig()).itemMajorType,
      );
    }
  });

  it('honours a weapon-only config', () => {
    for (const seed of seeds) {
      expect(generateItem(seed, getWeaponGenerationConfig()).itemMajorType).toBe('weapon');
    }
  });

  it('honours an armor-only config', () => {
    for (const seed of seeds) {
      expect(generateItem(seed, getArmorGenerationConfig()).itemMajorType).toBe('armor');
    }
  });

  it('honours a requested weapon minor type', () => {
    for (const seed of seeds) {
      const item = generateItem(seed, getWeaponGenerationConfig('club')) as Weapon;

      expect(item.weaponType.name).toBe('club');
    }
  });

  it('honours a requested armor minor type', () => {
    for (const seed of seeds) {
      const item = generateItem(seed, getArmorGenerationConfig('hide armor')) as Armor;

      expect(item.armorType.name).toBe('hide armor');
    }
  });

  it('always applies a material', () => {
    for (const seed of seeds) {
      expect(generateItem(seed, getDefaultGenerationConfig()).material).toBeDefined();
    }
  });

  it('skips every optional phase when they are all disabled', () => {
    const config = {
      ...getDefaultGenerationConfig(),
      useRefine: false,
      useEnchant: false,
      useDecorate: false,
    };

    for (const seed of seeds) {
      const item = generateItem(seed, config);

      expect(item.refinement).toBeUndefined();
      expect(item.enchantment).toBeUndefined();
      expect(item.decoration).toBeUndefined();
    }
  });

  it.each([
    ['refinement', 'useRefine', 'refinementChance'],
    ['enchantment', 'useEnchant', 'enchantmentChance'],
    ['decoration', 'useDecorate', 'decorationChance'],
  ] as const)('applies a %s when its chance is certain', (field, useFlag, chanceFlag) => {
    const config = {
      ...getDefaultGenerationConfig(),
      useRefine: false,
      useEnchant: false,
      useDecorate: false,
      [useFlag]: true,
      [chanceFlag]: 100,
    };

    const applied = seeds.filter((seed) => generateItem(seed, config)[field] !== undefined);

    expect(applied.length).toBeGreaterThan(0);
  });

  it('never applies an optional phase at a chance of zero', () => {
    const config = {
      ...getDefaultGenerationConfig(),
      refinementChance: 0,
      enchantmentChance: 0,
      decorationChance: 0,
    };

    for (const seed of seeds) {
      const item = generateItem(seed, config);

      expect(item.refinement).toBeUndefined();
      expect(item.enchantment).toBeUndefined();
      expect(item.decoration).toBeUndefined();
    }
  });

  it('adds a unique name only when asked', () => {
    const config = getDefaultGenerationConfig();

    expect(generateItem('seed-a', config).uniqueName).toBeUndefined();

    const named = generateItem('seed-a', { ...config, useUniqueNames: true });

    expect(named.uniqueName).toBeDefined();
    expect(named.uniqueName!.length).toBeGreaterThan(0);
  });

  it('rounds the final value and writes a description', () => {
    for (const seed of seeds) {
      const item = generateItem(seed, getDefaultGenerationConfig());

      expect(item.value).toBe(roundValue(item.value));
      expect(item.description.length).toBeGreaterThan(0);
    }
  });
});
