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
    expect(artifactKindIds(ARTIFACT_KINDS)).toEqual(['heraldry', 'culture', 'religion']);
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
    expect(artifactKindEntry('settlement')).toBeUndefined();
  });

  it('loads a codec for every registered kind', async () => {
    for (const entry of registeredArtifactKinds()) {
      const codec = await entry.loadCodec();
      expect(typeof codec.toSnapshot).toBe('function');
      expect(typeof codec.fromSnapshot).toBe('function');
    }
  });

  it('quarantines a payload whose kind came from a newer build', () => {
    const result = readRegisteredArtifactPayload('character.swn', { name: 'Vex' }, 1);
    expect(result.ok === false && result.reason).toBe('unknown-kind');
  });

  it('routes a stored payload to the kind that owns it', () => {
    const result = readRegisteredArtifactPayload('religion', { name: 'the Ashen Path' }, 1);
    expect(result.ok === false && result.reason).toBe('invalid-payload');
    expect(result.ok === false && result.message).toContain('religion');
  });
});
