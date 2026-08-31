import { describe, expect, it } from 'vitest';

import { validateDccCharacterSnapshot } from './dcc_character_artifact_kind.js';
import {
  addDccCharacterEquipment,
  addDccCharacterListEntry,
  addDccCharacterWeapon,
  dccDerivedFromAttributes,
  removeDccCharacterEquipment,
  removeDccCharacterListEntry,
  removeDccCharacterWeapon,
  setDccCharacterAttribute,
  setDccCharacterCurrency,
  setDccCharacterEquipmentName,
  setDccCharacterListEntry,
  setDccCharacterLuckyRollModifier,
  setDccCharacterLuckyRollText,
  setDccCharacterNumber,
  setDccCharacterOccupationName,
  setDccCharacterText,
  setDccCharacterWeaponField,
} from './dcc_character_editing.js';
import { rollDccCharacterSnapshot } from './dcc_character_roll.js';
import type { DccCharacterSnapshot } from './dcc_character_snapshot.js';

/** A character with something in every list the editor offers. */
function armed(): DccCharacterSnapshot {
  for (let seed = 0; seed < 300; seed += 1) {
    const snapshot = rollDccCharacterSnapshot(`editing-${seed}`);
    if (snapshot.weapons.length > 0 && snapshot.specialRules.length > 0) {
      return snapshot;
    }
  }
  throw new Error('no seed in the sweep produced an armed character with a special rule');
}

const fixture = armed();

describe('editing a DCC character', () => {
  it('rewrites one text field and leaves everything else alone', () => {
    const after = setDccCharacterText(fixture, 'alignment', 'Chaos');

    expect(after.alignment).toBe('Chaos');
    expect({ ...after, alignment: fixture.alignment }).toEqual(fixture);
  });

  it('changes nothing in place', () => {
    const before = structuredClone(fixture);
    setDccCharacterText(fixture, 'firstName', 'Someone');
    addDccCharacterWeapon(fixture);
    setDccCharacterAttribute(fixture, 'luck', 'value', 18);

    expect(fixture).toEqual(before);
  });

  /**
   * An emptied number field arrives as `NaN`. Stored, it is a payload that fails its own kind's
   * validation, which the user would meet as a broken artifact rather than a rejected keystroke.
   */
  it('refuses anything that is not a number', () => {
    expect(setDccCharacterNumber(fixture, 'hp', Number.NaN)).toBe(fixture);
    expect(setDccCharacterAttribute(fixture, 'luck', 'value', Number.NaN)).toBe(fixture);
    expect(setDccCharacterLuckyRollModifier(fixture, Number.NaN)).toBe(fixture);
    expect(setDccCharacterCurrency(fixture, 'cp', Number.NaN)).toBe(fixture);
    expect(setDccCharacterNumber(fixture, 'hp', 4).hp).toBe(4);
  });

  /**
   * Requirement 4.2 taken seriously: a judge who adjusted one number has made a decision, and a
   * form that corrected the four derived from it would overrule them four times.
   */
  it('does not move a save when the attribute behind it changes', () => {
    const after = setDccCharacterAttribute(fixture, 'stamina', 'value', 18);

    expect(after.stamina.value).toBe(18);
    expect(after.stamina.modifier).toBe(fixture.stamina.modifier);
    expect(after.fortitudeSave).toBe(fixture.fortitudeSave);
  });

  it('offers that arithmetic as an explicit command instead', () => {
    const raised = setDccCharacterAttribute(fixture, 'stamina', 'value', 18);
    const after = dccDerivedFromAttributes(raised);

    // 4, not the +3 the DCC table gives an 18: `getAttributeModifier` is the d20-style
    // `floor((value - 10) / 2)` this library has always used. Whether that should be the published
    // table is a question about the generator, not about this command, which exists to apply
    // whatever the library's own arithmetic is.
    expect(after.stamina.modifier).toBe(4);
    expect(after.fortitudeSave).toBe(after.baseSave + 4);
    expect(after.reflexSave).toBe(after.baseSave + after.agility.modifier);
    expect(after.willpowerSave).toBe(after.baseSave + after.personality.modifier);
  });

  it('leaves what the dice decided alone when it recalculates', () => {
    const after = dccDerivedFromAttributes(fixture);

    expect(after.hp).toBe(fixture.hp);
    expect(after.armorClass).toBe(fixture.armorClass);
    expect(after.specialRules).toEqual(fixture.specialRules);
    expect(after.luckyRoll).toEqual(fixture.luckyRoll);
  });

  it('renames the occupation without touching what it gave the character', () => {
    const after = setDccCharacterOccupationName(fixture, 'turnip farmer');

    expect(after.occupation.name).toBe('turnip farmer');
    expect(after.occupation.trainedWeapon).toEqual(fixture.occupation.trainedWeapon);
    expect(after.equipment).toEqual(fixture.equipment);
  });

  it('rewrites the lucky sign, name, description and modifier apart', () => {
    const named = setDccCharacterLuckyRollText(fixture, 'name', 'Bountiful harvest');
    const described = setDccCharacterLuckyRollText(named, 'description', 'All healing');
    const after = setDccCharacterLuckyRollModifier(described, 3);

    expect(after.luckyRoll).toEqual({
      name: 'Bountiful harvest',
      description: 'All healing',
      modifier: 3,
    });
  });

  it('sets one coin without disturbing the purse', () => {
    const after = setDccCharacterCurrency(fixture, 'gp', 2);

    expect(after.currency.gp).toBe(2);
    expect(after.currency.cp).toBe(fixture.currency.cp);
  });
});

describe('editing a DCC character’s lists', () => {
  it('rewrites, adds and removes a special rule', () => {
    const rewritten = setDccCharacterListEntry(fixture, 'specialRules', 0, 'Reads the weather');
    expect(rewritten.specialRules[0]).toBe('Reads the weather');
    expect(rewritten.specialRules.slice(1)).toEqual(fixture.specialRules.slice(1));

    const added = addDccCharacterListEntry(fixture, 'specialRules', 'Fears geese');
    expect(added.specialRules.at(-1)).toBe('Fears geese');
    expect(
      removeDccCharacterListEntry(added, 'specialRules', added.specialRules.length - 1),
    ).toEqual(fixture);
  });

  it('does nothing at an index nothing lives at', () => {
    expect(setDccCharacterListEntry(fixture, 'languages', 99, 'nowhere')).toBe(fixture);
    expect(removeDccCharacterListEntry(fixture, 'languages', -1)).toBe(fixture);
    expect(setDccCharacterEquipmentName(fixture, 99, 'nowhere')).toBe(fixture);
    expect(setDccCharacterWeaponField(fixture, 99, 'name', 'nowhere')).toBe(fixture);
    expect(removeDccCharacterWeapon(fixture, 99)).toBe(fixture);
  });

  it('adds, renames and removes an item, and the result still validates', () => {
    const added = addDccCharacterEquipment(fixture);
    const named = setDccCharacterEquipmentName(added, added.equipment.length - 1, 'a bent nail');

    expect(named.equipment.at(-1)?.name).toBe('a bent nail');
    expect(validateDccCharacterSnapshot(named).ok).toBe(true);
    expect(removeDccCharacterEquipment(named, named.equipment.length - 1)).toEqual(fixture);
  });

  it('edits each part of a weapon’s line', () => {
    const named = setDccCharacterWeaponField(fixture, 0, 'name', 'scythe');
    const damaged = setDccCharacterWeaponField(named, 0, 'damage', '1d8');
    const after = setDccCharacterWeaponField(damaged, 0, 'range', 'melee');

    expect(after.weapons[0]?.name).toBe('scythe');
    expect(after.weapons[0]?.damage).toBe('1d8');
    expect(after.weapons[0]?.range).toBe('melee');
    expect(validateDccCharacterSnapshot(after).ok).toBe(true);
  });

  /**
   * A trained weapon is pushed onto both lists, and editing one does not reach into the other:
   * guessing which entries were meant to be the same object would be guessing.
   */
  it('keeps the two equipment lists independent', () => {
    const after = setDccCharacterWeaponField(fixture, 0, 'name', 'scythe');

    expect(after.equipment).toEqual(fixture.equipment);
  });

  it('adds and removes a weapon, and the result still validates', () => {
    const added = addDccCharacterWeapon(fixture);

    expect(added.weapons).toHaveLength(fixture.weapons.length + 1);
    expect(validateDccCharacterSnapshot(added).ok).toBe(true);
    expect(removeDccCharacterWeapon(added, added.weapons.length - 1)).toEqual(fixture);
  });
});
