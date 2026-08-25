/**
 * The builder's decisions as data, and the pure function that turns them into a character.
 *
 * This is what lets the builder edit a *saved* character rather than only compose a new one, and
 * the whole of it turns on one field: `base`.
 *
 * Without a base, `buildAdndCharacter` derives a character from scratch, which is what the builder
 * has always done. With one, deriving is exactly the wrong move — a generated character carries
 * rolled proficiencies, a kit, and an exceptional strength score that no form field represents,
 * and re-deriving on open would discard all of them before the user touched anything. That is
 * requirement 4.2 failing at the moment the artifact is opened.
 *
 * So with a base whose structure still matches, the character *is* the base with the fields the
 * builder owns written over it. Nothing the builder does not model is touched. Change a
 * structural field — race, class, or an attribute — and there is no honest way to patch, because
 * everything downstream of a class comes from that class; then it derives, and the surface is
 * expected to have confirmed that as destructive first (4.3).
 */

import { RNG } from '@ironarachne/rng';

import {
  assignExceptionalStrength,
  getClassOptionsForRace,
  getRaceOptions,
} from './adnd_character_eligibility.js';
import {
  adndCharacterFromSnapshot,
  type AdndCharacterSnapshot,
} from './adnd_character_snapshot.js';
import {
  applyThiefSkillAllocation,
  getThiefSkillBuildKindForClass,
} from './adnd_thief_skill_builder.js';
import { startingSpellsFromPicks } from './adnd_class_starting_spells.js';
import type ADNDCharacter from './adndcharacter.js';
import { createAdndCharacter } from './adndcharacter.js';
import {
  applyAdndPriestFundsCapIfNeeded,
  finalizeAdndCharacterDerivedStats,
  recalculateAdndArmorClass,
} from './adndcharactergenerator.js';
import type ADNDClass from './adndclass.js';
import type ADNDRace from './adndrace.js';
import * as classes from './classes/classes.js';
import * as Equipment from './equipment.js';
import * as races from './races/races.js';
import { applyHalflingWithOptions, type HalflingSubrace } from './races/halfling_apply.js';

/** The six attributes, which together with race and class make up a build's structure. */
export type AdndAttributeScores = {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
};

/**
 * Everything the builder's form holds.
 *
 * `base` is the character being edited, or `null` when composing from nothing — which is how the
 * builder is reached from its own route with no artifact open.
 */
export type AdndCharacterBuild = {
  base: AdndCharacterSnapshot | null;
  attributes: AdndAttributeScores;
  raceName: string;
  className: string;
  alignment: string;
  halflingSubrace: HalflingSubrace;
  halflingInfravision: boolean;
  hp: number;
  startingWealthCp: number;
  selectedWeaponNames: string[];
  selectedArmorNames: string[];
  starterSpellPicks: string[][];
  thiefSkillPoints: Record<string, number>;
  classFeaturesSeed: string;
  firstName: string;
  lastName: string;
};

/** An empty build, for the builder opening on nothing. */
export function createAdndCharacterBuild(classFeaturesSeed: string): AdndCharacterBuild {
  return {
    base: null,
    attributes: {
      strength: 0,
      dexterity: 0,
      constitution: 0,
      intelligence: 0,
      wisdom: 0,
      charisma: 0,
    },
    raceName: '',
    className: '',
    alignment: '',
    halflingSubrace: 'Hairfeet',
    halflingInfravision: false,
    hp: 1,
    startingWealthCp: 0,
    selectedWeaponNames: [],
    selectedArmorNames: [],
    starterSpellPicks: [],
    thiefSkillPoints: {},
    classFeaturesSeed,
    firstName: '',
    lastName: '',
  };
}

function attributesOf(character: {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}): AdndAttributeScores {
  return {
    strength: character.strength,
    dexterity: character.dexterity,
    constitution: character.constitution,
    intelligence: character.intelligence,
    wisdom: character.wisdom,
    charisma: character.charisma,
  };
}

/**
 * Whether the build still describes the same character the base is.
 *
 * Only race, class, and the six attributes count. Everything else the builder offers — hit points,
 * funds, gear, spells, the thief allocation, names — is a field it writes over the base, so
 * changing one is an edit rather than a different character. These three are different: a class
 * decides hit dice, saving throws, proficiency counts, and what `apply` puts on the character, so
 * a new one cannot be patched in, only rolled for.
 *
 * A build with no base is not "unchanged"; there is nothing for it to match.
 */
export function adndBuildMatchesBase(build: AdndCharacterBuild): boolean {
  if (build.base === null) {
    return false;
  }
  const baseAttributes = attributesOf(build.base);
  const buildAttributes = build.attributes;
  return (
    build.base.raceName === build.raceName &&
    build.base.className === build.className &&
    baseAttributes.strength === buildAttributes.strength &&
    baseAttributes.dexterity === buildAttributes.dexterity &&
    baseAttributes.constitution === buildAttributes.constitution &&
    baseAttributes.intelligence === buildAttributes.intelligence &&
    baseAttributes.wisdom === buildAttributes.wisdom &&
    baseAttributes.charisma === buildAttributes.charisma
  );
}

/**
 * Whether applying this build to its base would throw work away.
 *
 * What the surface asks the user before letting a structural change through (4.3). It is false
 * when there is no base, because composing from nothing destroys nothing.
 */
export function adndBuildWouldRederive(build: AdndCharacterBuild): boolean {
  return build.base !== null && !adndBuildMatchesBase(build);
}

export function findAdndRace(name: string): ADNDRace | null {
  return races.getAll().find((race) => race.name === name) ?? null;
}

export function findAdndClass(name: string): ADNDClass | null {
  return classes.getAll().find((entry) => entry.name === name) ?? null;
}

function baseCharacterFromAttributes(attributes: AdndAttributeScores): ADNDCharacter {
  const character = createAdndCharacter();
  character.strength = attributes.strength;
  character.dexterity = attributes.dexterity;
  character.constitution = attributes.constitution;
  character.intelligence = attributes.intelligence;
  character.wisdom = attributes.wisdom;
  character.charisma = attributes.charisma;
  return character;
}

/** The races these attributes qualify for, for the control that offers them. */
export function adndRaceOptionsForBuild(build: AdndCharacterBuild): ADNDRace[] {
  if (build.attributes.strength < 1) {
    return [];
  }
  return getRaceOptions(baseCharacterFromAttributes(build.attributes), races.getAll());
}

/**
 * The character with its race applied and nothing else — the stage class eligibility is judged at.
 *
 * The race is applied from a seed derived from its own name rather than from the build's, so that
 * choosing a race twice gives the same racial adjustments. A race's `apply` is mostly deterministic
 * anyway; the fixed seed is what makes "mostly" not matter.
 */
export function adndCharacterAfterRace(build: AdndCharacterBuild): ADNDCharacter | null {
  const race = findAdndRace(build.raceName);
  if (race === null || build.attributes.strength < 1) {
    return null;
  }
  const character = baseCharacterFromAttributes(build.attributes);
  character.race = race;
  if (race.name === 'halfling') {
    applyHalflingWithOptions(character, {
      subrace: build.halflingSubrace,
      hasInfravision: build.halflingInfravision,
    });
  } else {
    race.apply(character, new RNG(`race-${race.name}`));
  }
  return character;
}

/** The classes this build's race and attributes allow, for the control that offers them. */
export function adndClassOptionsForBuild(build: AdndCharacterBuild): ADNDClass[] {
  const afterRace = adndCharacterAfterRace(build);
  const race = findAdndRace(build.raceName);
  if (afterRace === null || race === null) {
    return [];
  }
  return getClassOptionsForRace(afterRace, race, classes.getAll());
}

function itemsByName<T extends { name: string }>(names: string[], available: T[]): T[] {
  const found: T[] = [];
  for (const name of names) {
    const item = available.find((entry) => entry.name === name);
    if (item !== undefined) {
      found.push(item);
    }
  }
  return found;
}

/**
 * The fields the builder owns, written onto a character that already exists.
 *
 * Deliberately a short list, and the shortness is the point: what is not here is what survives
 * editing a generated character — proficiencies, the kit, the ability lines, exceptional strength,
 * and every derived number the payload carries.
 */
function applyBuildFields(character: ADNDCharacter, build: AdndCharacterBuild): void {
  const cls = character.class;
  character.alignment = build.alignment;
  character.firstName = build.firstName;
  character.lastName = build.lastName;
  character.hp = build.hp;

  if (cls.hasSpells) {
    character.spells = startingSpellsFromPicks(cls, build.starterSpellPicks);
  }

  const thiefSkillKind = getThiefSkillBuildKindForClass(cls.name);
  if (thiefSkillKind !== null) {
    applyThiefSkillAllocation(character, thiefSkillKind, build.thiefSkillPoints);
  }

  character.weapons = itemsByName(build.selectedWeaponNames, Equipment.getWeapons());
  character.armor = itemsByName(build.selectedArmorNames, Equipment.getArmor());

  const spent = [...character.weapons, ...character.armor].reduce(
    (total, item) => total + item.cost,
    0,
  );
  const purse = Math.max(0, build.startingWealthCp - spent);
  character.currency = purse;
  applyAdndPriestFundsCapIfNeeded(
    character,
    new RNG(`priest-purse-${build.classFeaturesSeed}-${build.startingWealthCp}-${spent}-${purse}`),
  );

  recalculateAdndArmorClass(character);
}

/**
 * Derive a character from the build alone, as the builder has always done.
 *
 * Class features are applied with `spells: 'user'` and `thiefSkills: 'user'`, so the class rolls
 * nothing the user is about to choose, and from a seed the build carries so that the parts it
 * *does* roll — exceptional strength among them — come back the same on every keystroke.
 */
function deriveAdndCharacter(build: AdndCharacterBuild): ADNDCharacter | null {
  const afterRace = adndCharacterAfterRace(build);
  const cls = findAdndClass(build.className);
  if (afterRace === null || cls === null || build.alignment === '') {
    return null;
  }

  const character = afterRace;
  character.class = cls;
  const featureRng = new RNG(build.classFeaturesSeed);
  cls.apply(character, featureRng, { spells: 'user', thiefSkills: 'user' });
  assignExceptionalStrength(character, cls, featureRng);

  applyBuildFields(character, build);
  finalizeAdndCharacterDerivedStats(character);
  recalculateAdndArmorClass(character);
  return character;
}

/**
 * Write the build's fields over the character it is editing, leaving everything else alone.
 *
 * `finalizeAdndCharacterDerivedStats` is deliberately **not** called here. On this path the
 * payload is authoritative: a saved character's THAC0 and saving throws are what it was stored
 * with, hand-edited or not, and recomputing them on every keystroke is exactly the silent
 * regeneration requirement 4.2 forbids. Armor class is the one exception, because the builder
 * owns the armor list and an AC that disagreed with the armor beside it would be a bug the user
 * can see.
 */
function patchAdndCharacter(build: AdndCharacterBuild, base: AdndCharacterSnapshot): ADNDCharacter {
  const character = adndCharacterFromSnapshot(base);
  applyBuildFields(character, build);
  return character;
}

/**
 * The character this build describes, or `null` when it is not finished enough to be one.
 *
 * The two paths are the whole design; see the module comment.
 */
export function buildAdndCharacter(build: AdndCharacterBuild): ADNDCharacter | null {
  if (build.base !== null && adndBuildMatchesBase(build)) {
    return patchAdndCharacter(build, build.base);
  }
  return deriveAdndCharacter(build);
}

/**
 * A saved character back into the builder's form.
 *
 * Exact for everything the builder models, because the character carries it: attributes, race and
 * class names, alignment, gear by name, the thief allocation now that it is a field, and the
 * names. Two things are reconstructed rather than read:
 *
 * - **Starting funds** are the purse plus what the stored gear cost, which is what the user
 *   originally had to spend.
 * - **`classFeaturesSeed`** is not in the payload and does not need to be: nothing is re-derived
 *   while the structure holds, and the moment the user forces a structural change a fresh seed is
 *   the right answer anyway. The caller supplies one.
 *
 * The halfling options are the honest gap. A stored halfling records the subrace's effects but not
 * which subrace was chosen, so this defaults them; they are only read again if the user re-derives,
 * which already discards more than that.
 */
export function adndBuildFromSnapshot(
  snapshot: AdndCharacterSnapshot,
  classFeaturesSeed: string,
): AdndCharacterBuild {
  const spent = [...snapshot.weapons, ...snapshot.armor].reduce(
    (total, item) => total + item.cost,
    0,
  );
  const cls = findAdndClass(snapshot.className);
  const spellPicks =
    cls !== null && cls.hasSpells ? [snapshot.spells.map((spell) => spell.name)] : [];

  return {
    base: snapshot,
    attributes: attributesOf(snapshot),
    raceName: snapshot.raceName,
    className: snapshot.className,
    alignment: snapshot.alignment,
    halflingSubrace: 'Hairfeet',
    halflingInfravision: false,
    hp: snapshot.hp,
    startingWealthCp: snapshot.currency + spent,
    selectedWeaponNames: snapshot.weapons.map((weapon) => weapon.name),
    selectedArmorNames: snapshot.armor.map((armor) => armor.name),
    starterSpellPicks: spellPicks,
    thiefSkillPoints: Object.fromEntries(snapshot.thiefSkills.map((row) => [row.name, row.points])),
    classFeaturesSeed,
    firstName: snapshot.firstName,
    lastName: snapshot.lastName,
  };
}
