/**
 * Editing a stored Stars Without Number character, one field at a time.
 *
 * Every function here takes a snapshot and returns a new one, changing nothing in place. That is
 * requirement 4.4 of docs/workshop.md satisfied by construction — renaming a character must not
 * disturb their stats, and correcting one saving throw must not re-roll the rest — and it is what
 * lets the editing framework compare what is on screen against what was read to decide whether
 * anything needs saving.
 *
 * **Nothing here recomputes anything.** Editing Dexterity does not move the ranged attack bonus,
 * and editing a stat's score does not move its modifier. That is requirement 4.2 taken seriously
 * rather than a gap: a referee who has adjusted a number has made a decision, and a form that
 * quietly corrected everything derived from it would overrule them repeatedly.
 * `swnDerivedFromStats` exists for a caller that wants the arithmetic offered as an explicit
 * command — see the editor, where it is a button.
 */

import {
  createArmor,
  createMiscItem,
  createSkill,
  createSpecialAbility,
  createWeapon,
  statModifierForScore,
  type Stat,
  type Weapon,
} from './character.js';
import type { SwnCharacterSnapshot } from './swn_character_snapshot.js';

/** The identity fields a user may rewrite. */
export type SwnCharacterTextField = 'firstName' | 'lastName';

/**
 * The whole numbers the sheet shows.
 *
 * All of them, including the three armour classes the screen shows only one of: an editor that
 * offered the equipped AC alone would leave a character whose armour a user has rewritten carrying
 * an unequipped number nothing on screen explains.
 */
export const SWN_NUMBER_FIELDS = [
  'currentLevel',
  'hitPoints',
  'effort',
  'attackBonus',
  'meleeAttackBonus',
  'rangedAttackBonus',
  'armorClassBase',
  'armorClassUnequipped',
  'armorClassEquipped',
  'credits',
  'savingThrowMental',
  'savingThrowEvasion',
  'savingThrowPhysical',
] as const;

export type SwnCharacterNumberField = (typeof SWN_NUMBER_FIELDS)[number];

/** The two weapon lists, which the sheet prints under separate headings and attack bonuses. */
export type SwnWeaponList = 'rangedWeapons' | 'meleeWeapons';

/** The parts of a weapon the sheet prints on its line. */
export type SwnWeaponField = 'name' | 'damage' | 'range';

export function setSwnCharacterText(
  snapshot: SwnCharacterSnapshot,
  field: SwnCharacterTextField,
  value: string,
): SwnCharacterSnapshot {
  return { ...snapshot, [field]: value };
}

/**
 * A whole number on the sheet.
 *
 * A field the user has emptied arrives as `NaN` and is refused rather than stored: a character with
 * hit points of `NaN` is a payload that fails its own kind's validation, which the user would meet
 * as a broken artifact rather than as a rejected keystroke.
 */
export function setSwnCharacterNumber(
  snapshot: SwnCharacterSnapshot,
  field: SwnCharacterNumberField,
  value: number,
): SwnCharacterSnapshot {
  return Number.isFinite(value) ? { ...snapshot, [field]: value } : snapshot;
}

/** The background's name, which is what the sheet prints and what the character was built from. */
export function setSwnCharacterBackgroundName(
  snapshot: SwnCharacterSnapshot,
  name: string,
): SwnCharacterSnapshot {
  return { ...snapshot, background: { ...snapshot.background, name } };
}

export function setSwnCharacterClassName(
  snapshot: SwnCharacterSnapshot,
  name: string,
): SwnCharacterSnapshot {
  return { ...snapshot, characterClass: { ...snapshot.characterClass, name } };
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

/**
 * One half of one stat.
 *
 * The score and the modifier are edited separately and neither follows the other, for the reason in
 * the module comment. A user who wants the standard arithmetic asks for it.
 */
export function setSwnCharacterStat(
  snapshot: SwnCharacterSnapshot,
  index: number,
  part: 'score' | 'modifier',
  value: number,
): SwnCharacterSnapshot {
  if (!Number.isFinite(value) || !hasIndex(snapshot.stats.length, index)) {
    return snapshot;
  }
  const stat: Stat = { ...snapshot.stats[index], [part]: value };
  return { ...snapshot, stats: replaceAt(snapshot.stats, index, stat) };
}

/**
 * The six modifiers and the three saving throws as the rules would derive them from the scores.
 *
 * Offered as a command rather than run whenever a score changes — the destructive kind of helpful,
 * kept explicit. It touches nothing else: hit points, Effort, the attack bonuses and the armour
 * classes are left exactly as they are, because those took dice, a class and a pack of equipment
 * that this cannot reconstruct.
 */
export function swnDerivedFromStats(snapshot: SwnCharacterSnapshot): SwnCharacterSnapshot {
  const stats = snapshot.stats.map((stat) => ({
    ...stat,
    modifier: statModifierForScore(stat.score),
  }));
  const modifier = (abbreviation: string) =>
    stats.find((stat) => stat.abbreviation === abbreviation)?.modifier ?? 0;

  return {
    ...snapshot,
    stats,
    savingThrowMental: 15 - Math.max(modifier('WIS'), modifier('CHA')),
    savingThrowEvasion: 15 - Math.max(modifier('INT'), modifier('DEX')),
    savingThrowPhysical: 15 - Math.max(modifier('STR'), modifier('CON')),
  };
}

export function setSwnCharacterSkillName(
  snapshot: SwnCharacterSnapshot,
  index: number,
  name: string,
): SwnCharacterSnapshot {
  return hasIndex(snapshot.skills.length, index)
    ? {
        ...snapshot,
        skills: replaceAt(snapshot.skills, index, { ...snapshot.skills[index], name }),
      }
    : snapshot;
}

export function setSwnCharacterSkillLevel(
  snapshot: SwnCharacterSnapshot,
  index: number,
  level: number,
): SwnCharacterSnapshot {
  return Number.isFinite(level) && hasIndex(snapshot.skills.length, index)
    ? {
        ...snapshot,
        skills: replaceAt(snapshot.skills, index, { ...snapshot.skills[index], level }),
      }
    : snapshot;
}

/** A blank skill line. `non-combat` because it is the type most skills have, and it is editable. */
export function addSwnCharacterSkill(snapshot: SwnCharacterSnapshot): SwnCharacterSnapshot {
  return { ...snapshot, skills: [...snapshot.skills, createSkill('', 'non-combat')] };
}

export function removeSwnCharacterSkill(
  snapshot: SwnCharacterSnapshot,
  index: number,
): SwnCharacterSnapshot {
  return hasIndex(snapshot.skills.length, index)
    ? { ...snapshot, skills: removeAt(snapshot.skills, index) }
    : snapshot;
}

/**
 * A focus's name.
 *
 * The row is the pick: `focuses` carries the name and the level the character holds it at, and
 * editing either is how a user corrects what they took. The level-one and level-two descriptions
 * travel with it untouched — they are the rulebook's text, not the user's.
 */
export function setSwnCharacterFocusName(
  snapshot: SwnCharacterSnapshot,
  index: number,
  name: string,
): SwnCharacterSnapshot {
  return hasIndex(snapshot.focuses.length, index)
    ? {
        ...snapshot,
        focuses: replaceAt(snapshot.focuses, index, { ...snapshot.focuses[index], name }),
      }
    : snapshot;
}

export function setSwnCharacterFocusLevel(
  snapshot: SwnCharacterSnapshot,
  index: number,
  currentLevel: number,
): SwnCharacterSnapshot {
  return Number.isFinite(currentLevel) && hasIndex(snapshot.focuses.length, index)
    ? {
        ...snapshot,
        focuses: replaceAt(snapshot.focuses, index, {
          ...snapshot.focuses[index],
          currentLevel,
        }),
      }
    : snapshot;
}

export function removeSwnCharacterFocus(
  snapshot: SwnCharacterSnapshot,
  index: number,
): SwnCharacterSnapshot {
  return hasIndex(snapshot.focuses.length, index)
    ? { ...snapshot, focuses: removeAt(snapshot.focuses, index) }
    : snapshot;
}

/**
 * An ability's text.
 *
 * Abilities are stored as a union of effects, and every variant carries the description the sheet
 * prints. Only that description is offered: rewriting a `bonusSkillOfType`'s list of types would be
 * editing an instruction that has already run, and the skill it granted is in `skills` where a user
 * can see it.
 */
export function setSwnCharacterAbilityDescription(
  snapshot: SwnCharacterSnapshot,
  index: number,
  description: string,
): SwnCharacterSnapshot {
  return hasIndex(snapshot.abilities.length, index)
    ? {
        ...snapshot,
        abilities: replaceAt(snapshot.abilities, index, {
          ...snapshot.abilities[index],
          description,
        }),
      }
    : snapshot;
}

/** A blank ability, which is a plain described one: the variant that grants nothing by itself. */
export function addSwnCharacterAbility(snapshot: SwnCharacterSnapshot): SwnCharacterSnapshot {
  return { ...snapshot, abilities: [...snapshot.abilities, createSpecialAbility('')] };
}

export function removeSwnCharacterAbility(
  snapshot: SwnCharacterSnapshot,
  index: number,
): SwnCharacterSnapshot {
  return hasIndex(snapshot.abilities.length, index)
    ? { ...snapshot, abilities: removeAt(snapshot.abilities, index) }
    : snapshot;
}

export function setSwnCharacterEquipmentName(
  snapshot: SwnCharacterSnapshot,
  index: number,
  name: string,
): SwnCharacterSnapshot {
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

/** A blank pack item. A container would need a tech level nobody has said anything about. */
export function addSwnCharacterEquipment(snapshot: SwnCharacterSnapshot): SwnCharacterSnapshot {
  return { ...snapshot, equipment: [...snapshot.equipment, createMiscItem('')] };
}

export function removeSwnCharacterEquipment(
  snapshot: SwnCharacterSnapshot,
  index: number,
): SwnCharacterSnapshot {
  return hasIndex(snapshot.equipment.length, index)
    ? { ...snapshot, equipment: removeAt(snapshot.equipment, index) }
    : snapshot;
}

/**
 * One field of one weapon, in whichever of the two lists it is in.
 *
 * The lists do not talk to each other. A pistol in the ranged list and a pistol-whip in the melee
 * list are two lines on the sheet, and guessing that a rename of one was meant for the other would
 * be guessing.
 */
export function setSwnCharacterWeaponField(
  snapshot: SwnCharacterSnapshot,
  list: SwnWeaponList,
  index: number,
  field: SwnWeaponField,
  value: string,
): SwnCharacterSnapshot {
  return hasIndex(snapshot[list].length, index)
    ? {
        ...snapshot,
        [list]: replaceAt(snapshot[list], index, {
          ...snapshot[list][index],
          [field]: value,
        } as Weapon),
      }
    : snapshot;
}

export function addSwnCharacterWeapon(
  snapshot: SwnCharacterSnapshot,
  list: SwnWeaponList,
): SwnCharacterSnapshot {
  return { ...snapshot, [list]: [...snapshot[list], createWeapon('', '', '')] };
}

export function removeSwnCharacterWeapon(
  snapshot: SwnCharacterSnapshot,
  list: SwnWeaponList,
  index: number,
): SwnCharacterSnapshot {
  return hasIndex(snapshot[list].length, index)
    ? { ...snapshot, [list]: removeAt(snapshot[list], index) }
    : snapshot;
}

export function setSwnCharacterArmorName(
  snapshot: SwnCharacterSnapshot,
  index: number,
  name: string,
): SwnCharacterSnapshot {
  return hasIndex(snapshot.armor.length, index)
    ? { ...snapshot, armor: replaceAt(snapshot.armor, index, { ...snapshot.armor[index], name }) }
    : snapshot;
}

export function setSwnCharacterArmorClass(
  snapshot: SwnCharacterSnapshot,
  index: number,
  ac: number,
): SwnCharacterSnapshot {
  return Number.isFinite(ac) && hasIndex(snapshot.armor.length, index)
    ? { ...snapshot, armor: replaceAt(snapshot.armor, index, { ...snapshot.armor[index], ac }) }
    : snapshot;
}

export function addSwnCharacterArmor(snapshot: SwnCharacterSnapshot): SwnCharacterSnapshot {
  return { ...snapshot, armor: [...snapshot.armor, createArmor('', 10)] };
}

export function removeSwnCharacterArmor(
  snapshot: SwnCharacterSnapshot,
  index: number,
): SwnCharacterSnapshot {
  return hasIndex(snapshot.armor.length, index)
    ? { ...snapshot, armor: removeAt(snapshot.armor, index) }
    : snapshot;
}
