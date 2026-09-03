// A grave, not a vessel. A derelict is a tomb drifting in the dark, which is the half of this tool
// that is horror rather than science fiction — and it leaves the vehicle glyphs to `/swn/starship`,
// which is a ship somebody is flying.
import grave from '$lib/assets/icons/set2/grave.svg?raw';
import {
  acceptedPayload,
  asRecord,
  defineArtifactKind,
  hasStringFields,
  rejectedPayload,
  type PayloadResult,
} from '$lib/artifact_kinds';

import { SPOOKY_SHIP_DISPLAY_NAME } from './spooky_ship_presentation';
import type { SpookyShipSnapshot } from './spooky_ship_snapshot';
import type { SpookyShip } from './spooky_ship_types';

/**
 * Stable artifact kind id.
 *
 * **Its own kind rather than a `starship` shared with `/swn/starship`**, which #71 asks to be
 * settled deliberately rather than by default. Decision 6 of docs/readiness-objects.md settles it,
 * and building both halves confirms the reasoning: a `StarshipSWN` is a hull with a mass, a power
 * budget and a hardpoint allocation, and this is a sentence about something adrift. Sharing a kind
 * would put a fittings editor in front of a paragraph, and a vault listing could no longer keep a
 * haunted freighter apart from a corvette a player is flying. Two registrations is the whole cost.
 */
export const SPOOKY_SHIP_ARTIFACT_KIND = 'spooky-ship' as const;

/** Version 1. The first shape a derelict has been stored in. */
export const SPOOKY_SHIP_PAYLOAD_VERSION = 1 as const;

/**
 * Checks the one thing reading depends on: a text field. An empty one is accepted — a referee who
 * has cleared the paragraph on the way to writing their own has made an editing decision, and 3.3
 * asks for a well-defined empty result rather than a refusal.
 */
export function validateSpookyShipSnapshot(payload: unknown): PayloadResult<SpookyShipSnapshot> {
  const record = asRecord(payload);
  if (record === null) {
    return rejectedPayload('invalid-payload', 'Spooky ship payload is not an object');
  }
  if (!hasStringFields(record, ['text'])) {
    return rejectedPayload('invalid-payload', 'Spooky ship payload needs a text field');
  }
  return acceptedPayload({ text: record.text as string });
}

/** There has only ever been version 1, so this rejects rather than pretending otherwise. */
export function migrateSpookyShipSnapshot(
  _payload: unknown,
  from: number,
): PayloadResult<SpookyShipSnapshot> {
  return rejectedPayload(
    'unsupported-version',
    `Spooky ships have no migration from payload version ${from}; version ${SPOOKY_SHIP_PAYLOAD_VERSION} is the only shape there has been`,
  );
}

/** A derelict as an artifact. */
export const spookyShipArtifactKind = defineArtifactKind<SpookyShip, SpookyShipSnapshot>({
  kind: SPOOKY_SHIP_ARTIFACT_KIND,
  displayName: SPOOKY_SHIP_DISPLAY_NAME,
  icon: grave,
  payloadVersion: SPOOKY_SHIP_PAYLOAD_VERSION,
  loadCodec: async () => {
    const { toSpookyShipSnapshot, spookyShipFromSnapshotWithRng } =
      await import('./spooky_ship_snapshot.js');
    return { toSnapshot: toSpookyShipSnapshot, fromSnapshot: spookyShipFromSnapshotWithRng };
  },
  nameOf: () => SPOOKY_SHIP_DISPLAY_NAME,
  validate: validateSpookyShipSnapshot,
  migrate: migrateSpookyShipSnapshot,
});
