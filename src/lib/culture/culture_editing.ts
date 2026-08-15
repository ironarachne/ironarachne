import { describeOrganization } from './culture_generation';
import type { CultureSnapshot } from './culture_snapshot';

/**
 * The plain-prose traits of a culture — the fields an editing view puts in a textarea each.
 *
 * Named as a set rather than edited through one function per field because they behave
 * identically: a string shown to the user that the user may rewrite.
 */
export type CultureTraitField = 'greeting' | 'eatingTrait' | 'designTrait' | 'musicStyle';

/** The parts of a culture's social structure a user can rewrite. */
export type CultureOrganizationField =
  | 'powerConcentration'
  | 'socialMobility'
  | 'dominantProfession'
  | 'dominantGender'
  | 'description';

/** The fields of an embedded religion that a culture displays, and so must let a user change. */
export type CultureReligionField = 'name' | 'description';

/**
 * Editing a stored culture, one field at a time.
 *
 * Every function here takes a snapshot and returns a new one, changing nothing in place. That is
 * what requirement 4.4 asks for in practice — renaming a culture must not disturb its taboos, and
 * rewriting one taboo must not re-roll the rest — and it is what lets the editing framework
 * compare what is on screen against what was read to decide whether anything needs saving.
 *
 * They work on the **snapshot**, not a live `Culture`, because the snapshot is what is stored and
 * what the kind's `validate` speaks. An editor that worked on live values would run the codec both
 * ways on every keystroke and hand back a payload one conversion further from what the user kept.
 */
export function renameCulture(snapshot: CultureSnapshot, name: string): CultureSnapshot {
  return { ...snapshot, name };
}

export function setCultureTrait(
  snapshot: CultureSnapshot,
  field: CultureTraitField,
  value: string,
): CultureSnapshot {
  return { ...snapshot, [field]: value };
}

export function setCultureOrganizationField(
  snapshot: CultureSnapshot,
  field: CultureOrganizationField,
  value: string,
): CultureSnapshot {
  return { ...snapshot, organization: { ...snapshot.organization, [field]: value } };
}

/**
 * Rewrite the organization's prose from its attributes, as the generator first wrote it.
 *
 * Offered as an action the user takes rather than run whenever an attribute changes. The stored
 * description is the user's — requirement 4.2 — and quietly recomposing it the moment they adjusted
 * a dropdown would throw away a paragraph they had written by hand, which is the one thing editing
 * exists to protect.
 */
export function redescribeCultureOrganization(snapshot: CultureSnapshot): CultureSnapshot {
  return {
    ...snapshot,
    organization: {
      ...snapshot.organization,
      description: describeOrganization(snapshot.organization),
    },
  };
}

/** Rewrite one taboo, leaving every other one alone. An index nothing lives at changes nothing. */
export function setCultureTaboo(
  snapshot: CultureSnapshot,
  index: number,
  value: string,
): CultureSnapshot {
  if (!hasTabooAt(snapshot, index)) {
    return snapshot;
  }
  return {
    ...snapshot,
    taboos: snapshot.taboos.map((taboo, position) => (position === index ? value : taboo)),
  };
}

export function addCultureTaboo(snapshot: CultureSnapshot, value = ''): CultureSnapshot {
  return { ...snapshot, taboos: [...snapshot.taboos, value] };
}

export function removeCultureTaboo(snapshot: CultureSnapshot, index: number): CultureSnapshot {
  if (!hasTabooAt(snapshot, index)) {
    return snapshot;
  }
  return { ...snapshot, taboos: snapshot.taboos.filter((_taboo, position) => position !== index) };
}

function hasTabooAt(snapshot: CultureSnapshot, index: number): boolean {
  return Number.isInteger(index) && index >= 0 && index < snapshot.taboos.length;
}

/**
 * Rewrite part of the religion a culture owns.
 *
 * A culture whose religion is `null` has one by reference, and that religion is a separate artifact
 * with its own editor: changing it from here would be editing someone else's record through a
 * window, so this leaves such a culture exactly as it is.
 */
export function setCultureReligionField(
  snapshot: CultureSnapshot,
  field: CultureReligionField,
  value: string,
): CultureSnapshot {
  if (snapshot.religion === null) {
    return snapshot;
  }
  return { ...snapshot, religion: { ...snapshot.religion, [field]: value } };
}
