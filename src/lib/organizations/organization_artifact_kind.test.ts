import { describe, expect, it } from 'vitest';

import { readArtifactPayload, type AnyArtifactKindEntry } from '$lib/artifact_kinds';

import {
  migrateOrganizationSnapshot,
  organizationArtifactKind,
  ORGANIZATION_ARTIFACT_KIND,
  ORGANIZATION_PAYLOAD_VERSION,
  validateOrganizationSnapshot,
} from './organization_artifact_kind.js';
import { rollOrganizationSnapshot } from './organization_roll.js';
import type { OrganizationSnapshot } from './organization_snapshot.js';

/** Stored payloads, as anything reading one actually receives them. */
const heraldic = JSON.parse(
  JSON.stringify(
    rollOrganizationSnapshot('kind-heraldic', { genre: 'fantasy', kindId: 'noble_house' }),
  ),
) as Record<string, unknown>;
const marked = JSON.parse(
  JSON.stringify(
    rollOrganizationSnapshot('kind-marked', { genre: 'fantasy', kindId: 'trading_company' }),
  ),
) as Record<string, unknown>;

const identity = heraldic.visualIdentity as Record<string, unknown>;
const profile = heraldic.profile as Record<string, unknown>;

function withoutMechanics(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(withoutMechanics);
  if (typeof value !== 'object' || value === null) return value;
  return Object.fromEntries(
    Object.entries(value).flatMap(([key, entry]) =>
      key === 'mechanics' ? [] : [[key, withoutMechanics(entry)]],
    ),
  );
}

describe('the organization artifact kind', () => {
  it('is registered under its own unqualified name, apart from the organization kind registry', () => {
    expect(ORGANIZATION_ARTIFACT_KIND).toBe('organization');
    expect(organizationArtifactKind.kind).toBe('organization');
    expect(organizationArtifactKind.displayName).toBe('Organization');
    expect(organizationArtifactKind.payloadVersion).toBe(ORGANIZATION_PAYLOAD_VERSION);
    expect(organizationArtifactKind.icon).not.toBe('');
    expect(heraldic.kindId).toBe('noble_house');
  });

  it('names a saved organization after itself, and an unnamed one by its kind', () => {
    expect(organizationArtifactKind.nameOf(heraldic as unknown as OrganizationSnapshot)).toBe(
      heraldic.name,
    );
    expect(
      organizationArtifactKind.nameOf({
        ...heraldic,
        name: ' ',
      } as unknown as OrganizationSnapshot),
    ).toBe('Organization');
  });

  it('accepts payloads the generator produced, with arms and with a mark', () => {
    expect(validateOrganizationSnapshot(heraldic).ok).toBe(true);
    expect(validateOrganizationSnapshot(marked).ok).toBe(true);
  });

  /** 3.3: an organization with no notables left is well-defined, and so are referenced arms. */
  it('accepts no notable members, and referenced arms written as null', () => {
    expect(validateOrganizationSnapshot({ ...heraldic, notableMembers: [] }).ok).toBe(true);
    expect(
      validateOrganizationSnapshot({
        ...heraldic,
        visualIdentity: { ...identity, emblem: { kind: 'heraldry', arms: null } },
      }).ok,
    ).toBe(true);
  });

  it('rejects something that is not an object at all', () => {
    for (const payload of [null, 'guild', 42, [heraldic]]) {
      const result = validateOrganizationSnapshot(payload);
      expect(result.ok).toBe(false);
      expect(result.ok === false && result.reason).toBe('invalid-payload');
    }
  });

  it('rejects a payload missing its own fields', () => {
    expect(validateOrganizationSnapshot({ ...heraldic, name: undefined }).ok).toBe(false);
    expect(validateOrganizationSnapshot({ ...heraldic, kindId: 3 }).ok).toBe(false);
    expect(validateOrganizationSnapshot({ ...heraldic, memberCount: 'many' }).ok).toBe(false);
    expect(validateOrganizationSnapshot({ ...heraldic, genre: 'western' }).ok).toBe(false);
    expect(validateOrganizationSnapshot({ ...heraldic, notableMembers: {} }).ok).toBe(false);
    expect(
      validateOrganizationSnapshot({ ...heraldic, relationships: [{ kind: 'rival' }] }).ok,
    ).toBe(false);
  });

  it('rejects a profile without its facets or hook', () => {
    expect(validateOrganizationSnapshot({ ...heraldic, profile: { ...profile, hook: 1 } }).ok).toBe(
      false,
    );
    expect(
      validateOrganizationSnapshot({ ...heraldic, profile: { ...profile, goal: { id: 'x' } } }).ok,
    ).toBe(false);
    expect(
      validateOrganizationSnapshot({
        ...heraldic,
        profile: { ...profile, personalityTraits: 'bold' },
      }).ok,
    ).toBe(false);
  });

  it('rejects an emblem of an unknown kind, or one without its parameters', () => {
    const withEmblem = (emblem: unknown) => ({
      ...heraldic,
      visualIdentity: { ...identity, emblem },
    });

    expect(validateOrganizationSnapshot(withEmblem({ kind: 'tattoo' })).ok).toBe(false);
    expect(validateOrganizationSnapshot(withEmblem({ kind: 'merchant_mark' })).ok).toBe(false);
    expect(validateOrganizationSnapshot(withEmblem({ kind: 'heraldry', arms: 'lions' })).ok).toBe(
      false,
    );
    expect(validateOrganizationSnapshot({ ...heraldic, visualIdentity: null }).ok).toBe(false);
    expect(
      validateOrganizationSnapshot({ ...heraldic, visualIdentity: { ...identity, motto: 3 } }).ok,
    ).toBe(false);
    expect(
      validateOrganizationSnapshot({ ...heraldic, visualIdentity: { ...identity, colors: {} } }).ok,
    ).toBe(false);
  });

  it('rejects a hierarchy that is not three entry lists', () => {
    expect(validateOrganizationSnapshot({ ...heraldic, hierarchy: {} }).ok).toBe(false);
    expect(
      validateOrganizationSnapshot({
        ...heraldic,
        hierarchy: { childToParent: [[1, null]], idToOrder: [], roleById: [] },
      }).ok,
    ).toBe(false);
  });

  it('rejects a person who is not a character', () => {
    expect(validateOrganizationSnapshot({ ...heraldic, leader: { name: 'Tam' } }).ok).toBe(false);
    expect(
      validateOrganizationSnapshot({ ...heraldic, notableMembers: [{ name: 'Tam' }] }).ok,
    ).toBe(false);
  });

  it('migrates every embedded person through the shared actor helper', () => {
    const result = migrateOrganizationSnapshot(withoutMechanics(heraldic), 1);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.name).toBe(heraldic.name);
      expect(result.value.leader.mechanics.variants[0]).toMatchObject({ origin: 'migrated' });
      expect(result.value.notableMembers[0].mechanics.variants[0]).toMatchObject({
        origin: 'migrated',
      });
    }
  });

  it('rejects an unsupported migration version', () => {
    const result = migrateOrganizationSnapshot(heraldic, 0);

    expect(result.ok).toBe(false);
    expect(result.ok === false && result.reason).toBe('unsupported-version');
  });

  /** The whole read path, as the store runs it. */
  it('reads a stored payload of its own version', () => {
    expect(
      readArtifactPayload(
        organizationArtifactKind as AnyArtifactKindEntry,
        heraldic,
        ORGANIZATION_PAYLOAD_VERSION,
      ).ok,
    ).toBe(true);
  });

  it('quarantines a payload from a version it has no step for', () => {
    expect(
      readArtifactPayload(
        organizationArtifactKind as AnyArtifactKindEntry,
        heraldic,
        ORGANIZATION_PAYLOAD_VERSION + 1,
      ).ok,
    ).toBe(false);
  });

  it('loads a codec that round-trips the payload', async () => {
    const codec = await organizationArtifactKind.loadCodec();
    const accepted = validateOrganizationSnapshot(heraldic);

    expect(accepted.ok).toBe(true);
    if (!accepted.ok) {
      return;
    }
    const { RNG } = await import('@ironarachne/rng');
    const live = codec.fromSnapshot(accepted.value as OrganizationSnapshot, new RNG('unused'));

    expect(codec.toSnapshot(live)).toEqual(accepted.value);
  });
});
