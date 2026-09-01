import compass from '$lib/assets/icons/set2/compass.svg?raw';
import {
  acceptedPayload,
  asRecord,
  defineArtifactKind,
  hasStringFields,
  rejectedPayload,
  type PayloadResult,
} from '$lib/artifact_kinds';

import type { UWCharacter } from './character';
import type { UwCharacterSnapshot } from './uw_character_snapshot';

/**
 * Stable artifact kind id.
 *
 * Concept first, system as the qualifier, so every character kind sorts together in a vault
 * listing — `character.adnd-2e`, `character.dcc`, `character.swn`, and this. That is decision 4 of
 * docs/workshop.md and the form docs/readiness-characters.md names for all three system characters.
 * Issue #50's scope section writes it the other way round, as `uncharted-worlds.character`; the
 * design's form wins, because the ordering is the decision and a kind id is a migration to rename.
 */
export const UW_CHARACTER_ARTIFACT_KIND = 'character.uncharted-worlds' as const;

/** Version 1. The first shape an Uncharted Worlds character has been stored in. */
export const UW_CHARACTER_PAYLOAD_VERSION = 1 as const;

/** The five stats every Uncharted Worlds character has, in the order the sheet prints them. */
const STAT_FIELDS = ['physique', 'mettle', 'expertise', 'influence', 'interface'] as const;

/** A stored rulebook row: a name, and nothing else. The prose is derived when it is read back. */
function isStoredRow(value: unknown): boolean {
  const record = asRecord(value);
  return record !== null && typeof record.name === 'string';
}

function validateStoredRow(value: unknown, field: string): PayloadResult<unknown> {
  if (!isStoredRow(value)) {
    return rejectedPayload('invalid-payload', `Uncharted Worlds character ${field} has no name`);
  }
  return acceptedPayload(value);
}

function validateStoredRowList(value: unknown, field: string): PayloadResult<unknown> {
  if (!Array.isArray(value) || !value.every(isStoredRow)) {
    return rejectedPayload(
      'invalid-payload',
      `Uncharted Worlds character ${field} is not a list of named entries`,
    );
  }
  return acceptedPayload(value);
}

/**
 * The stat block: five numbers, all of them required.
 *
 * A character with a missing stat is not a character a sheet can be read from, and the standard
 * array — +2, +1, +1, 0, -1 — means zero and negative values are ordinary rather than suspicious,
 * so the check is for a finite number rather than for anything about its size.
 */
function validateStats(value: unknown): PayloadResult<unknown> {
  const stats = asRecord(value);
  if (stats === null || !STAT_FIELDS.every((field) => Number.isFinite(stats[field]))) {
    return rejectedPayload(
      'invalid-payload',
      `Uncharted Worlds character stats need numeric ${STAT_FIELDS.join(', ')}`,
    );
  }
  return acceptedPayload(stats);
}

/**
 * The assets, which are stored in full because they are not table rows.
 *
 * Each is checked for what the sheet prints: a name, a description, a class, and a list of upgrades
 * that each have a name and a description. The type is checked for a name alone — an asset built
 * from a template with no types carries one made up of the template's own name.
 */
function validateAssets(value: unknown): PayloadResult<unknown> {
  if (
    !Array.isArray(value) ||
    !value.every((entry) => {
      const asset = asRecord(entry);
      if (
        asset === null ||
        !hasStringFields(asset, ['name', 'description']) ||
        !Number.isFinite(asset.assetClass) ||
        !isStoredRow(asset.type)
      ) {
        return false;
      }
      return (
        Array.isArray(asset.upgrades) &&
        asset.upgrades.every((upgrade) => {
          const record = asRecord(upgrade);
          return record !== null && hasStringFields(record, ['name', 'description']);
        })
      );
    })
  ) {
    return rejectedPayload(
      'invalid-payload',
      'Uncharted Worlds character assets are not classed items with upgrades',
    );
  }
  return acceptedPayload(value);
}

/** Checks what `uwCharacterFromSnapshot` depends on, and what a sheet is printed from. */
export function validateUwCharacterSnapshot(payload: unknown): PayloadResult<UwCharacterSnapshot> {
  const record = asRecord(payload);
  if (record === null) {
    return rejectedPayload(
      'invalid-payload',
      'Uncharted Worlds character payload is not an object',
    );
  }
  if (!hasStringFields(record, ['firstName', 'lastName', 'descriptors', 'advancement'])) {
    return rejectedPayload(
      'invalid-payload',
      'Uncharted Worlds character payload needs string firstName, lastName, descriptors, advancement',
    );
  }

  const checks: PayloadResult<unknown>[] = [
    validateStats(record.stats),
    validateStoredRowList(record.careers, 'careers'),
    validateStoredRow(record.origin, 'origin'),
    validateStoredRow(record.workspace, 'workspace'),
    validateStoredRowList(record.skills, 'skills'),
    validateAssets(record.assets),
  ];
  const failed = checks.find((check) => !check.ok);
  if (failed !== undefined) {
    return failed as PayloadResult<UwCharacterSnapshot>;
  }

  return acceptedPayload(record as unknown as UwCharacterSnapshot);
}

/**
 * There has only ever been version 1, so this rejects rather than pretending otherwise.
 *
 * It is here because the contract requires it, and it is where the first real step goes the day the
 * shape changes. A kind without one looks complete right up until it silently drops someone's work
 * — and local-only means there is no server-side migration to fall back on.
 */
export function migrateUwCharacterSnapshot(
  _payload: unknown,
  from: number,
): PayloadResult<UwCharacterSnapshot> {
  return rejectedPayload(
    'unsupported-version',
    `Uncharted Worlds character has no migration from payload version ${from}; version ${UW_CHARACTER_PAYLOAD_VERSION} is the only shape there has been`,
  );
}

/**
 * What to call a character saved unnamed.
 *
 * Their careers, because in Uncharted Worlds that is what a character *is*: the game has no classes,
 * and a person is the accumulation of what they have done. A two-career listing reads as an
 * identity in a vault — "Explorer and Technician" — in a way "Character" never does.
 */
function uwCharacterName(snapshot: UwCharacterSnapshot): string {
  const given = `${snapshot.firstName} ${snapshot.lastName}`.trim();
  if (given !== '') {
    return given;
  }
  const careers = snapshot.careers
    .map((career) => career.name.trim())
    .filter((name) => name !== '');
  return careers.length === 0 ? 'Uncharted Worlds Character' : careers.join(' and ');
}

/**
 * An Uncharted Worlds character as an artifact.
 *
 * The codec is cheap on both sides — the tables it reads back from are the same three data modules
 * the generator uses — so unlike settlement or heraldry there is no expensive half to keep out of
 * the chunk that merely lists a project. It is still loaded on demand, because the contract is the
 * same for every kind and a codec that happens to be cheap today is not a reason to wire it
 * differently from its neighbours.
 */
export const uwCharacterArtifactKind = defineArtifactKind<UWCharacter, UwCharacterSnapshot>({
  kind: UW_CHARACTER_ARTIFACT_KIND,
  displayName: 'Uncharted Worlds Character',
  icon: compass,
  payloadVersion: UW_CHARACTER_PAYLOAD_VERSION,
  loadCodec: async () => {
    const { toUwCharacterSnapshot, uwCharacterFromSnapshotWithRng } =
      await import('./uw_character_snapshot.js');
    return {
      toSnapshot: toUwCharacterSnapshot,
      fromSnapshot: uwCharacterFromSnapshotWithRng,
    };
  },
  nameOf: uwCharacterName,
  validate: validateUwCharacterSnapshot,
  migrate: migrateUwCharacterSnapshot,
});
