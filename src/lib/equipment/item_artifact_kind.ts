import sword from '$lib/assets/icons/set2/sword-1.svg?raw';
import {
  acceptedPayload,
  asRecord,
  defineArtifactKind,
  isStringArray,
  rejectedPayload,
  type PayloadResult,
} from '$lib/artifact_kinds';

import {
  DEFAULT_ITEM_DENSITY,
  DEFAULT_ITEM_RARITY,
  ITEM_DENSITY_CATEGORIES,
  ITEM_RARITIES,
  type ItemSnapshot,
} from './item_snapshot';
import type { DensityCategory, Rarity } from './equipment_types';

/**
 * Stable artifact kind id. Unqualified: an item is neither a game system's nor a setting's, per
 * the kind table in docs/tool-readiness.md.
 *
 * **One kind, two tools.** `/fantasy/equipment-generator` and `/fantasy/weapon` both produce an
 * `Item` from this library, and decision 1 of docs/readiness-objects.md gives them one kind: two
 * kinds for one payload shape would split a user's gear across two vault entries, each openable by
 * only one of the two tools that made it. The provenance's tool path is what says which rolled it.
 * That is the argument the AD&D builder and generator settled, applied again.
 */
export const ITEM_ARTIFACT_KIND = 'item' as const;

/** Version 1. The first shape an item has been stored in. */
export const ITEM_PAYLOAD_VERSION = 1 as const;

function isRarity(value: unknown): value is Rarity {
  return typeof value === 'string' && (ITEM_RARITIES as string[]).includes(value);
}

function isDensityCategory(value: unknown): value is DensityCategory {
  return typeof value === 'string' && (ITEM_DENSITY_CATEGORIES as string[]).includes(value);
}

function optionalRecord<T>(value: unknown): { present: false } | { present: true; value: T } {
  const record = asRecord(value);
  return record === null ? { present: false } : { present: true, value: record as T };
}

function optionalText(value: unknown): string | undefined {
  return typeof value === 'string' && value !== '' ? value : undefined;
}

/**
 * Reads a stored item, normalising rather than refusing wherever it honestly can.
 *
 * Four fields are load-bearing and are checked as such — an item with no `name`, no
 * `itemMajorType`, no `description` or a non-numeric `value` is not an item, and every reader here
 * would print `undefined` at it. Everything else degrades:
 *
 * - **An unrecognised rarity or density becomes the default.** This is the discipline
 *   `docs/workshop.md` asks of a project's genre for the same reason: a payload written by a build
 *   with a sixth rarity should lose the field, not the item.
 * - **`properties` that is not a list of strings becomes an empty list.** A badge row is not worth
 *   an artifact for.
 * - **The four composition records are kept if they are objects and dropped if they are not.**
 *   Their own fields are not policed: they are what was applied at generation time, the editor
 *   writes them back verbatim, and a stricter check here would reject an item over a multiplier
 *   nothing reads.
 *
 * An empty `name` is accepted, because a user who has cleared it on the way to writing their own
 * has made an editing decision — 3.3 asks for a well-defined empty result, not a refusal.
 */
export function validateItemSnapshot(payload: unknown): PayloadResult<ItemSnapshot> {
  const record = asRecord(payload);
  if (record === null) {
    return rejectedPayload('invalid-payload', 'Item payload is not an object');
  }

  for (const field of ['id', 'name', 'itemMajorType', 'description'] as const) {
    if (typeof record[field] !== 'string') {
      return rejectedPayload('invalid-payload', `Item payload has no usable ${field}`);
    }
  }
  for (const field of ['value', 'weight'] as const) {
    if (typeof record[field] !== 'number' || !Number.isFinite(record[field])) {
      return rejectedPayload('invalid-payload', `Item payload has no usable ${field}`);
    }
  }

  const material = optionalRecord<ItemSnapshot['material']>(record.material);
  const refinement = optionalRecord<ItemSnapshot['refinement']>(record.refinement);
  const enchantment = optionalRecord<ItemSnapshot['enchantment']>(record.enchantment);
  const decoration = optionalRecord<ItemSnapshot['decoration']>(record.decoration);
  const combatProfile = optionalRecord<ItemSnapshot['combatProfile']>(record.combatProfile);
  const uniqueName = optionalText(record.uniqueName);
  const itemMinorType = optionalText(record.itemMinorType);

  return acceptedPayload({
    id: record.id as string,
    name: record.name as string,
    ...(uniqueName === undefined ? {} : { uniqueName }),
    itemMajorType: record.itemMajorType as string,
    ...(itemMinorType === undefined ? {} : { itemMinorType }),
    description: record.description as string,
    value: record.value as number,
    rarity: isRarity(record.rarity) ? record.rarity : DEFAULT_ITEM_RARITY,
    densityCategory: isDensityCategory(record.densityCategory)
      ? record.densityCategory
      : DEFAULT_ITEM_DENSITY,
    weight: record.weight as number,
    properties: isStringArray(record.properties) ? record.properties : [],
    ...(combatProfile.present ? { combatProfile: combatProfile.value } : {}),
    ...(Array.isArray(record.actions)
      ? { actions: record.actions as ItemSnapshot['actions'] }
      : {}),
    ...(material.present ? { material: material.value } : {}),
    ...(refinement.present ? { refinement: refinement.value } : {}),
    ...(enchantment.present ? { enchantment: enchantment.value } : {}),
    ...(decoration.present ? { decoration: decoration.value } : {}),
  } as ItemSnapshot);
}

/**
 * There has only ever been version 1, so this rejects rather than pretending otherwise.
 *
 * It is here because the contract requires it, and it is where the first real step goes the day
 * the shape changes — a kind without one looks complete right up until it silently drops someone's
 * work, and local-only means there is no server-side migration to fall back on.
 */
export function migrateItemSnapshot(_payload: unknown, from: number): PayloadResult<ItemSnapshot> {
  return rejectedPayload(
    'unsupported-version',
    `Items have no migration from payload version ${from}; version ${ITEM_PAYLOAD_VERSION} is the only shape there has been`,
  );
}

/**
 * What to call a saved item: its unique name if it has one, else its name.
 *
 * 3.5 carries unusual weight for this kind, and `docs/readiness-objects.md` says why: users
 * accumulate many small artifacts of it, and an unnamed item in a list of forty is unusable. The
 * save dialog prefills from here, so an enchanted sword arrives in the vault already called
 * whatever the generator named it.
 */
export function itemName(snapshot: ItemSnapshot): string {
  const unique = (snapshot.uniqueName ?? '').trim();
  if (unique !== '') {
    return unique;
  }
  const name = snapshot.name.trim();
  return name === '' ? 'Item' : name;
}

/**
 * An item as an artifact.
 *
 * The codec is a dynamic import for consistency with every other kind rather than for weight:
 * reading an item resolves nothing, because a stored one already holds everything it is.
 */
export const itemArtifactKind = defineArtifactKind<ItemSnapshot, ItemSnapshot>({
  kind: ITEM_ARTIFACT_KIND,
  displayName: 'Item',
  icon: sword,
  payloadVersion: ITEM_PAYLOAD_VERSION,
  loadCodec: async () => {
    const { toItemSnapshot, itemFromSnapshotWithRng } = await import('./item_snapshot.js');
    return {
      toSnapshot: toItemSnapshot,
      fromSnapshot: itemFromSnapshotWithRng,
    };
  },
  nameOf: itemName,
  validate: validateItemSnapshot,
  migrate: migrateItemSnapshot,
});
