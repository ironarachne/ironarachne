import { describe, expect, it } from 'vitest';

import {
  REGION_ARTIFACT_KIND,
  REGION_PAYLOAD_VERSION,
  migrateRegionSnapshot,
  regionArtifactKind,
  validateRegionSnapshot,
} from './region_artifact_kind';
import { rollRegionSnapshot } from './region_roll';

const snapshot = rollRegionSnapshot('kind-seed');

function withoutMechanics(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(withoutMechanics);
  if (typeof value !== 'object' || value === null) return value;
  return Object.fromEntries(
    Object.entries(value).flatMap(([key, entry]) =>
      key === 'mechanics' ? [] : [[key, withoutMechanics(entry)]],
    ),
  );
}

/** A copy of the good payload with one part replaced, for the rejection cases. */
function broken(changes: Record<string, unknown>): unknown {
  return { ...(snapshot as unknown as Record<string, unknown>), ...changes };
}

describe('the fixture this file mutates', () => {
  it('has the realms, settlements and organizations the cases below address', () => {
    expect(snapshot.realms.length).toBeGreaterThan(0);
    expect(snapshot.settlements.length).toBeGreaterThan(0);
  });
});

describe('the region artifact kind', () => {
  it('is registered under a stable, unqualified id', () => {
    expect(regionArtifactKind.kind).toEqual(REGION_ARTIFACT_KIND);
    expect(REGION_ARTIFACT_KIND).toEqual('region');
  });

  it('declares the payload version it writes', () => {
    expect(regionArtifactKind.payloadVersion).toEqual(REGION_PAYLOAD_VERSION);
  });

  it('names a saved region by its own name', () => {
    expect(regionArtifactKind.nameOf(snapshot)).toEqual(snapshot.name);
  });

  it('falls back to the kind when the name has been emptied', () => {
    expect(regionArtifactKind.nameOf({ ...snapshot, name: '  ' })).toEqual('Region');
  });

  it('round-trips through its own codec', async () => {
    const codec = await regionArtifactKind.loadCodec();
    const back = codec.toSnapshot(codec.fromSnapshot(snapshot, undefined as never));
    expect(back.name).toEqual(snapshot.name);
    expect(back.map).toEqual(snapshot.map);
    expect(back.realms.map((realm) => realm.name)).toEqual(
      snapshot.realms.map((realm) => realm.name),
    );
  });
});

describe('validating a stored region', () => {
  it('accepts what the generator wrote', () => {
    expect(validateRegionSnapshot(snapshot).ok).toBe(true);
  });

  it('accepts one whose culture came from a reference', () => {
    expect(validateRegionSnapshot(broken({ dominantCulture: null })).ok).toBe(true);
  });

  it('accepts one a user has emptied of settlements and organizations', () => {
    // Both are things the editor can remove; 3.3 asks for a well-defined empty result.
    expect(validateRegionSnapshot(broken({ settlements: [], organizations: [] })).ok).toBe(true);
  });

  it('rejects something that is not an object at all', () => {
    expect(validateRegionSnapshot('a region')).toMatchObject({
      ok: false,
      reason: 'invalid-payload',
    });
  });

  it('rejects a payload with no name or description', () => {
    expect(validateRegionSnapshot(broken({ name: undefined }))).toMatchObject({ ok: false });
    expect(validateRegionSnapshot(broken({ description: 4 }))).toMatchObject({ ok: false });
  });

  it('rejects a payload with no main realm index', () => {
    expect(validateRegionSnapshot(broken({ mainRealm: 'first' }))).toMatchObject({ ok: false });
  });

  it('rejects a payload with no environment', () => {
    expect(validateRegionSnapshot(broken({ environment: undefined }))).toMatchObject({ ok: false });
  });

  it('rejects a map with no size or a missing list', () => {
    expect(
      validateRegionSnapshot(broken({ map: { nodes: [], edges: [], corners: [] } })),
    ).toMatchObject({ ok: false });
    expect(
      validateRegionSnapshot(broken({ map: { ...snapshot.map, corners: undefined } })),
    ).toMatchObject({ ok: false });
  });

  it('rejects a region with no ruler', () => {
    expect(validateRegionSnapshot(broken({ authority: undefined }))).toMatchObject({ ok: false });
  });

  it('rejects a realm with no type name', () => {
    const realms = snapshot.realms.map((realm, index) =>
      index === 0 ? { ...realm, realmTypeName: undefined } : realm,
    );
    expect(validateRegionSnapshot(broken({ realms }))).toMatchObject({ ok: false });
  });

  it('rejects a realm with no arms or no ruler', () => {
    const noArms = snapshot.realms.map((realm, index) =>
      index === 0 ? { ...realm, heraldry: undefined } : realm,
    );
    expect(validateRegionSnapshot(broken({ realms: noArms }))).toMatchObject({ ok: false });

    const noRuler = snapshot.realms.map((realm, index) =>
      index === 0 ? { ...realm, authority: {} } : realm,
    );
    expect(validateRegionSnapshot(broken({ realms: noRuler }))).toMatchObject({ ok: false });
  });

  it('rejects lists that are not lists', () => {
    for (const field of ['settlements', 'realms', 'organizations']) {
      expect(validateRegionSnapshot(broken({ [field]: 'some' })), field).toMatchObject({
        ok: false,
      });
    }
  });

  it('rejects a settlement its own kind would reject', () => {
    // Through `$lib/settlements`' validator rather than a copy of it: a copy is the half that goes
    // stale the day a field is added.
    const settlements = snapshot.settlements.map((settlement, index) =>
      index === 0 ? { ...settlement, name: undefined } : settlement,
    );
    expect(validateRegionSnapshot(broken({ settlements }))).toMatchObject({ ok: false });
  });
});

describe('migrating a stored region (7.3)', () => {
  it('migrates direct and composed actors without changing region prose', () => {
    const result = migrateRegionSnapshot(withoutMechanics(snapshot), 1);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.description).toBe(snapshot.description);
      expect(result.value.authority.mechanics.variants[0]).toMatchObject({ origin: 'migrated' });
      expect(result.value.realms[0].authority.mechanics.variants[0]).toMatchObject({
        origin: 'migrated',
      });
      expect(result.value.organizations[0].leader.mechanics.variants[0]).toMatchObject({
        origin: 'migrated',
      });
    }
  });

  it('rejects an unsupported migration version', () => {
    const result = migrateRegionSnapshot(snapshot, 0);
    expect(result).toMatchObject({ ok: false, reason: 'unsupported-version' });
    expect(result.ok ? '' : result.message).toContain('version 0');
  });
});
