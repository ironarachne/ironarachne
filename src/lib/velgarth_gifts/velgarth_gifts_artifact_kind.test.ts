import { describe, expect, it } from 'vitest';

import { readArtifactPayload, type AnyArtifactKindEntry } from '$lib/artifact_kinds';

import {
  migrateVelgarthGiftsSnapshot,
  validateVelgarthGiftsSnapshot,
  velgarthGiftsArtifactKind,
  VELGARTH_GIFTS_ARTIFACT_KIND,
  VELGARTH_GIFTS_PAYLOAD_VERSION,
} from './velgarth_gifts_artifact_kind.js';
import { rollVelgarthGiftsSnapshot } from './velgarth_gifts_roll.js';
import type { VelgarthGiftsSnapshot } from './velgarth_gifts_snapshot.js';

/** A stored payload, as anything reading one actually receives it. */
const snapshot = JSON.parse(JSON.stringify(rollVelgarthGiftsSnapshot('kind-fixture'))) as Record<
  string,
  unknown
>;

describe('the Velgarth gifts artifact kind', () => {
  /** Named for the setting: neither generic nor system-qualified, because it is neither. */
  it('is registered under the setting’s name', () => {
    expect(VELGARTH_GIFTS_ARTIFACT_KIND).toBe('velgarth-gifts');
    expect(velgarthGiftsArtifactKind.kind).toBe('velgarth-gifts');
    expect(velgarthGiftsArtifactKind.displayName).toBe('Velgarth Gifts');
    expect(velgarthGiftsArtifactKind.payloadVersion).toBe(VELGARTH_GIFTS_PAYLOAD_VERSION);
    expect(velgarthGiftsArtifactKind.icon).not.toBe('');
  });

  it('names a saved set after the Gifts in it', () => {
    expect(
      velgarthGiftsArtifactKind.nameOf({
        gifts: [
          { name: 'Mindspeech', description: '', strength: 3 },
          { name: 'Farsight', description: '', strength: 2 },
        ],
      }),
    ).toBe('Mindspeech and Farsight');
  });

  it('names a single Gift plainly, and an empty set by its kind', () => {
    expect(
      velgarthGiftsArtifactKind.nameOf({
        gifts: [{ name: 'Healing', description: '', strength: 1 }],
      }),
    ).toBe('Healing');
    expect(velgarthGiftsArtifactKind.nameOf({ gifts: [] })).toBe('Velgarth Gifts');
    expect(
      velgarthGiftsArtifactKind.nameOf({ gifts: [{ name: '  ', description: '', strength: 1 }] }),
    ).toBe('Velgarth Gifts');
  });

  it('accepts a payload the generator produced', () => {
    expect(validateVelgarthGiftsSnapshot(snapshot).ok).toBe(true);
  });

  /** 3.3: an empty set is a well-defined result, not a refusal. */
  it('accepts a set with no Gifts left in it', () => {
    expect(validateVelgarthGiftsSnapshot({ gifts: [] }).ok).toBe(true);
  });

  it('rejects something that is not an object at all', () => {
    for (const payload of [null, 'gifts', 42, [{ name: 'Mindspeech' }]]) {
      const result = validateVelgarthGiftsSnapshot(payload);
      expect(result.ok).toBe(false);
      expect(result.ok === false && result.reason).toBe('invalid-payload');
    }
  });

  it('rejects a payload with no gifts list', () => {
    expect(validateVelgarthGiftsSnapshot({}).ok).toBe(false);
    expect(validateVelgarthGiftsSnapshot({ gifts: 'Mindspeech' }).ok).toBe(false);
  });

  it('rejects a Gift missing any of its three fields', () => {
    expect(validateVelgarthGiftsSnapshot({ gifts: [{ name: 'Mindspeech' }] }).ok).toBe(false);
    expect(
      validateVelgarthGiftsSnapshot({ gifts: [{ name: 'Mindspeech', description: 'x' }] }).ok,
    ).toBe(false);
    expect(validateVelgarthGiftsSnapshot({ gifts: [{ description: 'x', strength: 2 }] }).ok).toBe(
      false,
    );
  });

  it('has no migration to offer, and says so rather than guessing', () => {
    const result = migrateVelgarthGiftsSnapshot(snapshot, 0);

    expect(result.ok).toBe(false);
    expect(result.ok === false && result.reason).toBe('unsupported-version');
  });

  /** The whole read path, as the store runs it. */
  it('reads a stored payload of its own version', () => {
    expect(
      readArtifactPayload(
        velgarthGiftsArtifactKind as AnyArtifactKindEntry,
        snapshot,
        VELGARTH_GIFTS_PAYLOAD_VERSION,
      ).ok,
    ).toBe(true);
  });

  it('quarantines a payload from a version it has no step for', () => {
    expect(
      readArtifactPayload(
        velgarthGiftsArtifactKind as AnyArtifactKindEntry,
        snapshot,
        VELGARTH_GIFTS_PAYLOAD_VERSION + 1,
      ).ok,
    ).toBe(false);
  });

  it('loads a codec that round-trips the payload', async () => {
    const codec = await velgarthGiftsArtifactKind.loadCodec();
    const accepted = validateVelgarthGiftsSnapshot(snapshot);

    expect(accepted.ok).toBe(true);
    if (!accepted.ok) {
      return;
    }
    const { RNG } = await import('@ironarachne/rng');
    const live = codec.fromSnapshot(accepted.value as VelgarthGiftsSnapshot, new RNG('unused'));

    expect(codec.toSnapshot(live)).toEqual(accepted.value);
  });
});
