import { describe, expect, it } from 'vitest';

import { rollSwnCharacterSnapshot } from './swn_character_roll.js';
import {
  addSwnCharacterAbility,
  addSwnCharacterArmor,
  addSwnCharacterEquipment,
  addSwnCharacterSkill,
  addSwnCharacterWeapon,
  removeSwnCharacterAbility,
  removeSwnCharacterArmor,
  removeSwnCharacterEquipment,
  removeSwnCharacterFocus,
  removeSwnCharacterSkill,
  removeSwnCharacterWeapon,
  setSwnCharacterAbilityDescription,
  setSwnCharacterArmorClass,
  setSwnCharacterArmorName,
  setSwnCharacterBackgroundName,
  setSwnCharacterClassName,
  setSwnCharacterEquipmentName,
  setSwnCharacterFocusLevel,
  setSwnCharacterFocusName,
  setSwnCharacterNumber,
  setSwnCharacterSkillLevel,
  setSwnCharacterSkillName,
  setSwnCharacterStat,
  setSwnCharacterText,
  setSwnCharacterWeaponField,
  swnDerivedFromStats,
} from './swn_character_editing.js';

const character = rollSwnCharacterSnapshot('editing-fixture');

describe('editing a SWN character', () => {
  /** Requirement 4.4: one field at a time, and nothing else moves. */
  it('changes one field and leaves the rest alone', () => {
    const renamed = setSwnCharacterText(character, 'firstName', 'Vex');

    expect(renamed.firstName).toBe('Vex');
    expect({ ...renamed, firstName: character.firstName }).toEqual(character);
  });

  it('never writes into the snapshot it was given', () => {
    const before = structuredClone(character);
    setSwnCharacterNumber(character, 'hitPoints', 99);

    expect(character).toEqual(before);
  });

  it('refuses a number a user has emptied rather than storing NaN', () => {
    expect(setSwnCharacterNumber(character, 'hitPoints', Number.NaN)).toBe(character);
    expect(setSwnCharacterStat(character, 0, 'score', Number.NaN)).toBe(character);
    expect(setSwnCharacterSkillLevel(character, 0, Number.NaN)).toBe(character);
    expect(setSwnCharacterArmorClass(character, 0, Number.NaN)).toBe(character);
  });

  it('rewrites the background and the class by name', () => {
    expect(setSwnCharacterBackgroundName(character, 'Dilettante').background.name).toBe(
      'Dilettante',
    );
    expect(setSwnCharacterClassName(character, 'Warrior').characterClass.name).toBe('Warrior');
  });

  /** 4.2, stated as a test: a score is not allowed to drag its modifier along. */
  it('does not move a modifier when a score changes', () => {
    const edited = setSwnCharacterStat(character, 0, 'score', 18);

    expect(edited.stats[0].score).toBe(18);
    expect(edited.stats[0].modifier).toBe(character.stats[0].modifier);
  });

  it('recalculates the modifiers and saves only when asked', () => {
    const raised = setSwnCharacterStat(character, 0, 'score', 3);
    const derived = swnDerivedFromStats(raised);

    expect(derived.stats[0].modifier).toBe(-2);
    for (const stat of derived.stats) {
      expect(Number.isFinite(stat.modifier)).toBe(true);
    }
    const best = (abbreviation: string) =>
      derived.stats.find((stat) => stat.abbreviation === abbreviation)?.modifier ?? 0;
    expect(derived.savingThrowPhysical).toBe(15 - Math.max(best('STR'), best('CON')));
    expect(derived.savingThrowEvasion).toBe(15 - Math.max(best('INT'), best('DEX')));
    expect(derived.savingThrowMental).toBe(15 - Math.max(best('WIS'), best('CHA')));
  });

  it('leaves the numbers it cannot reconstruct alone when it recalculates', () => {
    const derived = swnDerivedFromStats(setSwnCharacterNumber(character, 'hitPoints', 3));

    expect(derived.hitPoints).toBe(3);
    expect(derived.effort).toBe(character.effort);
    expect(derived.armorClassEquipped).toBe(character.armorClassEquipped);
    expect(derived.credits).toBe(character.credits);
  });

  it('edits, adds and removes a skill', () => {
    const renamed = setSwnCharacterSkillName(character, 0, 'Program');
    expect(renamed.skills[0].name).toBe('Program');

    const levelled = setSwnCharacterSkillLevel(renamed, 0, 2);
    expect(levelled.skills[0].level).toBe(2);

    const added = addSwnCharacterSkill(levelled);
    expect(added.skills).toHaveLength(levelled.skills.length + 1);

    const removed = removeSwnCharacterSkill(added, added.skills.length - 1);
    expect(removed.skills).toEqual(levelled.skills);
  });

  it('edits a focus by name and level, which is the pick itself', () => {
    const renamed = setSwnCharacterFocusName(character, 0, 'Alert');
    expect(renamed.focuses[0].name).toBe('Alert');
    // The rulebook text under it is untouched: it is not the user's to rewrite.
    expect(renamed.focuses[0].levelOneDescription).toBe(character.focuses[0].levelOneDescription);

    const levelled = setSwnCharacterFocusLevel(renamed, 0, 2);
    expect(levelled.focuses[0].currentLevel).toBe(2);

    expect(removeSwnCharacterFocus(levelled, 0).focuses).toHaveLength(character.focuses.length - 1);
  });

  it('edits, adds and removes an ability', () => {
    const edited = setSwnCharacterAbilityDescription(character, 0, 'Reads minds on Tuesdays');
    expect(edited.abilities[0].description).toBe('Reads minds on Tuesdays');
    expect(edited.abilities[0].kind).toBe(character.abilities[0].kind);

    const added = addSwnCharacterAbility(edited);
    expect(added.abilities).toHaveLength(edited.abilities.length + 1);
    expect(removeSwnCharacterAbility(added, added.abilities.length - 1).abilities).toEqual(
      edited.abilities,
    );
  });

  it('edits, adds and removes equipment', () => {
    const renamed = setSwnCharacterEquipmentName(character, 0, 'A very old backpack');
    expect(renamed.equipment[0].name).toBe('A very old backpack');

    const added = addSwnCharacterEquipment(renamed);
    expect(added.equipment).toHaveLength(renamed.equipment.length + 1);
    expect(removeSwnCharacterEquipment(added, added.equipment.length - 1).equipment).toEqual(
      renamed.equipment,
    );
  });

  it('keeps the two weapon lists apart', () => {
    const withRanged = addSwnCharacterWeapon(character, 'rangedWeapons');
    const named = setSwnCharacterWeaponField(
      withRanged,
      'rangedWeapons',
      withRanged.rangedWeapons.length - 1,
      'name',
      'Laser pistol',
    );

    expect(named.rangedWeapons[named.rangedWeapons.length - 1].name).toBe('Laser pistol');
    expect(named.meleeWeapons).toEqual(character.meleeWeapons);

    expect(
      removeSwnCharacterWeapon(named, 'rangedWeapons', named.rangedWeapons.length - 1)
        .rangedWeapons,
    ).toEqual(character.rangedWeapons);
  });

  it('edits, adds and removes armor', () => {
    const added = addSwnCharacterArmor(character);
    const index = added.armor.length - 1;
    const named = setSwnCharacterArmorClass(
      setSwnCharacterArmorName(added, index, 'Deflector field'),
      index,
      15,
    );

    expect(named.armor[index]).toMatchObject({ name: 'Deflector field', ac: 15 });
    expect(removeSwnCharacterArmor(named, index).armor).toEqual(character.armor);
  });

  /** An index nothing is at is a no-op, not a throw: the editor is driven by a live list. */
  it('ignores an index that is not there', () => {
    expect(setSwnCharacterSkillName(character, 99, 'Fix')).toBe(character);
    expect(setSwnCharacterFocusName(character, -1, 'Alert')).toBe(character);
    expect(setSwnCharacterAbilityDescription(character, 99, 'nothing')).toBe(character);
    expect(setSwnCharacterEquipmentName(character, 99, 'nothing')).toBe(character);
    expect(setSwnCharacterWeaponField(character, 'meleeWeapons', 99, 'name', 'nothing')).toBe(
      character,
    );
    expect(setSwnCharacterArmorName(character, 99, 'nothing')).toBe(character);
    expect(removeSwnCharacterSkill(character, 99)).toBe(character);
    expect(removeSwnCharacterFocus(character, 99)).toBe(character);
    expect(removeSwnCharacterAbility(character, 99)).toBe(character);
    expect(removeSwnCharacterEquipment(character, 99)).toBe(character);
    expect(removeSwnCharacterArmor(character, 99)).toBe(character);
    expect(removeSwnCharacterWeapon(character, 'rangedWeapons', 99)).toBe(character);
    expect(setSwnCharacterStat(character, 99, 'score', 10)).toBe(character);
  });
});
