import { describe, expect, it } from 'vitest';
import { nonSentient, type Species } from '$lib/species';
import {
  buildRegionCreatureContext,
  describeRegionCreatureContext,
} from './region_creature_context';
import { emptyRegionFacts } from './region_facts';
import { rollRegionSnapshot } from './region_roll';
import {
  generateWithHabitatContext,
  getDefaultCreatureGenerationConfig,
  type CreatureHabitatAssignment,
} from '$lib/creatures';

const species = nonSentient()[0];
const base = rollRegionSnapshot('creature-context');
function fixture() {
  const snapshot = structuredClone(base);
  const node = snapshot.map.nodes[0];
  snapshot.facts = emptyRegionFacts('current');
  snapshot.facts.habitats = [
    {
      id: 'habitat:forest',
      name: 'Forest',
      description: '',
      origin: 'generated',
      areaIds: [],
      reason: {
        ruleId: 'test:habitat',
        status: 'current',
        sources: [
          {
            kind: 'map-node',
            nodeId: node.id,
            property: 'temperature',
            observedValue: String(node.temperature),
          },
        ],
      },
    },
  ];
  snapshot.facts.ecologyInhabitants = [
    {
      id: 'inhabitant:one',
      name: 'Forest inhabitant',
      description: '',
      origin: 'generated',
      category: 'fauna',
      roles: ['other'],
      habitatIds: ['habitat:forest'],
      source: { kind: 'species', speciesName: species.name },
      reason: {
        ruleId: 'test:inhabitant',
        status: 'current',
        sources: [{ kind: 'fact', factId: 'habitat:forest' }],
      },
    },
  ];
  return snapshot;
}
const assignment: CreatureHabitatAssignment = {
  habitatId: 'habitat:forest',
  inhabitantId: 'inhabitant:one',
  speciesName: species.name,
  roles: ['other'],
};

describe('saved regional creature context', () => {
  it.each(['alpha', 'bravo', 'charlie', 'foxtrot'])(
    'composes a supported individual from a generated region: %s',
    (seed) => {
      const snapshot = rollRegionSnapshot(seed);
      const config = { ...getDefaultCreatureGenerationConfig(), speciesOptions: nonSentient() };
      const contexts = snapshot.facts.habitats
        .map((habitat) =>
          buildRegionCreatureContext(snapshot, habitat.id, config.speciesOptions, 'region-one'),
        )
        .filter((result) => result.ok);
      expect(contexts.length).toBeGreaterThan(0);
      for (const projected of contexts) {
        if (!projected.ok) continue;
        const result = generateWithHabitatContext(seed, config, projected.context);
        expect(result.ok).toBe(true);
        if (!result.ok) continue;
        expect(
          projected.context.candidates.some(
            (candidate) => candidate.speciesName === result.creature.species.name,
          ),
        ).toBe(true);
        expect(describeRegionCreatureContext(snapshot, result.assignment).status).toBe('current');
      }
    },
  );
  it.each(['Forest', 'Uplands', 'Wetland'])(
    'reads current %s facts without rerolling or inferring a role',
    (name) => {
      const snapshot = fixture();
      snapshot.facts.habitats[0].name = name;
      const before = JSON.stringify(snapshot);
      expect(
        buildRegionCreatureContext(snapshot, 'habitat:forest', [species], 'region-one'),
      ).toMatchObject({
        ok: true,
        context: {
          habitatId: 'habitat:forest',
          regionTargetId: 'region-one',
          candidates: [{ speciesName: species.name, roles: ['other'] }],
        },
      });
      expect(describeRegionCreatureContext(snapshot, assignment)).toMatchObject({
        status: 'current',
        habitatName: name,
      });
      expect(describeRegionCreatureContext(snapshot, assignment).description).toContain(
        'unspecified ecological role',
      );
      expect(JSON.stringify(snapshot)).toBe(before);
    },
  );
  it('allows explicit fantastical inhabitants', () => {
    const snapshot = fixture();
    snapshot.facts.ecologyInhabitants[0].category = 'fantastical';
    expect(buildRegionCreatureContext(snapshot, 'habitat:forest', [species]).ok).toBe(true);
  });
  it('rejects missing/stale habitats and changed physical observations', () => {
    const snapshot = fixture();
    expect(buildRegionCreatureContext(snapshot, 'missing', [species])).toMatchObject({
      ok: false,
      reason: 'missing-habitat',
    });
    snapshot.map.nodes[0].temperature += 1;
    expect(buildRegionCreatureContext(snapshot, 'habitat:forest', [species])).toMatchObject({
      ok: false,
      reason: 'stale-context',
    });
    expect(describeRegionCreatureContext(snapshot, assignment).status).toBe('stale');
  });
  it('checks edge and environment observations and cycles', () => {
    const snapshot = fixture();
    const habitat = snapshot.facts.habitats[0];
    habitat.reason!.sources = [
      {
        kind: 'environment',
        field: 'climate',
        observedValue: JSON.stringify(snapshot.environment.climate),
      },
    ];
    expect(buildRegionCreatureContext(snapshot, habitat.id, [species]).ok).toBe(true);
    habitat.reason!.sources[0] = {
      kind: 'environment',
      field: 'climate',
      observedValue: 'different',
    };
    expect(buildRegionCreatureContext(snapshot, habitat.id, [species]).ok).toBe(false);
    const edge = snapshot.map.edges[0];
    habitat.reason!.sources = [
      { kind: 'map-edge', edgeId: edge.id, property: 'river', observedValue: String(edge.river) },
    ];
    expect(buildRegionCreatureContext(snapshot, habitat.id, [species]).ok).toBe(true);
    edge.river += 1;
    expect(buildRegionCreatureContext(snapshot, habitat.id, [species]).ok).toBe(false);
    habitat.reason!.sources = [{ kind: 'fact', factId: 'inhabitant:one' }];
    expect(buildRegionCreatureContext(snapshot, habitat.id, [species]).ok).toBe(false);
  });
  it('omits unsupported, stale, described and individually linked sources', () => {
    for (const change of [
      { category: 'flora' as const },
      { source: { kind: 'described' as const, label: 'A beast' } },
      {
        source: {
          kind: 'creature-artifact' as const,
          targetId: 'named',
          speciesName: species.name,
        },
      },
      { source: { kind: 'species' as const, speciesName: 'unknown' } },
      { reason: undefined },
    ]) {
      const snapshot = fixture();
      Object.assign(snapshot.facts.ecologyInhabitants[0], change);
      expect(buildRegionCreatureContext(snapshot, 'habitat:forest', [species])).toMatchObject({
        ok: false,
        reason: 'no-supported-species',
      });
    }
    expect(buildRegionCreatureContext(fixture(), 'habitat:forest', [] as Species[]).ok).toBe(false);
  });
  it('retains identity through renames and reports deleted/changed assignments honestly', () => {
    const snapshot = fixture();
    snapshot.facts.habitats[0].name = 'Renamed habitat';
    expect(describeRegionCreatureContext(snapshot, assignment).habitatName).toBe('Renamed habitat');
    snapshot.facts.ecologyInhabitants[0].roles = ['predator'];
    expect(describeRegionCreatureContext(snapshot, assignment).status).toBe('stale');
    snapshot.facts.ecologyInhabitants[0].source = { kind: 'species', speciesName: 'different' };
    expect(describeRegionCreatureContext(snapshot, assignment).status).toBe('unresolved');
    snapshot.facts.habitats = [];
    expect(describeRegionCreatureContext(snapshot, assignment).status).toBe('unresolved');
  });
});
