import { describe, expect, it } from 'vitest';

import {
  REGION_ARTIFACT_KIND,
  REGION_PAYLOAD_VERSION,
  migrateRegionSnapshot,
  regionArtifactKind,
  validateRegionSnapshot,
} from './region_artifact_kind';
import { rollRegionSnapshot } from './region_roll';
import { regionToMarkdown, regionToMapSvg } from './region_presentation';

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

  it('does not crash when a saved map has a malformed node', () => {
    expect(() =>
      validateRegionSnapshot(broken({ map: { ...snapshot.map, nodes: [null] } })),
    ).not.toThrow();
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
      index === 0
        ? { ...settlement, snapshot: { ...settlement.snapshot, name: undefined } }
        : settlement,
    );
    expect(validateRegionSnapshot(broken({ settlements }))).toMatchObject({ ok: false });
  });

  it('accepts linked semantic facts and rejects broken local or map references', () => {
    const nodeId = snapshot.map.nodes[0].id;
    const edgeId = snapshot.map.edges[0].id;
    const facts = {
      version: 1,
      state: 'current',
      areas: [
        {
          id: 'area:one',
          name: 'Valley',
          description: '',
          mapNodeIds: [nodeId],
          origin: 'generated',
        },
      ],
      habitats: [
        {
          id: 'habitat:one',
          name: 'Wetland',
          description: '',
          areaIds: ['area:one'],
          origin: 'generated',
          reason: {
            ruleId: 'fantasy.habitat.v1',
            status: 'current',
            sources: [{ kind: 'map-node', nodeId, property: 'moisture', observedValue: '0.8' }],
          },
        },
      ],
      settlementRoles: [
        {
          id: 'role:one',
          name: 'Crossing',
          description: '',
          settlement: { kind: 'embedded', settlementId: snapshot.settlements[0].id },
          areaIds: ['area:one'],
          anchor: { nodeIds: [nodeId], edgeIds: [edgeId] },
          origin: 'generated',
        },
      ],
      notables: [
        {
          id: 'hazard:one',
          kind: 'hazard',
          name: 'Ford',
          description: '',
          areaIds: ['area:one'],
          origin: 'authored',
        },
      ],
      claims: [
        {
          id: 'claim:one',
          name: 'Trade',
          description: '',
          subjectId: 'role:one',
          relatedIds: ['habitat:one'],
          origin: 'generated',
          reason: {
            ruleId: 'fantasy.trade.v1',
            status: 'current',
            sources: [{ kind: 'fact', factId: 'role:one' }],
          },
        },
      ],
    };
    expect(validateRegionSnapshot(broken({ facts })).ok).toBe(true);
    expect(
      validateRegionSnapshot(
        broken({ facts: { ...facts, habitats: [{ ...facts.habitats[0], areaIds: ['missing'] }] } }),
      ),
    ).toMatchObject({ ok: false });
    expect(
      validateRegionSnapshot(
        broken({ facts: { ...facts, areas: [{ ...facts.areas[0], mapNodeIds: [-1] }] } }),
      ),
    ).toMatchObject({ ok: false });
    expect(
      validateRegionSnapshot(
        broken({
          facts: {
            ...facts,
            settlementRoles: [
              {
                ...facts.settlementRoles[0],
                settlement: { kind: 'embedded', settlementId: 'missing' },
              },
            ],
          },
        }),
      ),
    ).toMatchObject({ ok: false });
    expect(
      validateRegionSnapshot(
        broken({ facts: { ...facts, claims: [{ ...facts.claims[0], relatedIds: ['missing'] }] } }),
      ),
    ).toMatchObject({ ok: false });
  });

  it('rejects duplicate identities and unknown future fact kinds', () => {
    const area = { id: 'area:same', name: '', description: '', origin: 'authored', mapNodeIds: [] };
    const facts = {
      ...snapshot.facts,
      areas: [area, { ...area }],
    };
    expect(validateRegionSnapshot(broken({ facts }))).toMatchObject({ ok: false });
    expect(
      validateRegionSnapshot(broken({ facts: { ...snapshot.facts, version: 2 } })),
    ).toMatchObject({ ok: false });
    expect(
      validateRegionSnapshot(
        broken({ settlements: [snapshot.settlements[0], snapshot.settlements[0]] }),
      ),
    ).toMatchObject({ ok: false });
    expect(
      validateRegionSnapshot(
        broken({ settlements: [{ ...snapshot.settlements[0], id: 'wrong:one' }] }),
      ),
    ).toMatchObject({ ok: false });
  });

  it('accepts stale missing sources but never an unknown source kind', () => {
    const reason = {
      ruleId: 'fantasy.habitat.v1',
      status: 'stale',
      sources: [{ kind: 'fact', factId: 'removed' }],
    };
    const habitat = {
      id: 'habitat:one',
      name: 'Marsh',
      description: '',
      areaIds: [],
      origin: 'generated',
      reason,
    };
    expect(
      validateRegionSnapshot(broken({ facts: { ...snapshot.facts, habitats: [habitat] } })).ok,
    ).toBe(true);
    expect(
      validateRegionSnapshot(
        broken({
          facts: {
            ...snapshot.facts,
            habitats: [{ ...habitat, reason: { ...reason, sources: [{ kind: 'future' }] } }],
          },
        }),
      ),
    ).toMatchObject({ ok: false });
  });
});

describe('migrating a stored region (7.3)', () => {
  it('migrates direct and composed actors without changing region prose', () => {
    const legacy = {
      ...snapshot,
      settlements: snapshot.settlements.map((entry) => entry.snapshot),
    };
    const result = migrateRegionSnapshot(withoutMechanics(legacy), 1);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.description).toBe(snapshot.description);
      expect(result.value.facts.state).toBe('legacy');
      expect(result.value.facts.claims).toEqual([]);
      expect(result.value.settlements.map((entry) => entry.id)).toEqual(
        snapshot.settlements.map((entry) => entry.id),
      );
      expect(result.value.authority.mechanics.variants[0]).toMatchObject({ origin: 'migrated' });
      expect(result.value.realms[0].authority.mechanics.variants[0]).toMatchObject({
        origin: 'migrated',
      });
      expect(result.value.organizations[0].leader.mechanics.variants[0]).toMatchObject({
        origin: 'migrated',
      });
    }
  });

  it('migrates version 2 without altering the map or inventing facts', () => {
    const legacy = {
      ...snapshot,
      settlements: snapshot.settlements.map((entry) => entry.snapshot),
    };
    const result = migrateRegionSnapshot(legacy, 2);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.map).toEqual(snapshot.map);
      expect(result.value.facts).toMatchObject({ state: 'legacy', areas: [], claims: [] });
      expect(result.value.settlements[0].snapshot).toEqual(snapshot.settlements[0].snapshot);
      expect(regionToMarkdown(result.value)).toContain(result.value.name);
      expect(regionToMapSvg(result.value)).toContain('<svg');
    }
  });

  it('rejects an unsupported migration version', () => {
    const result = migrateRegionSnapshot(snapshot, 0);
    expect(result).toMatchObject({ ok: false, reason: 'unsupported-version' });
    expect(result.ok ? '' : result.message).toContain('version 0');
  });
});
