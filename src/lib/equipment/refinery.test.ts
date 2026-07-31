import { describe, expect, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import type { Item, Refinement, Weapon } from './equipment_types';
import { applyRefinement, filterRefinementsByTags, getRandomRefinement } from './refinery';
import { REFINEMENTS } from './refinements';
import { createWeapon, weaponTypes } from './weapons';

// Deliberately not `itemMajorType: 'weapon'`. getRandomRefinement narrows a weapon-typed item to
// `Weapon` and reads `weaponType.baseActions[0]` without checking, so a plain item merely labelled
// as a weapon throws. Every production path builds weapons through createBaseWeapon, which always
// sets weaponType, so a real weapon fixture is the honest one — see the damage-type test below.
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

const plain: Refinement = { name: 'honed', description: 'sharpened to an edge' };

describe('applyRefinement', () => {
  it('prefixes the name and records the refinement', () => {
    const result = applyRefinement(makeItem(), plain);

    expect(result.name).toBe('honed sword');
    expect(result.refinement).toEqual(plain);
  });

  it('leaves the original item untouched', () => {
    const item = makeItem();

    applyRefinement(item, plain);

    expect(item.name).toBe('sword');
    expect(item.refinement).toBeUndefined();
  });

  it('scales weight and value when multipliers are given', () => {
    const result = applyRefinement(makeItem({ weight: 10, value: 100 }), {
      ...plain,
      weightMultiplier: 0.5,
      valueMultiplier: 2,
    });

    expect(result.weight).toBe(5);
    expect(result.value).toBe(200);
  });

  it('leaves weight and value alone when no multipliers are given', () => {
    const result = applyRefinement(makeItem({ weight: 10, value: 100 }), plain);

    expect(result.weight).toBe(10);
    expect(result.value).toBe(100);
  });

  it('floors a fractional value', () => {
    const result = applyRefinement(makeItem({ value: 10 }), { ...plain, valueMultiplier: 1.55 });

    expect(result.value).toBe(15);
  });

  it('appends the refinement tags', () => {
    const result = applyRefinement(makeItem({ properties: ['weapon'] }), {
      ...plain,
      tagsAdded: ['sharp'],
    });

    expect(result.properties).toEqual(['weapon', 'sharp']);
  });

  it('applies stat offsets', () => {
    const item = makeItem({
      combatProfile: { attack: 1, defense: 0, power: 0, resilience: 0, speed: 0, health: 0 },
    });

    const result = applyRefinement(item, { ...plain, statOffsets: { attack: 2 } });

    expect(result.combatProfile!.attack).toBe(3);
  });
});

describe('filterRefinementsByTags', () => {
  const table: Record<string, Refinement> = {
    a: { ...plain, name: 'a', tagsAdded: ['sharp', 'balanced'] },
    b: { ...plain, name: 'b', tagsAdded: ['sharp'] },
    c: { ...plain, name: 'c' },
  };

  it('keeps refinements carrying every requested tag', () => {
    expect(filterRefinementsByTags(['sharp'], table).map((r) => r.name)).toEqual(['a', 'b']);
  });

  it('requires all tags, not just one', () => {
    expect(filterRefinementsByTags(['sharp', 'balanced'], table).map((r) => r.name)).toEqual(['a']);
  });

  it('excludes refinements with no tags at all', () => {
    expect(filterRefinementsByTags([], table).map((r) => r.name)).toEqual(['a', 'b']);
  });

  it('falls back to the real refinement table', () => {
    const result = filterRefinementsByTags([]);

    expect(result.length).toBeGreaterThan(0);
    expect(result.length).toBeLessThanOrEqual(Object.keys(REFINEMENTS).length);
  });
});

describe('getRandomRefinement', () => {
  const weapon = createWeapon('w1', weaponTypes[0]);

  it('returns a refinement with no requirements', () => {
    const result = getRandomRefinement(makeItem(), new RNG('seed-a'), [plain]);

    expect(result).toEqual(plain);
  });

  it('returns null when nothing is suitable', () => {
    const result = getRandomRefinement(makeItem(), new RNG('seed-a'), [
      { ...plain, tagsRequired: ['nonexistent'] },
    ]);

    expect(result).toBeNull();
  });

  it('matches the weapon and armor type tags', () => {
    const forWeapons = { ...plain, tagsRequired: ['weapon'] };

    expect(getRandomRefinement(weapon, new RNG('seed-a'), [forWeapons])).toEqual(forWeapons);
    expect(
      getRandomRefinement(makeItem({ itemMajorType: 'armor' }), new RNG('seed-a'), [forWeapons]),
    ).toBeNull();
  });

  it('matches a tag carried in the item properties', () => {
    const needsSharp = { ...plain, tagsRequired: ['sharp'] };

    expect(
      getRandomRefinement(makeItem({ properties: ['sharp'] }), new RNG('seed-a'), [needsSharp]),
    ).toEqual(needsSharp);
  });

  it('matches a weapon by its damage type', () => {
    const damageType = (weapon as Weapon).weaponType.baseActions[0].damageType!;
    const needsDamageType = { ...plain, tagsRequired: [damageType] };

    expect(getRandomRefinement(weapon, new RNG('seed-a'), [needsDamageType])).toEqual(
      needsDamageType,
    );
  });

  it('rejects an item carrying an excluded tag', () => {
    const excludesCursed = { ...plain, tagsExcluded: ['cursed'] };

    expect(
      getRandomRefinement(makeItem({ properties: ['cursed'] }), new RNG('seed-a'), [
        excludesCursed,
      ]),
    ).toBeNull();
    expect(getRandomRefinement(makeItem(), new RNG('seed-a'), [excludesCursed])).toEqual(
      excludesCursed,
    );
  });

  it('is reproducible from a seed', () => {
    expect(getRandomRefinement(weapon, new RNG('seed-a'))).toEqual(
      getRandomRefinement(weapon, new RNG('seed-a')),
    );
  });

  it('falls back to the real refinement table', () => {
    expect(getRandomRefinement(weapon, new RNG('seed-a'))).not.toBeNull();
  });
});
