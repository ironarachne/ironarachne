import bear from '$lib/assets/icons/set3/bear.svg?raw';
import {
  acceptedPayload,
  asRecord,
  defineArtifactKind,
  hasStringFields,
  isStringArray,
  rejectedPayload,
  type PayloadResult,
} from '$lib/artifact_kinds';
import { validateCharacterSnapshot } from '$lib/characters/character_artifact_kind';
import { validateStoredCreature } from '$lib/creatures/creature_snapshot';
import { withLegacyActorMechanics } from '$lib/rulesets';

import type { EncounterSnapshot } from './encounter_snapshot';
import type { Encounter } from './encounter_types';

/**
 * Stable artifact kind id. Unqualified: an encounter is neither a game system's nor a setting's,
 * per the kind table in docs/tool-readiness.md.
 */
export const ENCOUNTER_ARTIFACT_KIND = 'encounter' as const;

/** Version 2 qualifies every character and creature mob's compatibility mechanics. */
export const ENCOUNTER_PAYLOAD_VERSION = 2 as const;

/**
 * One stored mob, checked by the validator of the vocabulary type it says it is.
 *
 * The two validators are the ones `$lib/characters` and `$lib/creatures` use for their own
 * payloads, reached directly rather than reimplemented here: a copy of either is the half that goes
 * stale the day a field is added.
 */
function validateStoredMob(value: unknown): PayloadResult<unknown> {
  const mob = asRecord(value);
  if (mob === null) {
    return rejectedPayload('invalid-payload', 'encounter mob is not an object');
  }
  if (mob.mobKind === 'character') {
    return validateCharacterSnapshot(mob);
  }
  if (mob.mobKind === 'creature') {
    return validateStoredCreature(mob);
  }
  return rejectedPayload(
    'invalid-payload',
    'encounter mob does not say whether it is a character or a creature',
  );
}

function validateStoredGroup(value: unknown): PayloadResult<unknown> {
  const group = asRecord(value);
  if (group === null) {
    return rejectedPayload('invalid-payload', 'encounter group is not an object');
  }
  if (group.name !== undefined && typeof group.name !== 'string') {
    return rejectedPayload('invalid-payload', 'encounter group name is not a string');
  }
  if (!isStringArray(group.tags)) {
    return rejectedPayload('invalid-payload', 'encounter group tags is not an array of strings');
  }
  if (!Array.isArray(group.mobs)) {
    return rejectedPayload('invalid-payload', 'encounter group mobs is not a list');
  }
  const failed = group.mobs.map(validateStoredMob).find((check) => !check.ok);
  return failed ?? acceptedPayload(group);
}

/**
 * Checks what reading depends on: the encounter's own three fields, and a list of groups each
 * holding mobs the vocabulary validators accept.
 *
 * An encounter with no groups, and a group with no mobs, are both accepted. A user who has removed
 * every bandit from a saved ambush has made an editing decision, and a payload that fails its own
 * validator is a broken artifact rather than an empty one — 3.3 asks for a well-defined empty
 * result, not a refusal.
 */
export function validateEncounterSnapshot(payload: unknown): PayloadResult<EncounterSnapshot> {
  const record = asRecord(payload);
  if (record === null) {
    return rejectedPayload('invalid-payload', 'encounter payload is not an object');
  }
  if (!hasStringFields(record, ['name', 'description'])) {
    return rejectedPayload('invalid-payload', 'encounter payload needs a name and a description');
  }
  if (!Number.isFinite(record.difficulty)) {
    return rejectedPayload('invalid-payload', 'encounter difficulty is not a number');
  }
  if (!Array.isArray(record.groups)) {
    return rejectedPayload('invalid-payload', 'encounter groups is not a list');
  }
  const failed = record.groups.map(validateStoredGroup).find((check) => !check.ok);
  if (failed !== undefined) {
    return failed as PayloadResult<EncounterSnapshot>;
  }

  return acceptedPayload(record as unknown as EncounterSnapshot);
}

/** Qualifies every stored mob without changing encounter groups or prose. */
export function migrateEncounterSnapshot(
  payload: unknown,
  from: number,
): PayloadResult<EncounterSnapshot> {
  if (from !== 1) {
    return rejectedPayload(
      'unsupported-version',
      `Encounters have no migration from payload version ${from}; version 1 is the only older shape there has been`,
    );
  }
  const record = asRecord(payload);
  if (record === null) {
    return rejectedPayload('invalid-payload', 'encounter payload is not an object');
  }
  return validateEncounterSnapshot({
    ...record,
    groups: Array.isArray(record.groups)
      ? record.groups.map((group) => {
          const storedGroup = asRecord(group);
          if (storedGroup === null || !Array.isArray(storedGroup.mobs)) {
            return group;
          }
          return {
            ...storedGroup,
            mobs: storedGroup.mobs.map((mob) => {
              const storedMob = asRecord(mob);
              return storedMob === null ? mob : withLegacyActorMechanics(storedMob, 'migrated');
            }),
          };
        })
      : record.groups,
  });
}

/** What to call a saved encounter: its name, or the kind when the name has been emptied. */
function encounterName(snapshot: EncounterSnapshot): string {
  const name = snapshot.name.trim();
  return name === '' ? 'Encounter' : name;
}

/**
 * An encounter as an artifact.
 *
 * The codec is a dynamic import because its reading half reaches the archetype tables and, through
 * a character's arms, 18 MB of charge art. Listing a project must not pay for that.
 */
export const encounterArtifactKind = defineArtifactKind<Encounter, EncounterSnapshot>({
  kind: ENCOUNTER_ARTIFACT_KIND,
  displayName: 'Encounter',
  icon: bear,
  payloadVersion: ENCOUNTER_PAYLOAD_VERSION,
  loadCodec: async () => {
    const [{ toEncounterSnapshot }, { encounterFromSnapshotWithRng }] = await Promise.all([
      import('./encounter_snapshot.js'),
      import('./encounter_rehydrate.js'),
    ]);
    return {
      toSnapshot: toEncounterSnapshot,
      fromSnapshot: encounterFromSnapshotWithRng,
    };
  },
  nameOf: encounterName,
  validate: validateEncounterSnapshot,
  migrate: migrateEncounterSnapshot,
});
