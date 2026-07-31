import { describe, expect, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import { applyEnchantment, filterEnchantmentsByTags, getRandomEnchantment } from './enchanter';
import { ENCHANTMENTS } from './enchantments';
import type { Enchantment, Item, Weapon } from './equipment_types';
import { createWeapon, weaponTypes } from './weapons';

function makeItem(overrides: Partial<Item> = {}): Item {
  return {
    id: 'item-1',
    name: 'sword',
    itemMajorType: 'misc',
    description: 'a sword',
    value: 100,
    rarity: 'common',
    densityCategory: 'standard',
    weight: 10,
    properties: [],
    ...overrides,
  };
}

const plain: Enchantment = {
  name: 'flaming',
  description: 'wreathed in flame',
  elements: [],
  spheres: [],
  intent: 'destroy',
  magnitude: 2,
};

describe('applyEnchantment', () => {
  it('prefixes the name and records the enchantment', () => {
    const result = applyEnchantment(makeItem(), plain);

    expect(result.name).toBe('flaming sword');
    expect(result.enchantment).toEqual(plain);
  });

  it('leaves the original item untouched', () => {
    const item = makeItem();

    applyEnchantment(item, plain);

    expect(item.name).toBe('sword');
    expect(item.enchantment).toBeUndefined();
  });

  it('multiplies then adds to the value', () => {
    const result = applyEnchantment(makeItem({ value: 100 }), {
      ...plain,
      valueMultiplier: 2,
      valueAdder: 50,
    });

    expect(result.value).toBe(250);
  });

  it('leaves value alone when neither is given', () => {
    expect(applyEnchantment(makeItem({ value: 100 }), plain).value).toBe(100);
  });

  it('appends the enchantment tags', () => {
    const result = applyEnchantment(makeItem({ properties: ['weapon'] }), {
      ...plain,
      tagsAdded: ['fiery'],
    });

    expect(result.properties).toEqual(['weapon', 'fiery']);
  });

  it('applies stat offsets', () => {
    const item = makeItem({
      combatProfile: { attack: 1, defense: 0, power: 0, resilience: 0, speed: 0, health: 0 },
    });

    const result = applyEnchantment(item, { ...plain, statOffsets: { attack: 2 } });

    expect(result.combatProfile!.attack).toBe(3);
  });

  it('raises a weapon’s power by the enchantment magnitude when it adds damage', () => {
    const weapon = createWeapon('w1', weaponTypes[0]);
    const before = weapon.combatProfile.power;

    const result = applyEnchantment(weapon, {
      ...plain,
      bonusDamage: [{ type: 'fire', power: 3 }],
    }) as Weapon;

    expect(result.combatProfile.power).toBe(before + plain.magnitude);
  });

  it('leaves a non-weapon’s power alone even when the enchantment adds damage', () => {
    const item = makeItem({
      combatProfile: { attack: 0, defense: 0, power: 5, resilience: 0, speed: 0, health: 0 },
    });

    const result = applyEnchantment(item, {
      ...plain,
      bonusDamage: [{ type: 'fire', power: 3 }],
    });

    expect(result.combatProfile!.power).toBe(5);
  });
});

describe('filterEnchantmentsByTags', () => {
  const table: Record<string, Enchantment> = {
    a: { ...plain, name: 'a', tagsAdded: ['fiery', 'magical'] },
    b: { ...plain, name: 'b', tagsAdded: ['fiery'] },
    c: { ...plain, name: 'c' },
  };

  it('keeps enchantments carrying every requested tag', () => {
    expect(filterEnchantmentsByTags(['fiery'], table).map((e) => e.name)).toEqual(['a', 'b']);
  });

  it('requires all tags, not just one', () => {
    expect(filterEnchantmentsByTags(['fiery', 'magical'], table).map((e) => e.name)).toEqual(['a']);
  });

  it('excludes enchantments with no tags at all', () => {
    expect(filterEnchantmentsByTags([], table).map((e) => e.name)).toEqual(['a', 'b']);
  });

  it('falls back to the real enchantment table', () => {
    expect(filterEnchantmentsByTags([]).length).toBeLessThanOrEqual(
      Object.keys(ENCHANTMENTS).length,
    );
  });
});

describe('getRandomEnchantment', () => {
  const weapon = createWeapon('w1', weaponTypes[0]);

  it('returns an enchantment with no requirements', () => {
    expect(getRandomEnchantment(makeItem(), new RNG('seed-a'), [plain])).toEqual(plain);
  });

  it('returns null when nothing is suitable', () => {
    expect(
      getRandomEnchantment(makeItem(), new RNG('seed-a'), [
        { ...plain, tagsRequired: ['nonexistent'] },
      ]),
    ).toBeNull();
  });

  it('matches the weapon and armor type tags', () => {
    const forWeapons = { ...plain, tagsRequired: ['weapon'] };

    expect(getRandomEnchantment(weapon, new RNG('seed-a'), [forWeapons])).toEqual(forWeapons);
    expect(
      getRandomEnchantment(makeItem({ itemMajorType: 'armor' }), new RNG('seed-a'), [forWeapons]),
    ).toBeNull();
  });

  it('matches an armor by its minor type', () => {
    const forHeavy = { ...plain, tagsRequired: ['heavy'] };
    const armor = makeItem({ itemMajorType: 'armor', itemMinorType: 'heavy' });

    expect(getRandomEnchantment(armor, new RNG('seed-a'), [forHeavy])).toEqual(forHeavy);
  });

  it('matches a weapon by its damage type', () => {
    const damageType = weapon.actions[0].damageType!;
    const needsDamageType = { ...plain, tagsRequired: [damageType] };

    expect(getRandomEnchantment(weapon, new RNG('seed-a'), [needsDamageType])).toEqual(
      needsDamageType,
    );
  });

  it('matches a tag carried in the item properties', () => {
    const needsBlessed = { ...plain, tagsRequired: ['blessed'] };

    expect(
      getRandomEnchantment(makeItem({ properties: ['blessed'] }), new RNG('seed-a'), [
        needsBlessed,
      ]),
    ).toEqual(needsBlessed);
  });

  it('rejects an item carrying an excluded tag', () => {
    const excludesCursed = { ...plain, tagsExcluded: ['cursed'] };

    expect(
      getRandomEnchantment(makeItem({ properties: ['cursed'] }), new RNG('seed-a'), [
        excludesCursed,
      ]),
    ).toBeNull();
  });

  it('is reproducible from a seed', () => {
    expect(getRandomEnchantment(weapon, new RNG('seed-a'))).toEqual(
      getRandomEnchantment(weapon, new RNG('seed-a')),
    );
  });
});
