import { describe, expect, it } from 'vitest';

import { readArtifactPayload, type AnyArtifactKindEntry } from '$lib/artifact_kinds';

import {
  familyArtifactKind,
  FAMILY_ARTIFACT_KIND,
  FAMILY_PAYLOAD_VERSION,
  migrateFamilySnapshot,
  validateFamilySnapshot,
} from './family_artifact_kind.js';
import { rollFamilySnapshot } from './family_roll.js';
import type { FamilySnapshot } from './family_snapshot.js';

/** A stored payload, as anything reading one actually receives it. */
const snapshot = JSON.parse(
  JSON.stringify(rollFamilySnapshot('kind-fixture', { speciesName: 'human' })),
) as Record<string, unknown>;

const members = snapshot.members as Record<string, unknown>[];
const relationships = snapshot.relationships as Record<string, unknown>[];

describe('the family artifact kind', () => {
  it('is registered under its own unqualified name', () => {
    expect(FAMILY_ARTIFACT_KIND).toBe('family');
    expect(familyArtifactKind.kind).toBe('family');
    expect(familyArtifactKind.displayName).toBe('Family');
    expect(familyArtifactKind.payloadVersion).toBe(FAMILY_PAYLOAD_VERSION);
    expect(familyArtifactKind.icon).not.toBe('');
  });

  it('names a saved family the way the page heads it', () => {
    expect(
      familyArtifactKind.nameOf({ ...(snapshot as unknown as FamilySnapshot), name: 'Ashford' }),
    ).toBe('The Ashford Family');
    expect(
      familyArtifactKind.nameOf({ ...(snapshot as unknown as FamilySnapshot), name: ' ' }),
    ).toBe('Family');
  });

  it('accepts a payload the generator produced', () => {
    expect(validateFamilySnapshot(snapshot).ok).toBe(true);
  });

  /** 3.3: an emptied family, and an edge to nobody, are well-defined rather than refused. */
  it('accepts a family with nobody in it, and an edge to someone who is gone', () => {
    expect(validateFamilySnapshot({ ...snapshot, members: [], memberIds: [] }).ok).toBe(true);
    expect(
      validateFamilySnapshot({ ...snapshot, members: [], memberIds: [], relationships }).ok,
    ).toBe(true);
  });

  it('rejects something that is not an object at all', () => {
    for (const payload of [null, 'Ashford', 42, [snapshot]]) {
      const result = validateFamilySnapshot(payload);
      expect(result.ok).toBe(false);
      expect(result.ok === false && result.reason).toBe('invalid-payload');
    }
  });

  it('rejects a payload missing its own fields', () => {
    expect(validateFamilySnapshot({ ...snapshot, id: undefined }).ok).toBe(false);
    expect(validateFamilySnapshot({ ...snapshot, name: 3 }).ok).toBe(false);
    expect(validateFamilySnapshot({ ...snapshot, headId: 3 }).ok).toBe(false);
    expect(validateFamilySnapshot({ ...snapshot, memberIds: 'x' }).ok).toBe(false);
    expect(validateFamilySnapshot({ ...snapshot, members: {} }).ok).toBe(false);
    expect(validateFamilySnapshot({ ...snapshot, relationships: 'married' }).ok).toBe(false);
    expect(validateFamilySnapshot({ ...snapshot, namePatterns: undefined }).ok).toBe(false);
  });

  it('rejects a member that is not a character', () => {
    expect(validateFamilySnapshot({ ...snapshot, members: [{ name: 'Tam' }] }).ok).toBe(false);
    expect(
      validateFamilySnapshot({ ...snapshot, members: [{ ...members[0], firstName: undefined }] })
        .ok,
    ).toBe(false);
  });

  it('rejects an edge without its two ids and a typed name', () => {
    expect(validateFamilySnapshot({ ...snapshot, relationships: [null] }).ok).toBe(false);
    expect(
      validateFamilySnapshot({
        ...snapshot,
        relationships: [{ ...relationships[0], recipientId: 1 }],
      }).ok,
    ).toBe(false);
    expect(
      validateFamilySnapshot({
        ...snapshot,
        relationships: [{ ...relationships[0], type: 'spouse' }],
      }).ok,
    ).toBe(false);
  });

  it('rejects name patterns that are not pattern sources', () => {
    expect(validateFamilySnapshot({ ...snapshot, namePatterns: { female: 'abc' } }).ok).toBe(false);
    expect(
      validateFamilySnapshot({
        ...snapshot,
        namePatterns: { female: ['a'], male: { patterns: 'a' } },
      }).ok,
    ).toBe(false);
    expect(
      validateFamilySnapshot({
        ...snapshot,
        namePatterns: { female: ['a'], male: { patterns: ['a'], combinations: [] } },
      }).ok,
    ).toBe(true);
  });

  it('has no migration to offer, and says so rather than guessing', () => {
    const result = migrateFamilySnapshot(snapshot, 0);

    expect(result.ok).toBe(false);
    expect(result.ok === false && result.reason).toBe('unsupported-version');
  });

  /** The whole read path, as the store runs it. */
  it('reads a stored payload of its own version', () => {
    expect(
      readArtifactPayload(
        familyArtifactKind as AnyArtifactKindEntry,
        snapshot,
        FAMILY_PAYLOAD_VERSION,
      ).ok,
    ).toBe(true);
  });

  it('quarantines a payload from a version it has no step for', () => {
    expect(
      readArtifactPayload(
        familyArtifactKind as AnyArtifactKindEntry,
        snapshot,
        FAMILY_PAYLOAD_VERSION + 1,
      ).ok,
    ).toBe(false);
  });

  it('loads a codec that round-trips the payload', async () => {
    const codec = await familyArtifactKind.loadCodec();
    const accepted = validateFamilySnapshot(snapshot);

    expect(accepted.ok).toBe(true);
    if (!accepted.ok) {
      return;
    }
    const { RNG } = await import('@ironarachne/rng');
    const live = codec.fromSnapshot(accepted.value as FamilySnapshot, new RNG('unused'));

    expect(codec.toSnapshot(live)).toEqual(accepted.value);
  });
});
