import { describe, expect, it } from 'vitest';

import {
  ARTIFACT_KINDS,
  artifactKindEntry,
  readRegisteredArtifactPayload,
  registeredArtifactKinds,
} from './artifact_kind_catalog';
import { artifactKindIds } from '$lib/artifact_kinds';

describe('artifact kind catalog', () => {
  it('registers the kinds this build knows how to store', () => {
    expect(artifactKindIds(ARTIFACT_KINDS)).toEqual([
      'heraldry',
      'culture',
      'religion',
      'settlement',
      'character.adnd-2e',
      'character',
      'character.dcc',
      'character.swn',
      'character.uncharted-worlds',
      'velgarth-gifts',
      'arms-manufacturer',
      'encounter',
      'family',
      'organization',
      'star-nation',
      'chop-shop',
      'dungeon',
      'environment',
      'planet',
      'star-system',
      'region',
      'drug',
      'item',
      'merchant',
      'potion',
      'treasure-hoard',
      'spooky-ship',
    ]);
  });

  it('gives every registered kind a display name and a usable payload version', () => {
    for (const entry of registeredArtifactKinds()) {
      expect(entry.displayName).not.toBe('');
      expect(Number.isInteger(entry.payloadVersion)).toBe(true);
      expect(entry.payloadVersion).toBeGreaterThanOrEqual(1);
    }
  });

  it('registers each kind exactly once', () => {
    const ids = registeredArtifactKinds().map((entry) => entry.kind);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('looks a kind up by id', () => {
    expect(artifactKindEntry('culture')?.displayName).toBe('Culture');
    // A kind this build does not have is the normal case for a file from a newer one, and the miss
    // is what routes it to quarantine rather than an exception.
    expect(artifactKindEntry('character.traveller')).toBeUndefined();
  });

  // Given its own timeout, because the default five seconds is not a budget this test can be held
  // to honestly. It dynamically imports every registered kind's codec, and those are exactly the
  // deep module graphs the comment on `buildArtifactKindRegistry` is about — settlement alone
  // reaches `$lib/organizations`, the heraldry generator and the charge library. Under
  // `coverage:check`, which is what `npm run verify` runs, every one of those modules is
  // transformed and instrumented on the way in.
  //
  // It passes in ~2.6s alone and in the plain `npm run test` run, and it timed out 3/3 under
  // coverage on a developer machine while staying green on CI — so the failure tracks how busy the
  // machine is rather than anything about the code. A local gate that goes red for a reason
  // unrelated to the change in front of you is the kind that stops being trusted, which is the one
  // thing CLAUDE.md asks of this suite.
  //
  // The number is deliberately generous: nothing here is waiting on a timer, so a larger ceiling
  // costs nothing on a run that passes and only changes whether a slow machine reports a failure
  // it does not have.
  it('loads a codec for every registered kind', async () => {
    for (const entry of registeredArtifactKinds()) {
      const codec = await entry.loadCodec();
      expect(typeof codec.toSnapshot).toBe('function');
      expect(typeof codec.fromSnapshot).toBe('function');
    }
  }, 30_000);

  it('quarantines a payload whose kind came from a newer build', () => {
    const result = readRegisteredArtifactPayload('character.traveller', { name: 'Vex' }, 1);
    expect(result.ok === false && result.reason).toBe('unknown-kind');
  });

  it('routes a stored payload to the kind that owns it', () => {
    const result = readRegisteredArtifactPayload('religion', { name: 'the Ashen Path' }, 1);
    expect(result.ok === false && result.reason).toBe('invalid-payload');
    expect(result.ok === false && result.message).toContain('religion');
  });
});
