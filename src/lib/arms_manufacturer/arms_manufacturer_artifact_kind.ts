import rifle from '$lib/assets/icons/set3/gun-rifle.svg?raw';
import {
  acceptedPayload,
  asRecord,
  defineArtifactKind,
  hasStringFields,
  isStringArray,
  rejectedPayload,
  type PayloadResult,
} from '$lib/artifact_kinds';

import type { ArmsManufacturer } from './arms_manufacturer';
import type { ArmsManufacturerSnapshot } from './arms_manufacturer_snapshot';

/**
 * Stable artifact kind id.
 *
 * **Its own kind, not a discriminator on `organization`**, which is the question issue #53 asks
 * before anything else. An arms manufacturer is an organization in the everyday sense, but not in
 * the payload sense: `$lib/organizations` is a leader, members, a hierarchy held as `Map`s and a
 * generated visual identity, and a manufacturer is a name, a sentence and a product catalogue.
 * Sharing a kind would mean one editor, one validator and one migration path covering two shapes
 * with no field in common except the name — docs/tool-readiness.md settled it as `arms-manufacturer`
 * in its kind table, unqualified because it is neither a game system nor a setting.
 */
export const ARMS_MANUFACTURER_ARTIFACT_KIND = 'arms-manufacturer' as const;

/** Version 1. The first shape an arms manufacturer has been stored in. */
export const ARMS_MANUFACTURER_PAYLOAD_VERSION = 1 as const;

/** The six fields a `Weapon` from `$lib/weapons` has, as a stored record must show them. */
function isStoredWeapon(entry: unknown): boolean {
  const weapon = asRecord(entry);
  return (
    weapon !== null &&
    hasStringFields(weapon, ['name', 'maker', 'damage', 'description']) &&
    isStringArray(weapon.cosmetics) &&
    isStringArray(weapon.effects)
  );
}

/**
 * Checks what reading depends on: the two text fields, and a list of models each shaped as a
 * weapon.
 *
 * An empty model list is accepted, and so is an empty name. A user who has removed every model
 * from a saved manufacturer, or cleared its name on the way to writing their own, has made an
 * editing decision, and a payload that fails its own validator is a broken artifact rather than an
 * empty one — 3.3 asks for a well-defined empty result, not a refusal.
 */
export function validateArmsManufacturerSnapshot(
  payload: unknown,
): PayloadResult<ArmsManufacturerSnapshot> {
  const record = asRecord(payload);
  if (record === null) {
    return rejectedPayload('invalid-payload', 'Arms manufacturer payload is not an object');
  }
  if (!hasStringFields(record, ['name', 'description'])) {
    return rejectedPayload(
      'invalid-payload',
      'Arms manufacturer payload needs a name and a description',
    );
  }
  if (!Array.isArray(record.models) || !record.models.every(isStoredWeapon)) {
    return rejectedPayload(
      'invalid-payload',
      'Arms manufacturer payload needs a list of models, each with a name, a maker, a damage type, a description, and lists of cosmetics and effects',
    );
  }

  return acceptedPayload(record as unknown as ArmsManufacturerSnapshot);
}

/**
 * There has only ever been version 1, so this rejects rather than pretending otherwise.
 *
 * It is here because the contract requires it, and it is where the first real step goes the day the
 * shape changes. A kind without one looks complete right up until it silently drops someone's work
 * — and local-only means there is no server-side migration to fall back on.
 */
export function migrateArmsManufacturerSnapshot(
  _payload: unknown,
  from: number,
): PayloadResult<ArmsManufacturerSnapshot> {
  return rejectedPayload(
    'unsupported-version',
    `Arms manufacturers have no migration from payload version ${from}; version ${ARMS_MANUFACTURER_PAYLOAD_VERSION} is the only shape there has been`,
  );
}

/** What to call a saved manufacturer: its name, or the kind when the name has been emptied. */
function armsManufacturerName(snapshot: ArmsManufacturerSnapshot): string {
  const name = snapshot.name.trim();
  return name === '' ? 'Arms Manufacturer' : name;
}

/**
 * An arms manufacturer as an artifact.
 *
 * The codec is a copy — the payload is the value — so the split `loadCodec` asks for buys nothing
 * here. It is still written this way, because the contract is the same for every kind and a codec
 * that happens to be trivial today is not a reason to wire it differently from its neighbours.
 */
export const armsManufacturerArtifactKind = defineArtifactKind<
  ArmsManufacturer,
  ArmsManufacturerSnapshot
>({
  kind: ARMS_MANUFACTURER_ARTIFACT_KIND,
  displayName: 'Arms Manufacturer',
  icon: rifle,
  payloadVersion: ARMS_MANUFACTURER_PAYLOAD_VERSION,
  loadCodec: async () => {
    const { toArmsManufacturerSnapshot, armsManufacturerFromSnapshotWithRng } =
      await import('./arms_manufacturer_snapshot.js');
    return {
      toSnapshot: toArmsManufacturerSnapshot,
      fromSnapshot: armsManufacturerFromSnapshotWithRng,
    };
  },
  nameOf: armsManufacturerName,
  validate: validateArmsManufacturerSnapshot,
  migrate: migrateArmsManufacturerSnapshot,
});
