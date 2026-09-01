import gem from '$lib/assets/icons/set3/gem-1.svg?raw';
import {
  acceptedPayload,
  asRecord,
  defineArtifactKind,
  hasStringFields,
  rejectedPayload,
  type PayloadResult,
} from '$lib/artifact_kinds';

import type Gift from './gift';
import type { VelgarthGiftsSnapshot } from './velgarth_gifts_snapshot';

/**
 * Stable artifact kind id, named for the setting.
 *
 * Neither generic nor system-qualified, because it is neither — decision 5 of
 * docs/readiness-characters.md. A Velgarth Gift is fan content for one setting; there is no
 * `setting:` namespace to qualify with, and the generic kind `gifts` would claim a concept this
 * does not own.
 *
 * **A set of Gifts is an artifact of its own**, which is the question issue #52 asks before
 * anything else. They are an attribute of a person, so the alternative was a field on the character
 * kind — but that kind is the *fantasy* character, which knows nothing about Velgarth, and adding a
 * setting's psychic talents to a generic character payload would make every character carry a field
 * only one setting can fill. What the setting-specific kind costs is that a character wearing these
 * Gifts references them rather than containing them, and nothing does that yet: no input of this
 * generator has an artifact kind, so requirement 5.1 does not bind on it (5.3 does, and is met —
 * the tool works with nothing supplied, which is all it has ever done).
 */
export const VELGARTH_GIFTS_ARTIFACT_KIND = 'velgarth-gifts' as const;

/** Version 1. The first shape a set of Gifts has been stored in. */
export const VELGARTH_GIFTS_PAYLOAD_VERSION = 1 as const;

/**
 * Checks what reading depends on: a list of Gifts, each with the three fields one has.
 *
 * An empty list is accepted. A user who has removed every Gift from a saved set has made an
 * editing decision, and a payload that fails its own validator is a broken artifact rather than an
 * empty one — 3.3 asks for a well-defined empty result, not a refusal.
 */
export function validateVelgarthGiftsSnapshot(
  payload: unknown,
): PayloadResult<VelgarthGiftsSnapshot> {
  const record = asRecord(payload);
  if (record === null) {
    return rejectedPayload('invalid-payload', 'Velgarth gifts payload is not an object');
  }
  if (
    !Array.isArray(record.gifts) ||
    !record.gifts.every((entry) => {
      const gift = asRecord(entry);
      return (
        gift !== null &&
        hasStringFields(gift, ['name', 'description']) &&
        Number.isFinite(gift.strength)
      );
    })
  ) {
    return rejectedPayload(
      'invalid-payload',
      'Velgarth gifts payload needs a list of gifts with a name, a description and a strength',
    );
  }

  return acceptedPayload(record as unknown as VelgarthGiftsSnapshot);
}

/**
 * There has only ever been version 1, so this rejects rather than pretending otherwise.
 *
 * It is here because the contract requires it, and it is where the first real step goes the day the
 * shape changes. A kind without one looks complete right up until it silently drops someone's work
 * — and local-only means there is no server-side migration to fall back on.
 */
export function migrateVelgarthGiftsSnapshot(
  _payload: unknown,
  from: number,
): PayloadResult<VelgarthGiftsSnapshot> {
  return rejectedPayload(
    'unsupported-version',
    `Velgarth gifts have no migration from payload version ${from}; version ${VELGARTH_GIFTS_PAYLOAD_VERSION} is the only shape there has been`,
  );
}

/**
 * What to call a saved set: the Gifts in it.
 *
 * A set has no name of its own — it is what a person can do, not a thing with a title — so the
 * listing reads "Mindspeech and Farsight", which is how a player would refer to it anyway.
 */
function velgarthGiftsName(snapshot: VelgarthGiftsSnapshot): string {
  const names = snapshot.gifts.map((gift) => gift.name.trim()).filter((name) => name !== '');
  if (names.length === 0) {
    return 'Velgarth Gifts';
  }
  if (names.length === 1) {
    return names[0];
  }
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

/**
 * A set of Velgarth Gifts as an artifact.
 *
 * The codec is the cheapest in the build — the payload is the value, copied — so the split
 * `loadCodec` asks for buys nothing here. It is still written this way, because the contract is the
 * same for every kind and a codec that happens to be trivial today is not a reason to wire it
 * differently from its neighbours.
 */
export const velgarthGiftsArtifactKind = defineArtifactKind<Gift[], VelgarthGiftsSnapshot>({
  kind: VELGARTH_GIFTS_ARTIFACT_KIND,
  displayName: 'Velgarth Gifts',
  icon: gem,
  payloadVersion: VELGARTH_GIFTS_PAYLOAD_VERSION,
  loadCodec: async () => {
    const { toVelgarthGiftsSnapshot, velgarthGiftsFromSnapshotWithRng } =
      await import('./velgarth_gifts_snapshot.js');
    return {
      toSnapshot: toVelgarthGiftsSnapshot,
      fromSnapshot: velgarthGiftsFromSnapshotWithRng,
    };
  },
  nameOf: velgarthGiftsName,
  validate: validateVelgarthGiftsSnapshot,
  migrate: migrateVelgarthGiftsSnapshot,
});
