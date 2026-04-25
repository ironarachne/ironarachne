import { RNG } from '@ironarachne/rng';
import { describe, expect, it } from 'vitest';
import * as Equipment from './equipment';
import {
  getEligibleWeaponGroups,
  selectNonweaponProficiencies,
  selectWeaponProficiencyGroups,
} from './adnd_proficiency_selection';
import cleric from './classes/cleric';
import fighter from './classes/fighter';
import mage from './classes/mage';
import thief from './classes/thief';

describe('getEligibleWeaponGroups', () => {
  it('returns all unique categories for allowedWeapons any', () => {
    const all = Equipment.getWeapons();
    const g = getEligibleWeaponGroups(fighter, all);
    const categories = new Set(all.map((w) => w.category));
    expect(g.length).toBe(categories.size);
  });

  it('returns only bludgeoning-based weapon categories for cleric', () => {
    const all = Equipment.getWeapons();
    const g = getEligibleWeaponGroups(cleric, all);
    for (const name of g) {
      const sample = all.find((w) => w.category === name && w.damageType.includes('bludgeoning'));
      expect(sample).toBeDefined();
    }
  });

  it('expands specific thief weapon list to their categories', () => {
    const all = Equipment.getWeapons();
    const g = getEligibleWeaponGroups(thief, all);
    expect(g).toContain('dagger');
    expect(g).toContain('sword');
    expect(g).toContain('bow');
    expect(g).not.toContain('polearm');
  });
});

describe('selectWeaponProficiencyGroups', () => {
  it('uses preferred category for the first slot when it is in eligible', () => {
    const rng = new RNG('wp-repeat-test-1');
    const out = selectWeaponProficiencyGroups(3, ['dagger', 'staff', 'dart'], 'staff', rng);
    expect(out[0]).toBe('staff');
    expect(out).toHaveLength(3);
  });

  it('produces the requested number of groups', () => {
    const rng = new RNG('wp-repeat-test-2');
    const eligible = ['a', 'b', 'c', 'd'];
    const out = selectWeaponProficiencyGroups(4, eligible, 'z', rng);
    expect(out).toHaveLength(4);
    expect(eligible).toContain(out[0]);
  });
});

describe('selectNonweaponProficiencies', () => {
  it('returns up to count entries without duplicates', () => {
    const rng = new RNG('nwp-unique-1');
    const n = selectNonweaponProficiencies('warrior', 4, rng);
    expect(n.length).toBe(4);
    expect(new Set(n).size).toBe(4);
  });

  it('uses wizard list for wizards (class group)', () => {
    const rng = new RNG('nwp-wizard-1');
    const n = selectNonweaponProficiencies('wizard', 3, rng);
    expect(n.length).toBe(3);
  });
});

describe('mage narrow weapon list', () => {
  it('stays within mage allowed weapon groups only', () => {
    const all = Equipment.getWeapons();
    const g = getEligibleWeaponGroups(mage, all);
    expect([...g].sort()).toEqual(['dagger', 'dart', 'sling', 'staff']);
  });
});
