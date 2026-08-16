import type { Relationship } from '$lib/relationships';

import type { ReligionDimensionId } from './comparative_dimension_types';
import type { ReligionSnapshot } from './religion_snapshot';

/** The parts of a spirit echelon a user can rewrite: what the order is called, and what it does. */
export type SpiritEchelonField = 'label' | 'summary';

/** The deepest an order of spirits nests, as `SpiritEchelon` documents and generation draws. */
export const MAX_RANK_DEPTH = 3;

/** The fields of one deity a user would reasonably want to change. */
export type DeityField = 'name' | 'description' | 'holyItem' | 'holySymbol';

/** The fields of a divine realm a user would reasonably want to change. */
export type DivineRealmField = 'name' | 'description';

/** The prose a non-theistic tradition carries instead of a pantheon. */
export type NonTheisticField = 'mediationSummary' | 'pollutionOrPurityNotes' | 'narrativeSummary';

/**
 * Editing a stored religion, one part at a time.
 *
 * Every function here takes a snapshot and returns a new one, changing nothing in place — the same
 * bargain `culture_editing.ts` makes, and for the same two reasons. It is what requirement 4.4 of
 * docs/workshop.md asks for in practice, which for this kind is the headline case: renaming one
 * deity must leave the rest of the pantheon exactly as it was. And it is what lets the editing
 * framework compare what is on screen against what was read to decide whether anything needs
 * saving.
 *
 * They work on the **snapshot** rather than a live `Religion` because the snapshot is what is
 * stored and what the kind's `validate` speaks. For this kind the two are nearly the same object —
 * a religion snapshot is already plain data — but an editor that went through the codec would
 * still hand back a payload one conversion further from what the user kept.
 *
 * An index nothing lives at changes nothing, rather than growing a hole in an array or throwing at
 * a user who clicked a control that has since gone.
 */
export function renameReligion(snapshot: ReligionSnapshot, name: string): ReligionSnapshot {
  // Both, deliberately. The envelope's `name` is the copy `nameOf` reads to label an artifact, so
  // leaving it behind would mean a religion that answers to one name in the store and another on
  // the page.
  return { ...snapshot, name, religion: { ...snapshot.religion, name } };
}

export function setReligionDescription(
  snapshot: ReligionSnapshot,
  description: string,
): ReligionSnapshot {
  return { ...snapshot, religion: { ...snapshot.religion, description } };
}

/**
 * Rewrite the summary of one comparative dimension.
 *
 * The mythological dimension keeps its prose in `centralMythSummary` where the other six use
 * `summary`; `summaryTextForReligionDimension` already reads both, and this writes to whichever
 * the dimension actually has so the two stay the same field.
 */
export function setReligionDimensionSummary(
  snapshot: ReligionSnapshot,
  id: ReligionDimensionId,
  value: string,
): ReligionSnapshot {
  const dimensions = snapshot.religion.dimensions;
  const dimension = dimensions?.[id];
  if (dimensions === undefined || dimension === undefined) {
    return snapshot;
  }
  const field = id === 'mythological' ? 'centralMythSummary' : 'summary';
  return {
    ...snapshot,
    religion: {
      ...snapshot.religion,
      dimensions: { ...dimensions, [id]: { ...dimension, [field]: value } },
    },
  };
}

export function setReligionCosmologySummary(
  snapshot: ReligionSnapshot,
  summary: string,
): ReligionSnapshot {
  const cosmology = snapshot.religion.cosmology;
  if (cosmology === undefined) {
    return snapshot;
  }
  return { ...snapshot, religion: { ...snapshot.religion, cosmology: { ...cosmology, summary } } };
}

export function setSpiritEchelonField(
  snapshot: ReligionSnapshot,
  index: number,
  field: SpiritEchelonField,
  value: string,
): ReligionSnapshot {
  const cosmology = snapshot.religion.cosmology;
  if (cosmology === undefined || !hasIndex(cosmology.echelons, index)) {
    return snapshot;
  }
  return {
    ...snapshot,
    religion: {
      ...snapshot.religion,
      cosmology: {
        ...cosmology,
        echelons: cosmology.echelons.map((echelon, position) =>
          position === index ? { ...echelon, [field]: value } : echelon,
        ),
      },
    },
  };
}

/**
 * Set how many nested grades an order of spirits is said to have.
 *
 * The one number on this form, and it is shown to the reader as "rank depth 2", so it has to be
 * editable for requirement 4.1 to hold. Anything that is not a whole number in the range the
 * generator draws from is refused rather than stored: a rank depth of 2.5 or -1 would print, and
 * would mean nothing.
 */
export function setSpiritEchelonRankDepth(
  snapshot: ReligionSnapshot,
  index: number,
  rankDepth: number,
): ReligionSnapshot {
  const cosmology = snapshot.religion.cosmology;
  if (cosmology === undefined || !hasIndex(cosmology.echelons, index)) {
    return snapshot;
  }
  if (!Number.isInteger(rankDepth) || rankDepth < 1 || rankDepth > MAX_RANK_DEPTH) {
    return snapshot;
  }
  return {
    ...snapshot,
    religion: {
      ...snapshot.religion,
      cosmology: {
        ...cosmology,
        echelons: cosmology.echelons.map((echelon, position) =>
          position === index ? { ...echelon, rankDepth } : echelon,
        ),
      },
    },
  };
}

export function setDivineRealmField(
  snapshot: ReligionSnapshot,
  index: number,
  field: DivineRealmField,
  value: string,
): ReligionSnapshot {
  if (!hasIndex(snapshot.religion.realms, index)) {
    return snapshot;
  }
  return {
    ...snapshot,
    religion: {
      ...snapshot.religion,
      realms: snapshot.religion.realms.map((realm, position) =>
        position === index ? { ...realm, [field]: value } : realm,
      ),
    },
  };
}

export function setPantheonDescription(
  snapshot: ReligionSnapshot,
  description: string,
): ReligionSnapshot {
  const pantheon = snapshot.religion.pantheon;
  if (pantheon === null) {
    return snapshot;
  }
  return {
    ...snapshot,
    religion: { ...snapshot.religion, pantheon: { ...pantheon, description } },
  };
}

/**
 * Rewrite one field of one deity.
 *
 * This is requirement 4.4's headline case for this kind: a pantheon is a list of sub-objects, and
 * renaming the god of storms must not disturb the god beside them, their relationships, or the
 * seed the whole thing came from.
 *
 * A deity's holy item and symbol are `string | null` — a god of a domain with no holy items has
 * neither — so clearing the field stores `null` rather than an empty string, which is what the
 * rest of the library already tests for when deciding whether to print the line at all.
 */
export function setDeityField(
  snapshot: ReligionSnapshot,
  index: number,
  field: DeityField,
  value: string,
): ReligionSnapshot {
  const pantheon = snapshot.religion.pantheon;
  if (pantheon === null || !hasIndex(pantheon.members, index)) {
    return snapshot;
  }
  const stored = field === 'holyItem' || field === 'holySymbol' ? emptyToNull(value) : value;
  return {
    ...snapshot,
    religion: {
      ...snapshot.religion,
      pantheon: {
        ...pantheon,
        members: pantheon.members.map((member, position) =>
          position === index ? { ...member, [field]: stored } : member,
        ),
      },
    },
  };
}

/**
 * Rewrite what one relationship between two gods says.
 *
 * A pantheon holds its relationships **twice**: once on the pantheon, and once on each god, filtered
 * to the ones they originate. The page prints the copy on the god, so an edit that touched only
 * that copy would leave the pantheon's saying the older thing — and whichever is read next would
 * decide what the user's edit meant. This writes both, matched by the relationship's own id.
 */
export function setDeityRelationshipDescription(
  snapshot: ReligionSnapshot,
  deityIndex: number,
  relationshipIndex: number,
  description: string,
): ReligionSnapshot {
  const pantheon = snapshot.religion.pantheon;
  if (pantheon === null || !hasIndex(pantheon.members, deityIndex)) {
    return snapshot;
  }
  const deity = pantheon.members[deityIndex];
  if (!hasIndex(deity.relationships, relationshipIndex)) {
    return snapshot;
  }

  const { id } = deity.relationships[relationshipIndex];
  const rewrite = (relationship: Relationship) =>
    relationship.id === id ? { ...relationship, description } : relationship;

  return {
    ...snapshot,
    religion: {
      ...snapshot.religion,
      pantheon: {
        ...pantheon,
        members: pantheon.members.map((member) => ({
          ...member,
          relationships: member.relationships.map(rewrite),
        })),
        relationships: pantheon.relationships.map(rewrite),
      },
    },
  };
}

/**
 * Remove one deity from the pantheon, and everything that pointed at them.
 *
 * Three things move together, which is why this is a function rather than a splice at the call
 * site. The relationships naming that deity go, on the pantheon and on every other member, because
 * a relationship to a god who is not there any more describes nothing. The leader index is a
 * *position*, so removing anyone before the leader would otherwise crown the god who moved up into
 * their slot. And a pantheon emptied entirely has no leader, which is `-1` — the same value
 * generation writes when a category has no leader at all.
 *
 * There is deliberately no counterpart that adds one. A deity is a generated character with a
 * species, an age, physical traits, and a domain set; an "empty" one would be a broken record
 * rather than a blank field, and rolling a fresh one here would be generating over a payload the
 * user is in the middle of editing. Re-rolling the religion is the path to more gods.
 */
export function removeDeity(snapshot: ReligionSnapshot, index: number): ReligionSnapshot {
  const pantheon = snapshot.religion.pantheon;
  if (pantheon === null || !hasIndex(pantheon.members, index)) {
    return snapshot;
  }

  const removed = pantheon.members[index];
  const members = pantheon.members
    .filter((_member, position) => position !== index)
    .map((member) => ({
      ...member,
      relationships: member.relationships.filter(
        (relationship) => !names(relationship, removed.id),
      ),
    }));

  return {
    ...snapshot,
    religion: {
      ...snapshot.religion,
      pantheon: {
        ...pantheon,
        members,
        relationships: pantheon.relationships.filter(
          (relationship) => !names(relationship, removed.id),
        ),
        leader: leaderAfterRemoval(pantheon.leader, index, members.length),
      },
    },
  };
}

export function setNonTheisticField(
  snapshot: ReligionSnapshot,
  field: NonTheisticField,
  value: string,
): ReligionSnapshot {
  const detail = snapshot.religion.nonTheisticDetail;
  if (detail === undefined) {
    return snapshot;
  }
  return {
    ...snapshot,
    religion: { ...snapshot.religion, nonTheisticDetail: { ...detail, [field]: value } },
  };
}

function hasIndex(items: unknown[], index: number): boolean {
  return Number.isInteger(index) && index >= 0 && index < items.length;
}

function emptyToNull(value: string): string | null {
  return value.trim() === '' ? null : value;
}

function names(relationship: { originatorId: string; recipientId: string }, id: string): boolean {
  return relationship.originatorId === id || relationship.recipientId === id;
}

/** Where the leader ends up once the deity at `index` is gone. */
function leaderAfterRemoval(leader: number, index: number, remaining: number): number {
  if (remaining === 0 || leader === index) {
    return -1;
  }
  return leader > index ? leader - 1 : leader;
}
