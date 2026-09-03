import { describe, expect, it } from 'vitest';

import { rollItem } from './item_roll';
import { itemFromSnapshot, toItemSnapshot, type ItemSnapshot } from './item_snapshot';

const CONFIG = {
  itemMajorType: 'any' as const,
  useRefine: true,
  useEnchant: true,
  useDecorate: true,
};

/** A seed that rolls an item carrying all four composition parts, found by trying seeds. */
function rollComposed(): ItemSnapshot {
  for (let attempt = 0; attempt < 400; attempt++) {
    const item = toItemSnapshot(rollItem(`compose-${attempt}`, CONFIG));
    if (
      item.material !== undefined &&
      item.refinement !== undefined &&
      item.enchantment !== undefined &&
      item.decoration !== undefined
    ) {
      return item;
    }
  }
  throw new Error('no seed in 400 produced an item with all four parts');
}

describe('toItemSnapshot', () => {
  it('keeps the composition rather than only the description', () => {
    // The requirement #66 states outright: an item's parts are composed at generation time, and
    // storing only the rendered paragraph would leave an editor able to rewrite prose and nothing
    // else.
    const item = rollComposed();

    expect(item.material?.name).toBeTypeOf('string');
    expect(item.refinement?.name).toBeTypeOf('string');
    expect(item.enchantment?.name).toBeTypeOf('string');
    expect(item.decoration?.name).toBeTypeOf('string');
  });

  it('keeps a weapon attack list, which lives on the weapon rather than on the item', () => {
    const weapon = toItemSnapshot(rollItem('weapon-seed', { ...CONFIG, itemMajorType: 'weapon' }));

    expect(weapon.itemMajorType).toBe('weapon');
    expect(weapon.actions?.length).toBeGreaterThan(0);
    expect(weapon.actions?.[0].damageType).toBeTypeOf('string');
  });

  it('keeps the combat profile armour carries', () => {
    const armor = toItemSnapshot(rollItem('armor-seed', { ...CONFIG, itemMajorType: 'armor' }));

    expect(armor.itemMajorType).toBe('armor');
    expect(armor.combatProfile?.defense).toBeTypeOf('number');
  });

  it('drops what generation used and the item is not', () => {
    // `allowedMaterialTypes` is the base type's list of what the generator could draw from, and it
    // is on every rolled weapon. It is an input, not a fact about the sword.
    const rolled = rollItem('weapon-seed', { ...CONFIG, itemMajorType: 'weapon' });
    expect(rolled.allowedMaterialTypes).toBeDefined();

    expect('allowedMaterialTypes' in toItemSnapshot(rolled)).toBe(false);
    expect('weaponType' in toItemSnapshot(rolled)).toBe(false);
  });

  it('omits an absent optional rather than storing it undefined', () => {
    // A key holding `undefined` survives a structured clone as a key holding `undefined`, which
    // then reads back as a present-but-empty part.
    const plain = toItemSnapshot(rollItem('plain', { ...CONFIG, useEnchant: false }));

    if (plain.enchantment === undefined) {
      expect('enchantment' in plain).toBe(false);
    }
  });
});

describe('itemFromSnapshot', () => {
  it('round-trips everything that matters', () => {
    // Requirement 7.2.
    const item = rollComposed();

    expect(itemFromSnapshot(item)).toEqual(item);
    expect(itemFromSnapshot(itemFromSnapshot(item))).toEqual(item);
  });

  it('round-trips a weapon and armour, attacks and profile included', () => {
    for (const majorType of ['weapon', 'armor'] as const) {
      const item = toItemSnapshot(
        rollItem(`round-${majorType}`, { ...CONFIG, itemMajorType: majorType }),
      );
      expect(itemFromSnapshot(item), majorType).toEqual(item);
    }
  });

  it('survives a trip through JSON, which is what storage is', () => {
    const item = rollComposed();

    expect(itemFromSnapshot(JSON.parse(JSON.stringify(item)))).toEqual(item);
  });

  it('copies deeply enough that an editor cannot reach the stored record', () => {
    const item = rollComposed();
    const read = itemFromSnapshot(item);

    read.properties.push('tampered');
    if (read.material !== undefined) {
      (read.material as { name: string }).name = 'tampered';
    }

    expect(item.properties).not.toContain('tampered');
    expect(item.material?.name).not.toBe('tampered');
  });

  it('recomputes nothing on read', () => {
    // Requirement 4.2: a value the user set by hand is the item's value, not an input to a
    // multiplication that runs again every time the artifact is opened.
    const edited: ItemSnapshot = { ...rollComposed(), value: 1, weight: 0.5 };

    expect(itemFromSnapshot(edited).value).toBe(1);
    expect(itemFromSnapshot(edited).weight).toBe(0.5);
  });
});
