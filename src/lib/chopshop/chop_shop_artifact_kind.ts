import wrench from '$lib/assets/icons/set1/wrench-1.svg?raw';
import {
  acceptedPayload,
  asRecord,
  defineArtifactKind,
  hasStringFields,
  rejectedPayload,
  type PayloadResult,
} from '$lib/artifact_kinds';

import { CHOP_SHOP_DISPLAY_NAME } from './chop_shop_presentation';
import type { ChopShopSnapshot } from './chop_shop_snapshot';
import type { ChopShop } from './chop_shop_types';

/**
 * Stable artifact kind id.
 *
 * Its own kind rather than a shared `vignette` with the spooky ship, per decision 4 of
 * docs/tool-readiness.md: two unrelated tools' output kept apart in a vault listing is what a user
 * browsing a project needs, and the cost is one registration.
 */
export const CHOP_SHOP_ARTIFACT_KIND = 'chop-shop' as const;

/** Version 1. The first shape a chop shop has been stored in. */
export const CHOP_SHOP_PAYLOAD_VERSION = 1 as const;

/**
 * Checks the one thing reading depends on: a text field. An empty one is accepted — a user who has
 * cleared the paragraph on the way to writing their own has made an editing decision, and 3.3 asks
 * for a well-defined empty result rather than a refusal.
 */
export function validateChopShopSnapshot(payload: unknown): PayloadResult<ChopShopSnapshot> {
  const record = asRecord(payload);
  if (record === null) {
    return rejectedPayload('invalid-payload', 'Chop shop payload is not an object');
  }
  if (!hasStringFields(record, ['text'])) {
    return rejectedPayload('invalid-payload', 'Chop shop payload needs a text field');
  }
  return acceptedPayload({ text: record.text as string });
}

/** There has only ever been version 1, so this rejects rather than pretending otherwise. */
export function migrateChopShopSnapshot(
  _payload: unknown,
  from: number,
): PayloadResult<ChopShopSnapshot> {
  return rejectedPayload(
    'unsupported-version',
    `Chop shops have no migration from payload version ${from}; version ${CHOP_SHOP_PAYLOAD_VERSION} is the only shape there has been`,
  );
}

/** A chop shop as an artifact. */
export const chopShopArtifactKind = defineArtifactKind<ChopShop, ChopShopSnapshot>({
  kind: CHOP_SHOP_ARTIFACT_KIND,
  displayName: CHOP_SHOP_DISPLAY_NAME,
  icon: wrench,
  payloadVersion: CHOP_SHOP_PAYLOAD_VERSION,
  loadCodec: async () => {
    const { toChopShopSnapshot, chopShopFromSnapshotWithRng } =
      await import('./chop_shop_snapshot.js');
    return { toSnapshot: toChopShopSnapshot, fromSnapshot: chopShopFromSnapshotWithRng };
  },
  nameOf: () => CHOP_SHOP_DISPLAY_NAME,
  validate: validateChopShopSnapshot,
  migrate: migrateChopShopSnapshot,
});
