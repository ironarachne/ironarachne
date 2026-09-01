/**
 * Writing a family snapshot, and the shapes one is made of. Reading one back is
 * `family_rehydrate.ts`, split off for the reason the character's halves are: rebuilding a member
 * reaches the archetype tables, and rebuilding a name generator reaches the made-up-names package,
 * and nothing that merely stores, lists or validates a family needs either.
 *
 * **The payload is the graph — members plus the edges between them — and it is flat.** The graph
 * is the risk issue #55 names: a family contains cycles by construction, since two people are
 * each other's siblings and a spouse edge points both ways. But the members are a flat array and
 * the relationships reference ids, so nothing here refers to another object directly and
 * `structuredClone` never recurses. The graph is only a graph once `graph.ts` builds it.
 *
 * Three parts of a `Family` are not plain data, and each is written by the library that owns it:
 *
 * - **A member is a `Character`**, stored as `StoredCharacter` from `$lib/characters` — species and
 *   archetype by name, arms by their parts.
 * - **The two name generators carry closures.** They are stored as pattern sources, the way a
 *   culture's are, and rebuilt on read from the RNG the codec is handed. A family carries a female
 *   and a male generator only — not the six a culture does — so this is two pattern sources rather
 *   than a whole `StoredNameGeneratorPatternSet`, which would have to invent four it never had.
 * - **A relationship is plain records of ids** and a type that is a table row of strings. No
 *   conversion.
 *
 * The final `stripFunctionValuesDeep` is a net rather than the mechanism, as it is for a
 * settlement: everything this module knows to be a function has already been converted, and the
 * strip is what keeps a closure grown somewhere new from turning a save into a `DataCloneError`.
 */

import type { PatternSet } from '@ironarachne/made-up-names';

import { toStoredCharacter, type StoredCharacter } from '$lib/characters';
import { patternSourceFromNameGenerator } from '$lib/names';
import { stripFunctionValuesDeep } from '$lib/persistent_save';
import type { Relationship } from '$lib/relationships';

import type { Family } from './family_types.js';

/** What a name generator is rebuilt from: its patterns, or its patterns and combinations. */
export type StoredNamePatternSource = string[] | PatternSet;

/** The two generators a family names its children from, as pattern sources. */
export type StoredFamilyNamePatterns = {
  female: StoredNamePatternSource;
  male: StoredNamePatternSource;
};

/** A family as it is stored. */
export type FamilySnapshot = {
  id: string;
  name: string;
  headId?: string;
  members: StoredCharacter[];
  memberIds: string[];
  relationships: Relationship[];
  namePatterns: StoredFamilyNamePatterns;
};

export function toFamilySnapshot(family: Family): FamilySnapshot {
  const converted: FamilySnapshot = {
    id: family.id,
    name: family.name,
    ...(family.headId === undefined ? {} : { headId: family.headId }),
    members: family.members.map(toStoredCharacter),
    memberIds: [...family.memberIds],
    relationships: family.relationships.map((relationship) => ({ ...relationship })),
    namePatterns: {
      female: patternSourceFromNameGenerator(family.femaleNameGenerator),
      male: patternSourceFromNameGenerator(family.maleNameGenerator),
    },
  };
  return stripFunctionValuesDeep(converted) as FamilySnapshot;
}
