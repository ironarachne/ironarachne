import { describe, expect, it } from 'vitest';

import { readArtifactPayload, type AnyArtifactKindEntry } from '$lib/artifact_kinds';

import {
  CHOP_SHOP_ARTIFACT_KIND,
  CHOP_SHOP_PAYLOAD_VERSION,
  chopShopArtifactKind,
  migrateChopShopSnapshot,
  validateChopShopSnapshot,
} from './chop_shop_artifact_kind';
import { rollChopShop, rollChopShopSnapshot } from './chop_shop_roll';

const shop = rollChopShop('kind-fixture');
/** A stored payload, as anything reading one actually receives it. */
const snapshot = JSON.parse(JSON.stringify(rollChopShopSnapshot('kind-fixture'))) as unknown;

describe('the chop shop artifact kind', () => {
  it('is registered under its own name', () => {
    expect(CHOP_SHOP_ARTIFACT_KIND).toBe('chop-shop');
    expect(chopShopArtifactKind.kind).toBe('chop-shop');
    expect(chopShopArtifactKind.displayName).toBe('Chop Shop');
    expect(chopShopArtifactKind.payloadVersion).toBe(CHOP_SHOP_PAYLOAD_VERSION);
    expect(chopShopArtifactKind.icon).not.toBe('');
    expect(chopShopArtifactKind.nameOf({ text: 'anything' })).toBe('Chop Shop');
  });

  it('accepts a payload the generator produced, and an emptied one', () => {
    expect(validateChopShopSnapshot(snapshot).ok).toBe(true);
    expect(validateChopShopSnapshot({ text: '' }).ok).toBe(true);
  });

  it('accepts only the text field, dropping anything beside it', () => {
    const accepted = validateChopShopSnapshot({ text: 'neon', extra: 1 });
    expect(accepted.ok && accepted.value).toEqual({ text: 'neon' });
  });

  it('rejects something that is not a shop', () => {
    for (const payload of [null, 'neon', 42, [{ text: 'neon' }], {}, { text: 3 }]) {
      const result = validateChopShopSnapshot(payload);
      expect(result.ok).toBe(false);
      expect(result.ok === false && result.reason).toBe('invalid-payload');
    }
  });

  it('has no migration to offer, and says so rather than guessing', () => {
    const result = migrateChopShopSnapshot(snapshot, 0);
    expect(result.ok).toBe(false);
    expect(result.ok === false && result.reason).toBe('unsupported-version');
  });

  /** The whole read path, as the store runs it. */
  it('reads its own version and quarantines one it has no step for', () => {
    const entry = chopShopArtifactKind as AnyArtifactKindEntry;
    expect(readArtifactPayload(entry, snapshot, CHOP_SHOP_PAYLOAD_VERSION).ok).toBe(true);
    expect(readArtifactPayload(entry, snapshot, CHOP_SHOP_PAYLOAD_VERSION + 1).ok).toBe(false);
  });

  it('loads a codec that round-trips the payload', async () => {
    const codec = await chopShopArtifactKind.loadCodec();
    const { RNG } = await import('@ironarachne/rng');
    const live = codec.fromSnapshot(shop, new RNG('unused'));
    expect(codec.toSnapshot(live)).toEqual(shop);
  });
});
