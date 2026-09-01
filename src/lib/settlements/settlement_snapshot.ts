/**
 * Writing a settlement snapshot, and the shapes one is made of. Reading one back is
 * `settlement_rehydrate.ts`, split off for the reason heraldry's is: turning stored names back
 * into charges reaches `$lib/charges`, which is 18 MB of glyph art, and nothing that merely
 * stores, lists, or validates a settlement needs it.
 *
 * A settlement is the first artifact payload on the site built against the kind contract from
 * scratch rather than retrofitted, and four things in it are not plain data. Each is handled
 * explicitly here rather than left to a blanket strip, because requirement 3.2 in
 * docs/workshop.md asks for exactly that — stripped *or reconstructed*, and named either way:
 *
 * - **An organization's hierarchy is three `Map`s.** `JSON.stringify` turns a `Map` into `{}`
 *   without complaining, so a settlement stored naively came back with every organization's
 *   structure silently emptied. They are stored as entry arrays.
 * - **A coat of arms carries a render function.** `arrangement.renderSVG` is a function on every
 *   charge group, which `structuredClone` — what IndexedDB stores with — refuses outright. Arms
 *   are stored the way the heraldry kind stores them, by the names of their parts.
 * - **An archetype carries its own generator tables.** `equipmentGenerationConfigs` is 66 KB per
 *   character, measured, and it is the input a character was rolled *from* rather than anything
 *   about the character. Kept, one enriched settlement is a megabyte and a campaign's worth is a
 *   storage-quota problem; dropped and rebuilt from the archetype's name, the same settlement is
 *   about forty kilobytes. That is the trade the heraldry kind already makes with charge names.
 * - **A character embeds a whole species.** Age categories, a size matrix, physical-trait configs
 *   and abilities, none of it about this person and all of it repeated per notable. Stored by name
 *   since payload version 2; see `migrateSettlementSnapshot`, which is what brings a version 1
 *   settlement's notables forward.
 */

import { toStoredCharacter, type StoredCharacter } from '$lib/characters';
import { toStoredOrganization, type StoredOrganization } from '$lib/organizations';
import { stripFunctionValuesDeep } from '$lib/persistent_save';

import type { Settlement, SettlementImportantPerson } from './settlement_types.js';

/**
 * The two shapes a stored character is made of now live in `$lib/characters`, which is the library
 * that owns the concept. They were declared here until #46, because a settlement's notables were
 * the first characters anything stored — and the day the fantasy character generator needed the
 * same shape, one of the two copies would have started drifting. Re-exported so the settlement
 * kind's own consumers keep importing them from where they always did.
 */
export type { StoredArchetype, StoredCharacter } from '$lib/characters';

export type StoredSettlementNotable = Omit<SettlementImportantPerson, 'character'> & {
  character: StoredCharacter;
};

/**
 * The stored organization and visual identity shapes now live in `$lib/organizations` and
 * `$lib/visual_identity`, the libraries that own the concepts. They were declared here until #56,
 * because a settlement's organizations were the first anything stored. Re-exported so the
 * settlement kind's own consumers keep importing them from where they always did.
 */
export type { StoredOrganization, StoredOrganizationHierarchy } from '$lib/organizations';
export type { StoredVisualEmblem, StoredVisualIdentity } from '$lib/visual_identity';

/**
 * A settlement as it is stored. Everything the settlement itself holds travels straight through;
 * only what it borrows from `$lib/characters`, `$lib/organizations`, and `$lib/heraldry` is
 * rewritten, and only where those carry something JSON does not have.
 */
export type SettlementSnapshot = Omit<Settlement, 'importantPeople' | 'organizations'> & {
  importantPeople?: StoredSettlementNotable[];
  organizations?: StoredOrganization[];
};

function toStoredNotable(notable: SettlementImportantPerson): StoredSettlementNotable {
  return { ...notable, character: toStoredCharacter(notable.character) };
}

/**
 * A settlement as an artifact payload.
 *
 * The final strip is a net rather than the mechanism: everything this module knows to be a
 * function has already been converted by name above, and the strip is what keeps a function
 * added to some borrowed type later from turning a save into a `DataCloneError` the user meets
 * instead of a settlement. It runs after the conversions, so the `Map`s are already arrays by the
 * time it walks them.
 */
export function toSettlementSnapshot(settlement: Settlement): SettlementSnapshot {
  const { importantPeople, organizations, ...rest } = settlement;
  const converted: SettlementSnapshot = {
    ...rest,
    ...(importantPeople === undefined
      ? {}
      : { importantPeople: importantPeople.map(toStoredNotable) }),
    ...(organizations === undefined
      ? {}
      : { organizations: organizations.map((organization) => toStoredOrganization(organization)) }),
  };
  return stripFunctionValuesDeep(converted) as SettlementSnapshot;
}
