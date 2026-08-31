/**
 * Editing a stored DCC character, one field at a time.
 *
 * Every function here takes a snapshot and returns a new one, changing nothing in place. That is
 * requirement 4.4 of docs/workshop.md satisfied by construction — renaming a character must not
 * disturb their attributes, and correcting one save must not re-roll the rest — and it is what lets
 * the editing framework compare what is on screen against what was read to decide whether anything
 * needs saving.
 *
 * They work on the **snapshot**, not a live `DCCCharacter`, because the snapshot is what is stored
 * and what the kind's `validate` speaks. An editor working on live values would run the codec both
 * ways on every keystroke and hand back a payload one conversion further from what the user kept.
 *
 * **Nothing here recomputes anything.** Editing Stamina does not move Fortitude, and editing Luck
 * does not move the lucky sign's modifier. That is requirement 4.2 taken seriously rather than a
 * gap: a judge who has adjusted one number has made a decision, and a form that quietly corrected
 * the four numbers derived from it would overrule them four times. `dccDerivedFromAttributes`
 * exists for a caller that wants the arithmetic offered as an explicit command — see the editor,
 * where it is a button.
 */

import { getAttributeModifier } from './dcc_characters.js';
import type { DccCharacterSnapshot } from './dcc_character_snapshot.js';
import type { DCCAttribute, DCCItem, DCCWeapon } from './dcc_types.js';

/** The six attributes, in the order every DCC sheet prints them. */
export const DCC_ATTRIBUTE_FIELDS = [
  'strength',
  'agility',
  'stamina',
  'personality',
  'intelligence',
  'luck',
] as const;

export type DccAttributeField = (typeof DCC_ATTRIBUTE_FIELDS)[number];

/** The identity fields a user may rewrite. */
export type DccCharacterTextField = 'firstName' | 'lastName' | 'gender' | 'alignment';

/** The whole-number fields the sheet shows beside the attributes. */
export const DCC_NUMBER_FIELDS = [
  'level',
  'xp',
  'hp',
  'speed',
  'age',
  'armorClass',
  'attackModifier',
  'baseSave',
  'fortitudeSave',
  'reflexSave',
  'willpowerSave',
  'spellsKnown',
  'wizardMaxSpellLevel',
  'clericMaxSpellLevel',
  'numberOfLanguages',
] as const;

export type DccCharacterNumberField = (typeof DCC_NUMBER_FIELDS)[number];

/** The string lists the sheet prints as bullets. */
export type DccCharacterListField = 'specialRules' | 'languages';

export function setDccCharacterText(
  snapshot: DccCharacterSnapshot,
  field: DccCharacterTextField,
  value: string,
): DccCharacterSnapshot {
  return { ...snapshot, [field]: value };
}

/**
 * A whole number on the sheet.
 *
 * A field the user has emptied arrives as `NaN` and is refused rather than stored: a character with
 * an armour class of `NaN` is a payload that fails its own kind's validation, which the user would
 * meet as a broken artifact rather than as a rejected keystroke.
 */
export function setDccCharacterNumber(
  snapshot: DccCharacterSnapshot,
  field: DccCharacterNumberField,
  value: number,
): DccCharacterSnapshot {
  return Number.isFinite(value) ? { ...snapshot, [field]: value } : snapshot;
}

/**
 * One half of one attribute.
 *
 * The value and the modifier are edited separately and neither follows the other, for the reason in
 * the module comment. A user who wants the standard arithmetic asks for it.
 */
export function setDccCharacterAttribute(
  snapshot: DccCharacterSnapshot,
  field: DccAttributeField,
  part: keyof DCCAttribute,
  value: number,
): DccCharacterSnapshot {
  if (!Number.isFinite(value)) {
    return snapshot;
  }
  const attribute: DCCAttribute = { ...snapshot[field], [part]: value };
  return { ...snapshot, [field]: attribute };
}

/**
 * The six modifiers and the four saves as the rules would derive them from the attribute values.
 *
 * Offered as a command rather than run whenever a value changes — the destructive kind of helpful,
 * kept explicit. It touches nothing else: hit points, armour class, the spell levels and the
 * character's own special rules are left exactly as they are, because those took dice and choices
 * that this cannot reconstruct.
 */
export function dccDerivedFromAttributes(snapshot: DccCharacterSnapshot): DccCharacterSnapshot {
  const derived = { ...snapshot };
  for (const field of DCC_ATTRIBUTE_FIELDS) {
    derived[field] = { ...snapshot[field], modifier: getAttributeModifier(snapshot[field].value) };
  }
  derived.fortitudeSave = derived.baseSave + derived.stamina.modifier;
  derived.reflexSave = derived.baseSave + derived.agility.modifier;
  derived.willpowerSave = derived.baseSave + derived.personality.modifier;
  return derived;
}

/** The occupation's name, which the sheet prints and the lookup for its handler uses. */
export function setDccCharacterOccupationName(
  snapshot: DccCharacterSnapshot,
  name: string,
): DccCharacterSnapshot {
  return { ...snapshot, occupation: { ...snapshot.occupation, name } };
}

/** The lucky sign: its name, the description the sheet prints, and the character's own modifier. */
export function setDccCharacterLuckyRollText(
  snapshot: DccCharacterSnapshot,
  field: 'name' | 'description',
  value: string,
): DccCharacterSnapshot {
  return { ...snapshot, luckyRoll: { ...snapshot.luckyRoll, [field]: value } };
}

export function setDccCharacterLuckyRollModifier(
  snapshot: DccCharacterSnapshot,
  modifier: number,
): DccCharacterSnapshot {
  return Number.isFinite(modifier)
    ? { ...snapshot, luckyRoll: { ...snapshot.luckyRoll, modifier } }
    : snapshot;
}

/** One coin denomination. An amount that is not a number leaves the purse alone. */
export function setDccCharacterCurrency(
  snapshot: DccCharacterSnapshot,
  coin: string,
  amount: number,
): DccCharacterSnapshot {
  return Number.isFinite(amount)
    ? { ...snapshot, currency: { ...snapshot.currency, [coin]: amount } }
    : snapshot;
}

function hasIndex(length: number, index: number): boolean {
  return Number.isInteger(index) && index >= 0 && index < length;
}

function replaceAt<T>(list: T[], index: number, value: T): T[] {
  return list.map((entry, position) => (position === index ? value : entry));
}

function removeAt<T>(list: T[], index: number): T[] {
  return list.filter((_entry, position) => position !== index);
}

export function setDccCharacterListEntry(
  snapshot: DccCharacterSnapshot,
  list: DccCharacterListField,
  index: number,
  value: string,
): DccCharacterSnapshot {
  return hasIndex(snapshot[list].length, index)
    ? { ...snapshot, [list]: replaceAt(snapshot[list], index, value) }
    : snapshot;
}

export function addDccCharacterListEntry(
  snapshot: DccCharacterSnapshot,
  list: DccCharacterListField,
  value = '',
): DccCharacterSnapshot {
  return { ...snapshot, [list]: [...snapshot[list], value] };
}

export function removeDccCharacterListEntry(
  snapshot: DccCharacterSnapshot,
  list: DccCharacterListField,
  index: number,
): DccCharacterSnapshot {
  return hasIndex(snapshot[list].length, index)
    ? { ...snapshot, [list]: removeAt(snapshot[list], index) }
    : snapshot;
}

/**
 * A piece of equipment's name.
 *
 * `equipment` and `weapons` overlap — a trained weapon is pushed onto both — and editing one does
 * **not** reach into the other. They are two lists on the sheet and a user who renames a pitchfork
 * in their pack has not said anything about the pitchfork in their hands; guessing which entries
 * were meant to be the same object would be guessing.
 */
export function setDccCharacterEquipmentName(
  snapshot: DccCharacterSnapshot,
  index: number,
  name: string,
): DccCharacterSnapshot {
  return hasIndex(snapshot.equipment.length, index)
    ? {
        ...snapshot,
        equipment: replaceAt(snapshot.equipment, index, {
          ...snapshot.equipment[index],
          name,
        }),
      }
    : snapshot;
}

export function addDccCharacterEquipment(snapshot: DccCharacterSnapshot): DccCharacterSnapshot {
  const item: DCCItem = { name: '', value: 0 };
  return { ...snapshot, equipment: [...snapshot.equipment, item] };
}

export function removeDccCharacterEquipment(
  snapshot: DccCharacterSnapshot,
  index: number,
): DccCharacterSnapshot {
  return hasIndex(snapshot.equipment.length, index)
    ? { ...snapshot, equipment: removeAt(snapshot.equipment, index) }
    : snapshot;
}

/** The parts of a weapon the sheet prints on its line. */
export type DccWeaponField = 'name' | 'damage' | 'range';

export function setDccCharacterWeaponField(
  snapshot: DccCharacterSnapshot,
  index: number,
  field: DccWeaponField,
  value: string,
): DccCharacterSnapshot {
  return hasIndex(snapshot.weapons.length, index)
    ? {
        ...snapshot,
        weapons: replaceAt(snapshot.weapons, index, {
          ...snapshot.weapons[index],
          [field]: value,
        }),
      }
    : snapshot;
}

export function addDccCharacterWeapon(snapshot: DccCharacterSnapshot): DccCharacterSnapshot {
  // A blank line rather than a guessed one. Every other field on a weapon describes what the
  // occupation table gave it, and inventing a classification and a value would put numbers on the
  // sheet that nothing stands behind.
  const weapon: DCCWeapon = { name: '', value: 0, classification: '', damage: '', range: '' };
  return { ...snapshot, weapons: [...snapshot.weapons, weapon] };
}

export function removeDccCharacterWeapon(
  snapshot: DccCharacterSnapshot,
  index: number,
): DccCharacterSnapshot {
  return hasIndex(snapshot.weapons.length, index)
    ? { ...snapshot, weapons: removeAt(snapshot.weapons, index) }
    : snapshot;
}
