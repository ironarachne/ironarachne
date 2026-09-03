import { describe, expect, it } from 'vitest';

import { generateItem, getDefaultGenerationConfig } from './generation';
import { toItemSnapshot } from './item_snapshot';
import {
  WEAPON_ANY,
  WEAPON_RANGE_CHOICES,
  WEAPON_TOOL_PATH,
  defaultWeaponGeneratorConfigRecord,
  readWeaponGeneratorConfig,
  resolveWeaponTheme,
  rollWeapon,
  rollWeaponSnapshot,
  toWeaponGenerationConfig,
} from './weapon_roll';
import { weaponTypes } from './weapons';

const CONFIG = defaultWeaponGeneratorConfigRecord();

/** Stand-in for the domain names the page reads out of `$lib/religion`. */
const THEMES = ['air', 'animals', 'fire', 'war', 'water'];

describe('the Category control, which used to crash the page', () => {
  it('threw before #69, because "melee" names no weapon type', () => {
    // The bug, stated as the thing that is no longer true: `melee` and `ranged` were passed
    // through `itemMinorType`, which matches a type's *name* — "battleaxe", "crossbow". The filter
    // came back empty, `rng.item([])` was `undefined`, and generation threw.
    expect(weaponTypes.map((type) => type.name)).not.toContain('melee');
    expect(weaponTypes.map((type) => type.rangeCategory)).toContain('melee');
  });

  it('narrows the table by range category instead', () => {
    for (const rangeCategory of ['melee', 'ranged'] as const) {
      for (let attempt = 0; attempt < 20; attempt++) {
        const weapon = rollWeapon(`range-${attempt}`, { ...CONFIG, rangeCategory });
        const type = weaponTypes.find((entry) => entry.name === weapon.itemMinorType);

        expect(type?.rangeCategory, `${rangeCategory} ${attempt}`).toBe(rangeCategory);
      }
    }
  });

  it('widens rather than throwing when a type name matches nothing', () => {
    // The same discipline the rest of the pass applies to a stored value this build no longer
    // recognises: an item from a wider table beats no item at all.
    const config = getDefaultGenerationConfig();
    config.itemMajorType = 'weapon';
    config.itemMinorType = 'plasma glaive';

    expect(() => generateItem('widened', config)).not.toThrow();
  });
});

describe('rollWeapon', () => {
  it('gives the same weapon for the same seed and settings', () => {
    // Requirement 2.2.
    expect(toItemSnapshot(rollWeapon('fixed', CONFIG))).toEqual(
      toItemSnapshot(rollWeapon('fixed', CONFIG)),
    );
  });

  it('gives a different weapon for a different seed', () => {
    expect(toItemSnapshot(rollWeapon('one', CONFIG))).not.toEqual(
      toItemSnapshot(rollWeapon('two', CONFIG)),
    );
  });

  it('always rolls a weapon, and always names it', () => {
    const weapon = rollWeapon('named', CONFIG);

    expect(weapon.itemMajorType).toBe('weapon');
    expect(weapon.uniqueName).toBeTypeOf('string');
    expect(weapon.uniqueName).not.toBe('');
  });

  it('themes the enchantment on the domain asked for', () => {
    const weapon = rollWeapon('themed', { ...CONFIG, theme: 'fire' });

    expect(weapon.enchantment).toBeDefined();
    expect(weapon.decoration).toBeDefined();
  });

  it('draws from the whole table for "any", which is what "any theme" says', () => {
    expect(() => rollWeapon('untethered', { ...CONFIG, theme: WEAPON_ANY })).not.toThrow();
    expect(toWeaponGenerationConfig(CONFIG).enchantments.length).toBeGreaterThan(
      toWeaponGenerationConfig({ ...CONFIG, theme: 'fire' }).enchantments.length,
    );
  });
});

describe('resolveWeaponTheme', () => {
  it('takes the theme from the seed rather than from the page', () => {
    // The second half of this tool's 2.2 failure, and the harder half to see: the seed control
    // worked, and the theme behind it came from the page's own stream.
    const first = resolveWeaponTheme('a-fixed-seed', WEAPON_ANY, THEMES);

    expect(resolveWeaponTheme('a-fixed-seed', WEAPON_ANY, THEMES)).toBe(first);
    expect(THEMES).toContain(first);
  });

  it('draws a different theme for a different seed', () => {
    const drawn = new Set(
      ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map((seed) =>
        resolveWeaponTheme(seed, WEAPON_ANY, THEMES),
      ),
    );

    expect(drawn.size).toBeGreaterThan(1);
  });

  it('keeps a theme that was asked for', () => {
    expect(resolveWeaponTheme('seed', 'fire', THEMES)).toBe('fire');
  });

  it('leaves "any" alone when there are no themes to draw from', () => {
    expect(resolveWeaponTheme('seed', WEAPON_ANY, [])).toBe(WEAPON_ANY);
  });

  it('is what the page records, so a re-roll needs no domain list', () => {
    // The whole reason the resolve happens before the record: a stored `any` would re-roll from a
    // list this module cannot reach, and would change the day that list did.
    const resolved = resolveWeaponTheme('any-seed', WEAPON_ANY, THEMES);
    const recorded = { ...CONFIG, theme: resolved };

    expect(resolved).not.toBe(WEAPON_ANY);
    expect(toItemSnapshot(rollWeapon('any-seed', recorded))).toEqual(
      toItemSnapshot(rollWeapon('any-seed', readWeaponGeneratorConfig(recorded))),
    );
  });
});

describe('readWeaponGeneratorConfig', () => {
  it('reads back what the page wrote', () => {
    const written = { theme: 'fire', rangeCategory: 'ranged' as const };

    expect(readWeaponGeneratorConfig(written)).toEqual(written);
  });

  it('falls back to the defaults for anything it does not recognise', () => {
    expect(readWeaponGeneratorConfig({})).toEqual(CONFIG);
    expect(readWeaponGeneratorConfig({ rangeCategory: 'thrown' }).rangeCategory).toBe(WEAPON_ANY);
    expect(readWeaponGeneratorConfig({ theme: '' }).theme).toBe(WEAPON_ANY);
  });

  it('keeps a theme this build may no longer have', () => {
    // It still narrows the enchantment tables by tag, and a tag may outlive the domain that named
    // it.
    expect(readWeaponGeneratorConfig({ theme: 'chronomancy' }).theme).toBe('chronomancy');
  });

  it('accepts every range choice the page offers', () => {
    for (const rangeCategory of WEAPON_RANGE_CHOICES) {
      expect(readWeaponGeneratorConfig({ rangeCategory }).rangeCategory).toBe(rangeCategory);
    }
  });
});

describe('toWeaponGenerationConfig', () => {
  it('fixes the major type and forces both flourishes', () => {
    const full = toWeaponGenerationConfig({ ...CONFIG, theme: 'fire' });

    expect(full.itemMajorType).toBe('weapon');
    expect(full.enchantmentChance).toBe(100);
    expect(full.decorationChance).toBe(100);
    expect(full.useUniqueNames).toBe(true);
  });

  it('leaves the range category unset for "any"', () => {
    expect(toWeaponGenerationConfig(CONFIG).weaponRangeCategory).toBeUndefined();
    expect(
      toWeaponGenerationConfig({ ...CONFIG, rangeCategory: 'melee' }).weaponRangeCategory,
    ).toBe('melee');
  });
});

describe('rollWeaponSnapshot', () => {
  it('is the roller a re-roll takes, and matches the page', () => {
    expect(rollWeaponSnapshot('seed', CONFIG)).toEqual(toItemSnapshot(rollWeapon('seed', CONFIG)));
  });

  it('names the tool path the registry tells the two shapes apart by', () => {
    expect(WEAPON_TOOL_PATH).toBe('/fantasy/weapon');
  });
});
