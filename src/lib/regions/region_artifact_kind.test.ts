import { describe, expect, it } from 'vitest';
import type { RegionalProductFact } from './region_processing_types';

import {
  REGION_ARTIFACT_KIND,
  REGION_PAYLOAD_VERSION,
  migrateRegionSnapshot,
  regionArtifactKind,
  validateRegionSnapshot,
} from './region_artifact_kind';
import { rollRegionSnapshot } from './region_roll';
import { emptyRegionFacts } from './region_facts';
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
    expect(
      validateRegionSnapshot(
        broken({ settlements: [], organizations: [], facts: emptyRegionFacts('current') }),
      ).ok,
    ).toBe(true);
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
      ...emptyRegionFacts('current'),
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
      resources: [
        {
          id: 'resource:one',
          kind: 'freshwater',
          availability: 'limited' as const,
          depositIds: [],
          name: 'Springs',
          description: '',
          areaIds: ['area:one'],
          habitatIds: ['habitat:one'],
          origin: 'generated',
          reason: {
            ruleId: 'fantasy.resource.v1',
            status: 'current',
            sources: [{ kind: 'map-node', nodeId, property: 'moisture', observedValue: '0.8' }],
          },
        },
      ],
      routes: [
        {
          id: 'route:one',
          kind: 'road',
          name: 'Valley Road',
          description: '',
          areaIds: ['area:one'],
          anchor: { nodeIds: [], edgeIds: [edgeId] },
          endpoints: [
            {
              kind: 'settlement',
              settlement: { kind: 'embedded', settlementId: snapshot.settlements[0].id },
            },
            {
              kind: 'settlement',
              settlement: { kind: 'artifact', targetId: 'outside-settlement' },
            },
          ],
          origin: 'generated',
        },
      ],
      claims: [
        {
          id: 'claim:one',
          name: 'Trade',
          description: '',
          subjectId: 'role:one',
          relatedIds: ['resource:one', 'route:one'],
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
    expect(
      validateRegionSnapshot(
        broken({
          facts: { ...facts, resources: [{ ...facts.resources[0], habitatIds: ['missing'] }] },
        }),
      ),
    ).toMatchObject({ ok: false });
    expect(
      validateRegionSnapshot(
        broken({
          facts: {
            ...facts,
            routes: [{ ...facts.routes[0], anchor: { nodeIds: [], edgeIds: [-1] } }],
          },
        }),
      ),
    ).toMatchObject({ ok: false });
    expect(
      validateRegionSnapshot(
        broken({
          facts: {
            ...facts,
            routes: [
              {
                ...facts.routes[0],
                endpoints: [facts.routes[0].endpoints[0], facts.routes[0].endpoints[0]],
              },
            ],
          },
        }),
      ),
    ).toMatchObject({ ok: false });
    expect(
      validateRegionSnapshot(
        broken({
          facts: {
            ...facts,
            routes: [
              {
                ...facts.routes[0],
                endpoints: [
                  { kind: 'notable', notableId: 'missing' },
                  facts.routes[0].endpoints[1],
                ],
              },
            ],
          },
        }),
      ),
    ).toMatchObject({ ok: false });
  });

  it('rejects duplicate identities and unknown future fact kinds', () => {
    const area = { id: 'area:same', name: '', description: '', origin: 'authored', mapNodeIds: [] };
    const facts = {
      ...emptyRegionFacts('current'),
      areas: [area, { ...area }],
    };
    expect(validateRegionSnapshot(broken({ facts }))).toMatchObject({ ok: false });
    expect(
      validateRegionSnapshot(broken({ facts: { ...emptyRegionFacts('current'), version: 99 } })),
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

  it('validates anchored resources and boundary route endpoints', () => {
    const edge = { ...snapshot.map.edges[0], d1: undefined };
    const map = { ...snapshot.map, edges: [edge, ...snapshot.map.edges.slice(1)] };
    const resource = {
      id: 'resource:one',
      kind: 'timber',
      availability: 'limited' as const,
      depositIds: [],
      name: 'Woodland',
      description: '',
      areaIds: [],
      habitatIds: [],
      anchor: { nodeIds: [snapshot.map.nodes[0].id], edgeIds: [] },
      origin: 'authored',
    };
    const route = {
      id: 'route:one',
      kind: 'road',
      name: 'North Road',
      description: '',
      areaIds: [],
      anchor: { nodeIds: [], edgeIds: [edge.id] },
      origin: 'authored',
      endpoints: [
        { kind: 'boundary', edgeId: edge.id },
        { kind: 'settlement', settlement: { kind: 'artifact', targetId: 'outside' } },
      ],
    };
    const facts = { ...emptyRegionFacts('current'), resources: [resource], routes: [route] };
    expect(validateRegionSnapshot(broken({ map, facts })).ok).toBe(true);
    expect(
      validateRegionSnapshot(
        broken({ map, facts: { ...facts, resources: [{ ...resource, kind: 'unsupported' }] } }),
      ),
    ).toMatchObject({ ok: false });
    expect(
      validateRegionSnapshot(
        broken({ map, facts: { ...facts, resources: [{ ...resource, anchor: undefined }] } }),
      ),
    ).toMatchObject({ ok: false });
    const nonBoundaryMap = { ...map, edges: [{ ...edge, d1: edge.d0 }, ...map.edges.slice(1)] };
    expect(validateRegionSnapshot(broken({ map: nonBoundaryMap, facts }))).toMatchObject({
      ok: false,
    });
    expect(
      validateRegionSnapshot(
        broken({
          map,
          facts: {
            ...facts,
            routes: [{ ...route, endpoints: [{ kind: 'boundary', edgeId: edge.id }] }],
          },
        }),
      ),
    ).toMatchObject({ ok: false });
    expect(
      validateRegionSnapshot(
        broken({
          map,
          facts: { ...facts, routes: [{ ...route, anchor: { nodeIds: [], edgeIds: [] } }] },
        }),
      ),
    ).toMatchObject({ ok: false });
  });

  it('requires resources and routes lists in the current payload', () => {
    const { resources: _resources, ...missingResources } = snapshot.facts;
    const { routes: _routes, ...missingRoutes } = snapshot.facts;
    expect(validateRegionSnapshot(broken({ facts: missingResources }))).toMatchObject({
      ok: false,
    });
    expect(validateRegionSnapshot(broken({ facts: missingRoutes }))).toMatchObject({ ok: false });
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
      validateRegionSnapshot(
        broken({ facts: { ...emptyRegionFacts('current'), habitats: [habitat] } }),
      ).ok,
    ).toBe(true);
    expect(
      validateRegionSnapshot(
        broken({
          facts: {
            ...emptyRegionFacts('current'),
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
      expect(result.value.facts.ecologyInhabitants).toEqual([]);
      expect(result.value.facts.ecologyRelationships).toEqual([]);
      expect(result.value.facts.claims).toEqual([]);
      expect(result.value.facts.resources).toEqual([]);
      expect(result.value.facts.routes).toEqual([]);
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
      expect(result.value.facts).toMatchObject({
        state: 'legacy',
        areas: [],
        claims: [],
        ecologyInhabitants: [],
        ecologyRelationships: [],
      });
      expect(result.value.facts.resources).toEqual([]);
      expect(result.value.facts.routes).toEqual([]);
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

describe('ecology save compatibility', () => {
  it('migrates v3 with all previous facts, identities, reasons and edits intact', () => {
    const oldFacts = {
      ...emptyRegionFacts('current'),
      areas: structuredClone(snapshot.facts.areas),
      habitats: structuredClone(snapshot.facts.habitats),
      resources: [
        {
          id: 'resource:legacy',
          kind: 'freshwater' as const,
          name: 'Authored spring',
          description: 'Saved words',
          origin: 'authored',
          areaIds: [snapshot.facts.areas[0].id],
          habitatIds: [],
          reason: {
            ruleId: 'legacy-water',
            status: 'current' as const,
            sources: [{ kind: 'fact' as const, factId: snapshot.facts.areas[0].id }],
          },
        },
      ],
    };
    const legacy = {
      ...structuredClone(snapshot),
      description: 'Authored overview',
      facts: { ...oldFacts, version: 1 },
    };
    const original = structuredClone(legacy);
    const result = migrateRegionSnapshot(legacy, 3);
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.message);
    expect(result.value).toEqual({
      ...legacy,
      facts: {
        ...legacy.facts,
        version: 5,
        dailyLife: [],
        products: [],
        geology: [],
        resourceDeposits: [],
        resources: legacy.facts.resources.map((entry) => ({
          ...entry,
          availability: 'unknown',
          depositIds: [],
        })),
        ecologyInhabitants: [],
        ecologyRelationships: [],
      },
    });
    expect(result.value.facts.state).toBe('current');
    expect(legacy).toEqual(original);
    expect(regionToMarkdown(result.value)).toContain('Authored overview');
    expect(regionToMapSvg(result.value)).toContain('<svg');
    expect(validateRegionSnapshot(legacy).ok).toBe(false);
  });

  it('rejects malformed and future v3 fact containers rather than replacing them with empty facts', () => {
    expect(migrateRegionSnapshot({ ...snapshot, facts: undefined }, 3)).toMatchObject({
      ok: false,
    });
    expect(
      migrateRegionSnapshot({ ...snapshot, facts: { ...snapshot.facts, version: 99 } }, 3),
    ).toMatchObject({ ok: false, reason: 'unsupported-version' });
    expect(
      migrateRegionSnapshot(
        { ...snapshot, facts: { ...snapshot.facts, version: 1, habitats: undefined } },
        3,
      ),
    ).toMatchObject({ ok: false });
  });

  it('preserves saved ecology, including unresolved authored names, through JSON and the codec', async () => {
    const saved = structuredClone(snapshot);
    expect(saved.facts.habitats.length).toBeGreaterThan(0);
    saved.facts.ecologyInhabitants.push({
      id: 'inhabitant:authored',
      name: 'The silver reed',
      description: 'Written by the referee',
      origin: 'authored',
      category: 'flora',
      roles: ['other'],
      source: { kind: 'species', speciesName: 'absent future species' },
      habitatIds: [saved.facts.habitats[0].id],
    });
    const json = JSON.parse(JSON.stringify(saved));
    expect(validateRegionSnapshot(json).ok).toBe(true);
    const codec = await regionArtifactKind.loadCodec();
    const back = codec.toSnapshot(codec.fromSnapshot(json, undefined as never));
    expect(back.facts).toEqual(saved.facts);
  });
});

describe('geology save migration', () => {
  it('upgrades v4 without inventing formations, deposits or availability and retains ecological edits', () => {
    const old = {
      ...emptyRegionFacts('current'),
      version: 2,
      areas: structuredClone(snapshot.facts.areas),
      habitats: structuredClone(snapshot.facts.habitats),
      ecologyInhabitants: structuredClone(snapshot.facts.ecologyInhabitants),
      ecologyRelationships: [],
      resources: [
        {
          id: 'resource:old',
          kind: 'timber',
          name: 'Authored timber',
          description: 'Saved availability prose',
          origin: 'authored',
          areaIds: [snapshot.facts.areas[0].id],
          habitatIds: [],
          reason: {
            ruleId: 'old-wood',
            status: 'stale',
            sources: [{ kind: 'fact', factId: 'inhabitant:missing' }],
          },
        },
      ],
    };
    const input = { ...structuredClone(snapshot), facts: old };
    const original = structuredClone(input);
    const result = migrateRegionSnapshot(input, 4);
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.message);
    expect(result.value.facts.geology).toEqual([]);
    expect(result.value.facts.resourceDeposits).toEqual([]);
    expect(result.value.facts.ecologyInhabitants).toEqual(old.ecologyInhabitants);
    expect(result.value.facts.resources).toEqual(
      old.resources.map((entry) => ({ ...entry, availability: 'unknown', depositIds: [] })),
    );
    expect(result.value.map).toEqual(input.map);
    expect(input).toEqual(original);
    expect(validateRegionSnapshot(result.value).ok).toBe(true);
  });
  it('rejects malformed old inventories and incompatible fact versions', () => {
    expect(
      migrateRegionSnapshot(
        { ...snapshot, facts: { ...snapshot.facts, version: 2, resources: null } },
        4,
      ).ok,
    ).toBe(false);
    expect(
      migrateRegionSnapshot(
        { ...snapshot, facts: { ...snapshot.facts, version: 2, resources: [{ kind: 'gas' }] } },
        4,
      ).ok,
    ).toBe(false);
    expect(
      migrateRegionSnapshot({ ...snapshot, facts: { ...snapshot.facts, version: 3 } }, 4).ok,
    ).toBe(false);
  });
});

describe('processing save migration', () => {
  it('upgrades v5 by adding an empty product list without generating or changing saved work', () => {
    const { products: _products, ...facts } = structuredClone(snapshot.facts);
    const input = { ...structuredClone(snapshot), facts: { ...facts, version: 3 } };
    input.facts.resources.forEach((entry) => {
      entry.name = 'Authored raw supply';
      entry.origin = 'authored';
    });
    const original = structuredClone(input);
    const result = migrateRegionSnapshot(input, 5);
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.message);
    expect(result.value).toEqual({
      ...input,
      facts: { ...input.facts, version: 5, products: [], dailyLife: [] },
    });
    expect(input).toEqual(original);
    expect(validateRegionSnapshot(result.value).ok).toBe(true);
  });
  it('rejects missing or incompatible v5 facts', () => {
    expect(migrateRegionSnapshot({ ...snapshot, facts: undefined }, 5).ok).toBe(false);
    expect(migrateRegionSnapshot(snapshot, 5).ok).toBe(false);
  });
});

describe('daily-life save migration', () => {
  it('upgrades v6 without selecting new livelihoods or changing products, roles or edited snapshots', () => {
    const { dailyLife: _dailyLife, ...facts } = structuredClone(snapshot.facts);
    const input = {
      ...structuredClone(snapshot),
      description: 'My saved overview',
      facts: { ...facts, version: 4 },
    };
    const original = structuredClone(input);
    const result = migrateRegionSnapshot(input, 6);
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.message);
    expect(result.value).toEqual({
      ...input,
      facts: { ...input.facts, version: 5, dailyLife: [] },
    });
    expect(input).toEqual(original);
    expect(validateRegionSnapshot(result.value).ok).toBe(true);
    expect(regionToMarkdown(result.value)).toContain('My saved overview');
  });

  it('rejects missing, malformed or incompatible v6 facts', () => {
    expect(migrateRegionSnapshot({ ...snapshot, facts: undefined }, 6).ok).toBe(false);
    expect(migrateRegionSnapshot(snapshot, 6).ok).toBe(false);
    expect(
      migrateRegionSnapshot(
        { ...snapshot, facts: { ...snapshot.facts, version: 4, products: undefined } },
        6,
      ).ok,
    ).toBe(false);
  });

  it('preserves edited daily-life assertions and inputs through JSON and the codec', async () => {
    const saved = structuredClone(snapshot);
    expect(saved.facts.dailyLife.length).toBeGreaterThan(0);
    const fact = saved.facts.dailyLife[0];
    fact.description = 'My authored daily life';
    fact.name = 'My local work';
    fact.origin = 'authored';
    fact.activityKey = 'future:activity';
    const json = JSON.parse(JSON.stringify(saved));
    expect(validateRegionSnapshot(json).ok).toBe(true);
    const codec = await regionArtifactKind.loadCodec();
    const back = codec.toSnapshot(codec.fromSnapshot(json, undefined as never));
    expect(back.facts.dailyLife).toEqual(saved.facts.dailyLife);
    expect(back.map).toEqual(saved.map);
    expect(back.settlements).toEqual(saved.settlements);
  });
});

it('preserves authored product chains through JSON and the saved codec without regeneration', async () => {
  const saved = structuredClone(snapshot);
  const product: RegionalProductFact = {
    id: 'product:saved-craft',
    name: 'My local craft',
    description: '',
    origin: 'authored',
    productKey: 'future:product',
    recipeId: 'future:recipe',
    technique: 'woodworking',
    requirements: ['joinery tools'],
    inputs: [
      {
        kind: 'import',
        role: 'material',
        resourceName: 'caravan cargo',
        explanation: 'An authored import',
      },
    ],
    settlement: { kind: 'embedded', settlementId: saved.settlements[0].id },
    areaIds: [],
    anchor: { nodeIds: [saved.settlements[0].snapshot.mapNodeId!], edgeIds: [] },
  };
  saved.facts.products.push(product);
  const json = JSON.parse(JSON.stringify(saved));
  expect(validateRegionSnapshot(json).ok).toBe(true);
  const codec = await regionArtifactKind.loadCodec();
  const back = codec.toSnapshot(codec.fromSnapshot(json, undefined as never));
  expect(back.facts.products).toEqual(saved.facts.products);
});
