import { describe, expect, it } from 'vitest';
import { createWeapon, generateWeapon, weaponTypes } from './weapons';

const seeds = ['a', 'b', 'c', 'd', 'e', 'f'];

describe('weaponTypes', () => {
  it('describes every weapon type with at least one action', () => {
    expect(weaponTypes.length).toBeGreaterThan(0);

    for (const type of weaponTypes) {
      expect(type.name.length).toBeGreaterThan(0);
      expect(type.description.length).toBeGreaterThan(0);
      expect(type.baseValue).toBeGreaterThan(0);
      expect(type.baseActions.length).toBeGreaterThan(0);
      expect(['melee', 'ranged']).toContain(type.rangeCategory);
      expect([1, 2]).toContain(type.hands);
    }
  });

  it('names every weapon type uniquely', () => {
    const names = weaponTypes.map((type) => type.name);

    expect(new Set(names).size).toBe(names.length);
  });

  it('gives every ranged weapon a range on its attack', () => {
    const ranged = weaponTypes.filter((type) => type.rangeCategory === 'ranged');

    expect(ranged.length).toBeGreaterThan(0);
    for (const type of ranged) {
      expect(type.baseActions[0].range).toBeGreaterThan(0);
    }
  });

  it('covers both range categories', () => {
    const categories = new Set(weaponTypes.map((type) => type.rangeCategory));

    expect(categories).toEqual(new Set(['melee', 'ranged']));
  });
});

describe('createWeapon', () => {
  const type = weaponTypes[0];

  it('takes its shape from the weapon type', () => {
    const weapon = createWeapon('w1', type);

    expect(weapon.id).toBe('w1');
    expect(weapon.name).toBe(type.name);
    expect(weapon.description).toBe(type.description);
    expect(weapon.value).toBe(type.baseValue);
    expect(weapon.itemMajorType).toBe('weapon');
    expect(weapon.itemMinorType).toBe(type.rangeCategory);
    expect(weapon.weaponType).toEqual(type);
    expect(weapon.actions).toEqual(type.baseActions);
  });

  it('takes its power from the first action’s base damage', () => {
    expect(createWeapon('w1', type).combatProfile.power).toBe(type.baseActions[0].baseDamage);
  });

  it('falls back to zero power when the type has no actions', () => {
    const weapon = createWeapon('w1', { ...type, baseActions: [] });

    expect(weapon.combatProfile.power).toBe(0);
  });

  it('accepts an override name', () => {
    expect(createWeapon('w1', type, 'Widowmaker').name).toBe('Widowmaker');
  });

  it.each([
    [1, 3],
    [2, 5],
  ])('weighs a %i-handed weapon at %i', (hands, weight) => {
    expect(createWeapon('w1', { ...type, hands }).weight).toBe(weight);
  });
});

describe('generateWeapon', () => {
  it('is reproducible from a seed', () => {
    expect(generateWeapon('seed-a')).toEqual(generateWeapon('seed-a'));
  });

  it('varies with the seed', () => {
    const names = new Set(seeds.map((seed) => generateWeapon(seed).name));

    expect(names.size).toBeGreaterThan(1);
  });

  it('applies a material, which renames and reprices the weapon', () => {
    for (const seed of seeds) {
      const weapon = generateWeapon(seed);

      expect(weapon.material).toBeDefined();
      expect(weapon.name).toBe(`${weapon.material!.name} ${weapon.weaponType.name}`);
      expect(weapon.value).toBe(
        Math.floor(weapon.weaponType.baseValue * weapon.material!.valueMultiplier),
      );
    }
  });

  it('produces a weapon of a type from the table', () => {
    for (const seed of seeds) {
      expect(weaponTypes).toContainEqual(generateWeapon(seed).weaponType);
    }
  });

  it('gives the weapon a material its type allows', () => {
    for (const seed of seeds) {
      const weapon = generateWeapon(seed);

      if (weapon.weaponType.allowedMaterialTypes?.length) {
        expect(weapon.weaponType.allowedMaterialTypes).toContain(weapon.material!.majorType);
      }
    }
  });
});
