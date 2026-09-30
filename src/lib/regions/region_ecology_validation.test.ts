import { describe, expect, it } from 'vitest';
import type { RegionMap } from '$lib/map';
import type { EcologyInhabitantFact, EcologyRelationshipFact } from './region_ecology_types';
import { emptyRegionFacts, regionFactsError } from './region_facts';

const map: RegionMap = { width: 1, height: 1, nodes: [], edges: [], corners: [] };
function inhabitant(
  id: string,
  changes: Partial<EcologyInhabitantFact> = {},
): EcologyInhabitantFact {
  return {
    id: `inhabitant:${id}`,
    name: id,
    description: 'Saved text',
    origin: 'authored',
    category: 'fauna',
    roles: ['other'],
    source: { kind: 'species', speciesName: 'Unavailable catalog name' },
    habitatIds: ['habitat:one'],
    ...changes,
  };
}
function fixture() {
  const facts = emptyRegionFacts('current');
  facts.habitats = [
    { id: 'habitat:one', name: 'Wetland', description: '', origin: 'authored', areaIds: [] },
  ];
  facts.ecologyInhabitants = [
    inhabitant('bee', { roles: ['pollinator'] }),
    inhabitant('flower', { category: 'flora', roles: ['producer'] }),
  ];
  facts.ecologyRelationships = [
    {
      id: 'ecology:one',
      name: 'Pollination',
      description: '',
      origin: 'authored',
      subjectId: 'inhabitant:bee',
      habitatIds: ['habitat:one'],
      relation: { kind: 'pollinates', targetId: 'inhabitant:flower' },
    },
  ];
  return facts;
}
const validate = (facts: unknown) => regionFactsError(facts, map, []);

describe('ecology fact validation', () => {
  it('accepts unresolved catalog names and typed species/descriptive/artifact sources without losing words', () => {
    const facts = fixture();
    expect(validate(facts)).toBeNull();
    facts.ecologyInhabitants[0].source = {
      kind: 'creature-artifact',
      targetId: 'missing-artifact',
      speciesName: 'last-known',
    };
    facts.ecologyInhabitants[1].source = { kind: 'described', label: 'an unknown plant' };
    expect(validate(facts)).toBeNull();
    expect(facts.ecologyInhabitants[0].description).toBe('Saved text');
  });

  it.each([
    { category: 'future' },
    { roles: [] },
    { roles: ['future'] },
    { roles: ['other', 'producer'] },
    { roles: ['grazer', 'grazer'] },
    { habitatIds: [] },
    { habitatIds: ['missing'] },
    { habitatIds: ['habitat:one', 'habitat:one'] },
    { source: null },
    { source: { kind: 'species', speciesName: ' ' } },
    { source: { kind: 'future' } },
    { source: { kind: 'creature-artifact', targetId: '', speciesName: 'bee' } },
    { source: { kind: 'described', label: '' } },
    { id: 'wrong:bee' },
  ])('rejects illegal inhabitant structure %j', (change) => {
    const facts = fixture();
    facts.ecologyInhabitants[0] = {
      ...facts.ecologyInhabitants[0],
      ...change,
    } as unknown as EcologyInhabitantFact;
    expect(validate(facts)).not.toBeNull();
  });

  it('requires both lists and unique region-local IDs even for authored facts', () => {
    const facts = fixture();
    expect(validate({ ...facts, ecologyInhabitants: undefined })).not.toBeNull();
    expect(validate({ ...facts, ecologyRelationships: undefined })).not.toBeNull();
    facts.ecologyInhabitants.push(facts.ecologyInhabitants[0]);
    expect(validate(facts)).toContain('duplicate');
  });

  it.each([
    { subjectId: 'missing' },
    { relation: null },
    { relation: { kind: 'future', targetId: 'inhabitant:flower' } },
    { relation: { kind: 'feeds-on', targetId: 'missing' } },
    { relation: { kind: 'feeds-on', targetId: 'inhabitant:bee' } },
    { habitatIds: [] },
    { habitatIds: ['missing'] },
  ])('rejects illegal relationship structure %j', (change) => {
    const facts = fixture();
    facts.ecologyRelationships[0] = {
      ...facts.ecologyRelationships[0],
      ...change,
    } as unknown as EcologyRelationshipFact;
    expect(validate(facts)).not.toBeNull();
  });

  it('requires compatible pollination roles and overlapping endpoint habitats even when reasons are stale', () => {
    const facts = fixture();
    facts.ecologyInhabitants[0].roles = ['other'];
    expect(validate(facts)).toContain('pollinator');
    facts.ecologyInhabitants[0].roles = ['pollinator'];
    facts.ecologyInhabitants[1].category = 'fauna';
    expect(validate(facts)).toContain('flora');
    facts.habitats.push({ ...facts.habitats[0], id: 'habitat:two' });
    facts.ecologyInhabitants[1].habitatIds = ['habitat:two'];
    facts.ecologyRelationships[0].reason = {
      ruleId: 'test:v1',
      status: 'stale',
      sources: [{ kind: 'fact', factId: 'missing' }],
    };
    expect(validate(facts)).toContain('target');
    facts.ecologyInhabitants[0].habitatIds = ['habitat:two'];
    expect(validate(facts)).toContain('subject');
  });

  it('rejects reversed duplicate competition but permits distinct directed feeding cycles', () => {
    const facts = fixture();
    facts.ecologyRelationships[0].relation = {
      kind: 'competes-with',
      targetId: 'inhabitant:flower',
    };
    const reversed: EcologyRelationshipFact = {
      ...facts.ecologyRelationships[0],
      id: 'ecology:two',
      subjectId: 'inhabitant:flower',
      relation: { kind: 'competes-with', targetId: 'inhabitant:bee' },
    };
    facts.ecologyRelationships.push(reversed);
    expect(validate(facts)).toContain('duplicate');
    facts.ecologyRelationships[0].relation.kind = 'feeds-on';
    facts.ecologyRelationships[1].relation.kind = 'feeds-on';
    expect(validate(facts)).toBeNull();
  });

  it('validates settlement use targets and rejects plant domestication', () => {
    const facts = fixture();
    const entry = facts.ecologyRelationships[0];
    entry.relation = {
      kind: 'used-by',
      settlement: { kind: 'artifact', targetId: 'outside' },
      use: 'material',
    };
    expect(validate(facts)).toBeNull();
    entry.relation.settlement = { kind: 'embedded', settlementId: 'missing' };
    expect(validate(facts)).toContain('settlement');
    entry.relation.settlement = { kind: 'artifact', targetId: 'outside' };
    entry.relation.use = 'future' as never;
    expect(validate(facts)).toContain('use');
    entry.relation.use = 'domestication';
    entry.subjectId = 'inhabitant:flower';
    expect(validate(facts)).toContain('flora');
  });

  it('resolves ecology as reason and causal-claim sources and validates ecosystem observations', () => {
    const facts = fixture();
    facts.ecologyInhabitants[0].reason = {
      ruleId: 'test:v1',
      status: 'current',
      sources: [{ kind: 'environment', field: 'ecosystems', observedValue: '[]' }],
    };
    facts.claims.push({
      id: 'claim:use',
      name: 'Use',
      description: '',
      origin: 'generated',
      subjectId: 'inhabitant:bee',
      relatedIds: ['ecology:one'],
      reason: {
        ruleId: 'test:v1',
        status: 'current',
        sources: [{ kind: 'fact', factId: 'ecology:one' }],
      },
    });
    expect(validate(facts)).toBeNull();
    facts.ecologyInhabitants[0].reason.sources = [{ kind: 'fact', factId: 'missing' }];
    expect(validate(facts)).toContain('unknown source');
    facts.ecologyInhabitants[0].reason.status = 'stale';
    expect(validate(facts)).toBeNull();
  });
});
