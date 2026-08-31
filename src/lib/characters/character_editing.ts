/**
 * Editing a stored character, one field at a time.
 *
 * Every function here takes a snapshot and returns a new one, changing nothing in place. That is
 * requirement 4.4 of docs/workshop.md satisfied by construction — renaming a character must not
 * disturb their traits, and rewriting one trait must not re-roll the rest — and it is what lets the
 * editing framework compare what is on screen against what was read to decide whether anything
 * needs saving.
 *
 * They work on the **snapshot**, not a live `Character`, because the snapshot is what is stored and
 * what the kind's `validate` speaks. An editor working on live values would run the codec both ways
 * on every keystroke and hand back a payload one conversion further from what the user kept.
 *
 * **Species is not among them.** Changing a saved character's species does not recompute the
 * height, weight or physical traits that species produced, so the result would be an elf with a
 * halfling's build until the user fixed the rest by hand. It is shown read-only and a re-roll is
 * how a character becomes a different species — the question docs/fantasy-character.md left open,
 * answered that way deliberately.
 */

import { humanStandard, type AgeCategory } from '$lib/age';
import type { Ability } from '$lib/abilities';
import type { Item } from '$lib/equipment';
import { traditional, type Gender } from '$lib/gender';
import type { StoredArms } from '$lib/heraldry';
import type { PhysicalTrait } from '$lib/physical_traits';

import { formatCharacterDisplayName } from './character_name_generation.js';
import type { CharacterSnapshot } from './character_snapshot.js';
import type { Title } from './character_types.js';

/** The prose fields an editing view puts in a textarea each. */
export type CharacterTextField = 'description' | 'shortDescription';

/** The measurements the sheet shows, in the units it shows them in. */
export type CharacterMeasurementField = 'height' | 'weight' | 'length';

/** A named-and-described entry: a physical trait, or an ability. Both edit identically. */
export type CharacterDescribedListField = 'physicalTraits' | 'abilities';

/** The parts of a title a user may rewrite. Everything else about one is precedence and flags. */
export type CharacterTitleField =
  | 'maleTitle'
  | 'femaleTitle'
  | 'maleHonorific'
  | 'femaleHonorific'
  | 'landName';

/** The genders an editor offers. The build's standard set, since a placeholder species has none. */
export function characterGenderOptions(): Gender[] {
  return traditional();
}

/** The age categories an editor offers, for the same reason {@link characterGenderOptions} exists. */
export function characterAgeCategoryOptions(): AgeCategory[] {
  return humanStandard();
}

/**
 * Rewrite a name part, and the display name with it.
 *
 * The two go together on purpose: `name` is derived from the other two everywhere else in the
 * library, and an editor that let them drift would produce a character whose heading and whose
 * name fields disagreed. It is the same helper the roll uses, which is what keeps them in step.
 */
export function setCharacterNamePart(
  snapshot: CharacterSnapshot,
  part: 'firstName' | 'lastName',
  value: string,
): CharacterSnapshot {
  const firstName = part === 'firstName' ? value : snapshot.firstName;
  const lastName = part === 'lastName' ? value : snapshot.lastName;
  return {
    ...snapshot,
    firstName,
    lastName,
    name: formatCharacterDisplayName(firstName, lastName),
  };
}

export function setCharacterText(
  snapshot: CharacterSnapshot,
  field: CharacterTextField,
  value: string,
): CharacterSnapshot {
  return { ...snapshot, [field]: value };
}

/**
 * A measurement, as a number.
 *
 * A field the user has emptied arrives as `NaN` and is refused rather than stored: a character with
 * a height of `NaN` is a payload that fails its own kind's validation, which the user would meet as
 * a broken artifact rather than as a rejected keystroke.
 */
export function setCharacterMeasurement(
  snapshot: CharacterSnapshot,
  field: CharacterMeasurementField,
  value: number,
): CharacterSnapshot {
  return Number.isFinite(value) ? { ...snapshot, [field]: value } : snapshot;
}

export function setCharacterAge(snapshot: CharacterSnapshot, age: number): CharacterSnapshot {
  return Number.isFinite(age) ? { ...snapshot, age } : snapshot;
}

/**
 * The character's gender, taken whole from the offered set.
 *
 * Whole because a gender carries its pronouns, and the description prose reads them. Setting the
 * name alone would leave a character described as "she" and labelled male.
 */
export function setCharacterGender(snapshot: CharacterSnapshot, name: string): CharacterSnapshot {
  const gender = characterGenderOptions().find((entry) => entry.name === name);
  return gender === undefined ? snapshot : { ...snapshot, gender };
}

/** The age category, likewise taken whole: the noun on it is what the short description reads. */
export function setCharacterAgeCategory(
  snapshot: CharacterSnapshot,
  name: string,
): CharacterSnapshot {
  const ageCategory = characterAgeCategoryOptions().find((entry) => entry.name === name);
  return ageCategory === undefined ? snapshot : { ...snapshot, ageCategory };
}

/**
 * The archetype's name, leaving its tags and abilities as they are.
 *
 * A character with no archetype gains none here — an occupation is something a re-roll gives, and
 * inventing an empty one from a text field would put a nameless archetype on the sheet.
 */
export function setCharacterArchetypeName(
  snapshot: CharacterSnapshot,
  name: string,
): CharacterSnapshot {
  return snapshot.archetype === undefined
    ? snapshot
    : { ...snapshot, archetype: { ...snapshot.archetype, name } };
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

export function setCharacterPersonalityTrait(
  snapshot: CharacterSnapshot,
  index: number,
  value: string,
): CharacterSnapshot {
  return hasIndex(snapshot.personalityTraits.length, index)
    ? { ...snapshot, personalityTraits: replaceAt(snapshot.personalityTraits, index, value) }
    : snapshot;
}

export function addCharacterPersonalityTrait(
  snapshot: CharacterSnapshot,
  value = '',
): CharacterSnapshot {
  return { ...snapshot, personalityTraits: [...snapshot.personalityTraits, value] };
}

export function removeCharacterPersonalityTrait(
  snapshot: CharacterSnapshot,
  index: number,
): CharacterSnapshot {
  return hasIndex(snapshot.personalityTraits.length, index)
    ? { ...snapshot, personalityTraits: removeAt(snapshot.personalityTraits, index) }
    : snapshot;
}

/**
 * One field of one physical trait or ability.
 *
 * The two lists share these three functions because they are the same shape and behave the same
 * way. Three pairs of near-identical functions is how the pair that gets fixed and the pair that
 * does not come to differ.
 */
export function setCharacterDescribedEntry(
  snapshot: CharacterSnapshot,
  list: CharacterDescribedListField,
  index: number,
  field: 'name' | 'description',
  value: string,
): CharacterSnapshot {
  const entries = snapshot[list];
  if (!hasIndex(entries.length, index)) {
    return snapshot;
  }
  const updated = { ...entries[index], [field]: value };
  return {
    ...snapshot,
    [list]: replaceAt(entries as (PhysicalTrait | Ability)[], index, updated),
  } as CharacterSnapshot;
}

export function addCharacterDescribedEntry(
  snapshot: CharacterSnapshot,
  list: CharacterDescribedListField,
): CharacterSnapshot {
  const entry = { name: '', description: '', category: '', tags: [] };
  return { ...snapshot, [list]: [...snapshot[list], entry] } as CharacterSnapshot;
}

export function removeCharacterDescribedEntry(
  snapshot: CharacterSnapshot,
  list: CharacterDescribedListField,
  index: number,
): CharacterSnapshot {
  const entries = snapshot[list];
  return hasIndex(entries.length, index)
    ? ({ ...snapshot, [list]: removeAt(entries as unknown[], index) } as CharacterSnapshot)
    : snapshot;
}

export function setCharacterCarriedName(
  snapshot: CharacterSnapshot,
  index: number,
  name: string,
): CharacterSnapshot {
  return hasIndex(snapshot.carried.length, index)
    ? {
        ...snapshot,
        carried: replaceAt(snapshot.carried, index, { ...snapshot.carried[index], name }),
      }
    : snapshot;
}

/**
 * A blank item, for something a character picked up that no generator gave them.
 *
 * The fields beyond name and description are what a generator rolled the item *from* — its
 * material, rarity, value, weight — and they are set to the neutral end of each rather than
 * guessed. An item a user typed has no provenance, and inventing some would put numbers on the
 * sheet that nothing stands behind.
 */
export function addCharacterCarried(snapshot: CharacterSnapshot): CharacterSnapshot {
  const item: Item = {
    id: '',
    name: '',
    description: '',
    itemMajorType: '',
    value: 0,
    rarity: 'common',
    densityCategory: 'standard',
    weight: 0,
    properties: [],
  };
  return { ...snapshot, carried: [...snapshot.carried, item] };
}

export function removeCharacterCarried(
  snapshot: CharacterSnapshot,
  index: number,
): CharacterSnapshot {
  return hasIndex(snapshot.carried.length, index)
    ? { ...snapshot, carried: removeAt(snapshot.carried, index) }
    : snapshot;
}

export function setCharacterTitleField(
  snapshot: CharacterSnapshot,
  index: number,
  field: CharacterTitleField,
  value: string,
): CharacterSnapshot {
  const titles = snapshot.titles ?? [];
  if (!hasIndex(titles.length, index)) {
    return snapshot;
  }
  return { ...snapshot, titles: replaceAt(titles, index, { ...titles[index], [field]: value }) };
}

export function removeCharacterTitle(
  snapshot: CharacterSnapshot,
  index: number,
): CharacterSnapshot {
  const titles = snapshot.titles ?? [];
  return hasIndex(titles.length, index)
    ? { ...snapshot, titles: removeAt(titles, index) }
    : snapshot;
}

/** An empty title, for a character who has come into one the generator did not give them. */
export function addCharacterTitle(snapshot: CharacterSnapshot): CharacterSnapshot {
  const title: Title = {
    maleTitle: '',
    femaleTitle: '',
    maleHonorific: '',
    femaleHonorific: '',
    hasLands: false,
    isHereditary: false,
    isNoble: true,
    isRoyal: false,
    landName: '',
    precedence: 0,
    tags: [],
  };
  return { ...snapshot, titles: [...(snapshot.titles ?? []), title] };
}

/**
 * The character's coat of arms: their own, none, or a referenced artifact's.
 *
 * `null` is what says the arms belong to a saved coat of arms rather than to this character — the
 * shape `culture` uses for a referenced religion, and what requirement 5.2 asks for. Copying the
 * arms in instead would fork them at the moment of saving, so an edit to that coat of arms would
 * never reach the character wearing it.
 */
export function setCharacterHeraldry(
  snapshot: CharacterSnapshot,
  arms: StoredArms | null | undefined,
): CharacterSnapshot {
  if (arms === undefined) {
    const { heraldry: _heraldry, ...rest } = snapshot;
    return rest;
  }
  return { ...snapshot, heraldry: arms };
}
