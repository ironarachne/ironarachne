import { describe, expect, it } from 'vitest';

import {
  canRemoveRegionSettlement,
  removeRegionPlace,
  regionFactsNeedingReview,
  setRealmText,
  setRegionMainRealm,
  setRegionPlaceText,
  setRegionText,
} from './region_editing';
import { rollRegionSnapshot } from './region_roll';
import { emptyRegionFacts } from './region_facts';
import { validateRegionSnapshot } from './region_artifact_kind';
import { regionToMarkdown, regionToText, regionToMapSvg } from './region_presentation';

const snapshot = rollRegionSnapshot('editing-seed');

describe('the fixture these edits are made against', () => {
  it('has the realms and settlements the edits below address', () => {
    expect(snapshot.realms.length).toBeGreaterThan(1);
    expect(snapshot.settlements.length).toBeGreaterThan(1);
  });
});

describe('editing a region', () => {
  it('renames it without touching what is on it', () => {
    const edited = setRegionText(snapshot, 'name', 'The Cold Marches');
    expect(edited.name).toEqual('The Cold Marches');
    expect(edited.realms).toEqual(snapshot.realms);
    expect(edited.settlements).toEqual(snapshot.settlements);
    expect(edited.map).toEqual(snapshot.map);
  });

  it('rewrites its description', () => {
    expect(setRegionText(snapshot, 'description', 'Nobody farms here.').description).toEqual(
      'Nobody farms here.',
    );
  });

  it('leaves the original untouched', () => {
    const before = snapshot.name;
    setRegionText(snapshot, 'name', 'somewhere else');
    expect(snapshot.name).toEqual(before);
  });

  it('moves the seat to another realm', () => {
    const other = snapshot.mainRealm === 0 ? 1 : 0;
    expect(setRegionMainRealm(snapshot, other).mainRealm).toEqual(other);
  });

  it('does not rewrite the prose that mentions the old seat', () => {
    // 4.2: the description may have been rewritten by hand, and a generator that quietly corrects
    // it is regenerating over the user's work.
    const other = snapshot.mainRealm === 0 ? 1 : 0;
    expect(setRegionMainRealm(snapshot, other).description).toEqual(snapshot.description);
  });

  it('ignores a seat that is not a realm it has', () => {
    expect(setRegionMainRealm(snapshot, 99)).toEqual(snapshot);
    expect(setRegionMainRealm(snapshot, -1)).toEqual(snapshot);
  });
});

describe('editing one realm', () => {
  it('changes its words without disturbing its neighbours (4.4)', () => {
    const named = setRealmText(snapshot, 0, 'name', 'Ashmarch');
    const edited = setRealmText(named, 0, 'adjective', 'Ashmarcher');
    expect(edited.realms[0].name).toEqual('Ashmarch');
    expect(edited.realms[0].adjective).toEqual('Ashmarcher');
    expect(edited.realms.slice(1)).toEqual(snapshot.realms.slice(1));
  });

  it('leaves its arms, its ruler and its tiles alone', () => {
    const edited = setRealmText(snapshot, 0, 'description', 'A cold place.');
    expect(edited.realms[0].heraldry).toEqual(snapshot.realms[0].heraldry);
    expect(edited.realms[0].authority).toEqual(snapshot.realms[0].authority);
    expect(edited.realms[0].tiles).toEqual(snapshot.realms[0].tiles);
  });

  it('ignores a realm that is not there', () => {
    expect(setRealmText(snapshot, 99, 'name', 'nowhere')).toEqual(snapshot);
    expect(setRealmText(snapshot, -1, 'name', 'nowhere')).toEqual(snapshot);
  });
});

describe('editing the settlements and organizations', () => {
  it('flags settlement explanations and transitive claims without rerolling or overwriting prose', () => {
    const saved = structuredClone(snapshot);
    const role = saved.facts.settlementRoles.find(
      (entry) =>
        entry.settlement.kind === 'embedded' &&
        entry.settlement.settlementId === saved.settlements[0].id,
    )!;
    saved.facts.claims.push({
      id: 'claim:edited-site',
      name: 'Hand-written claim',
      description: 'Keep my words.',
      origin: 'authored',
      subjectId: role.id,
      relatedIds: [],
      reason: {
        ruleId: 'test:claim',
        status: 'current',
        sources: [{ kind: 'fact', factId: role.id }],
      },
    });
    const edited = setRegionPlaceText(saved, 'settlements', 0, 'description', 'A floating city.');
    expect(edited.description).toBe(saved.description);
    expect(edited.map).toBe(saved.map);
    expect(edited.environment).toBe(saved.environment);
    expect(edited.realms).toBe(saved.realms);
    expect(edited.facts.habitats).toEqual(saved.facts.habitats);
    expect(edited.facts.resources).toEqual(saved.facts.resources);
    expect(edited.facts.settlementRoles.find((entry) => entry.id === role.id)?.reason?.status).toBe(
      'stale',
    );
    const claim = edited.facts.claims.find((entry) => entry.id === 'claim:edited-site')!;
    expect(claim.description).toBe('Keep my words.');
    expect(claim.origin).toBe('authored');
    expect(claim.reason?.status).toBe('stale');
    expect(regionFactsNeedingReview(edited)).toContain(claim);
    expect(regionToMarkdown(edited)).toContain('## Facts needing review');
    expect(regionToText(edited)).toContain('Hand-written claim');
    expect(
      regionToMapSvg(setRegionPlaceText(saved, 'settlements', 0, 'name', 'Coldwater')),
    ).toContain('Coldwater');
    expect(saved.facts.claims.at(-1)?.reason?.status).toBe('current');
    const reopened = JSON.parse(JSON.stringify(edited));
    expect(validateRegionSnapshot(reopened).ok).toBe(true);
    expect(regionFactsNeedingReview(reopened)).toEqual(regionFactsNeedingReview(edited));
  });

  it('does not invalidate facts for an unchanged settlement field or an organization edit', () => {
    expect(
      setRegionPlaceText(snapshot, 'settlements', 0, 'name', snapshot.settlements[0].snapshot.name),
    ).toBe(snapshot);
    expect(setRegionPlaceText(snapshot, 'settlements', 99, 'name', 'Missing')).toBe(snapshot);
    expect(setRegionPlaceText(snapshot, 'organizations', 0, 'name', 'Guild').facts).toBe(
      snapshot.facts,
    );
  });
  it('renames one settlement and leaves the rest', () => {
    const edited = setRegionPlaceText(snapshot, 'settlements', 0, 'name', 'Coldwater');
    expect(edited.settlements[0].snapshot.name).toEqual('Coldwater');
    expect(edited.settlements.slice(1)).toEqual(snapshot.settlements.slice(1));
    expect(edited.organizations).toEqual(snapshot.organizations);
  });

  it('rewrites a description without touching the name', () => {
    const edited = setRegionPlaceText(snapshot, 'settlements', 0, 'description', 'A mill town.');
    expect(edited.settlements[0].snapshot.description).toEqual('A mill town.');
    expect(edited.settlements[0].snapshot.name).toEqual(snapshot.settlements[0].snapshot.name);
  });

  it('takes one out and leaves the rest', () => {
    const edited = removeRegionPlace(snapshot, 'settlements', 0);
    expect(edited.settlements).toHaveLength(snapshot.settlements.length - 1);
    expect(edited.settlements[0]).toEqual(snapshot.settlements[1]);
  });

  it('removes dependent roles and claims and marks other reasons stale', () => {
    const nodeId = snapshot.map.nodes[0].id;
    const facts = {
      ...emptyRegionFacts('current'),
      settlementRoles: [
        {
          id: 'role:one',
          name: 'Crossing',
          description: '',
          origin: 'generated' as const,
          settlement: { kind: 'embedded' as const, settlementId: snapshot.settlements[0].id },
          areaIds: [],
          anchor: { nodeIds: [nodeId], edgeIds: [] },
        },
      ],
      habitats: [
        {
          id: 'habitat:one',
          name: 'Moor',
          description: '',
          origin: 'generated' as const,
          areaIds: [],
          reason: {
            ruleId: 'fantasy.habitat.v1',
            status: 'current' as const,
            sources: [{ kind: 'fact' as const, factId: 'role:one' }],
          },
        },
      ],
      resources: [
        {
          id: 'resource:one',
          kind: 'freshwater' as const,
          availability: 'limited' as const,
          depositIds: [],
          name: 'Springs',
          description: '',
          origin: 'generated' as const,
          areaIds: [],
          habitatIds: [],
          anchor: { nodeIds: [nodeId], edgeIds: [] },
          reason: {
            ruleId: 'fantasy.resource.v1',
            status: 'current' as const,
            sources: [{ kind: 'fact' as const, factId: 'route:one' }],
          },
        },
      ],
      routes: [
        {
          id: 'route:one',
          kind: 'road' as const,
          name: 'Town Road',
          description: '',
          origin: 'generated' as const,
          areaIds: [],
          anchor: { nodeIds: [], edgeIds: [snapshot.map.edges[0].id] },
          endpoints: [
            {
              kind: 'settlement' as const,
              settlement: { kind: 'embedded' as const, settlementId: snapshot.settlements[0].id },
            },
            {
              kind: 'settlement' as const,
              settlement: { kind: 'artifact' as const, targetId: 'outside' },
            },
          ] as [
            { kind: 'settlement'; settlement: { kind: 'embedded'; settlementId: string } },
            { kind: 'settlement'; settlement: { kind: 'artifact'; targetId: string } },
          ],
        },
      ],
      claims: [
        {
          id: 'claim:one',
          name: 'Traffic',
          description: '',
          origin: 'generated' as const,
          subjectId: 'role:one',
          relatedIds: [],
        },
      ],
    };
    const edited = removeRegionPlace({ ...snapshot, facts }, 'settlements', 0);
    expect(edited.facts.settlementRoles).toEqual([]);
    expect(edited.facts.routes).toEqual([]);
    expect(edited.facts.claims).toEqual([]);
    expect(edited.facts.habitats[0].reason?.status).toBe('stale');
    expect(edited.facts.resources[0].reason?.status).toBe('stale');
    expect(validateRegionSnapshot(edited).ok).toBe(true);
  });

  it('protects authored dependencies when a settlement is removed', () => {
    const facts = {
      ...emptyRegionFacts('current'),
      settlementRoles: [
        {
          id: 'role:one',
          name: 'Home',
          description: '',
          origin: 'authored' as const,
          settlement: { kind: 'embedded' as const, settlementId: snapshot.settlements[0].id },
          areaIds: [],
          anchor: { nodeIds: [], edgeIds: [] },
        },
      ],
    };
    const authored = { ...snapshot, facts };
    expect(canRemoveRegionSettlement(authored, 0)).toBe(false);
    expect(removeRegionPlace(authored, 'settlements', 0)).toBe(authored);
    const withAuthoredClaim = {
      ...authored,
      facts: {
        ...facts,
        settlementRoles: [{ ...facts.settlementRoles[0], origin: 'generated' as const }],
        claims: [
          {
            id: 'claim:one',
            name: 'Memory',
            description: '',
            origin: 'authored' as const,
            subjectId: 'role:one',
            relatedIds: [],
          },
        ],
      },
    };
    expect(canRemoveRegionSettlement(withAuthoredClaim, 0)).toBe(false);
    expect(removeRegionPlace(withAuthoredClaim, 'settlements', 0)).toBe(withAuthoredClaim);
    const withAuthoredRoute = {
      ...snapshot,
      facts: {
        ...emptyRegionFacts('current'),
        routes: [
          {
            id: 'route:one',
            kind: 'road' as const,
            name: 'Home Road',
            description: '',
            origin: 'authored' as const,
            areaIds: [],
            anchor: { nodeIds: [], edgeIds: [snapshot.map.edges[0].id] },
            endpoints: [
              {
                kind: 'settlement' as const,
                settlement: { kind: 'embedded' as const, settlementId: snapshot.settlements[0].id },
              },
              {
                kind: 'settlement' as const,
                settlement: { kind: 'artifact' as const, targetId: 'outside' },
              },
            ] as [
              { kind: 'settlement'; settlement: { kind: 'embedded'; settlementId: string } },
              { kind: 'settlement'; settlement: { kind: 'artifact'; targetId: string } },
            ],
          },
        ],
      },
    };
    expect(canRemoveRegionSettlement(withAuthoredRoute, 0)).toBe(false);
    expect(removeRegionPlace(withAuthoredRoute, 'settlements', 0)).toBe(withAuthoredRoute);
  });

  it('ignores an index that is not there', () => {
    expect(setRegionPlaceText(snapshot, 'organizations', 99, 'name', 'nowhere')).toEqual(snapshot);
    expect(removeRegionPlace(snapshot, 'settlements', 99)).toEqual(snapshot);
  });
});

describe('settlement removal with ecological uses', () => {
  it('removes generated uses and their claims while preserving inhabitants, and protects authored uses', () => {
    const saved = structuredClone(snapshot);
    saved.facts.products = [];
    saved.facts.dailyLife = [];
    saved.facts.supply = [];
    saved.facts.resources = [];
    saved.facts.notables = [];
    saved.facts.claims = [];
    saved.facts.settlementRoles.forEach((entry) => {
      if (entry.reason)
        entry.reason.sources = entry.reason.sources.filter(
          (source) => source.kind !== 'fact' || !source.factId.startsWith('resource:'),
        );
    });
    saved.facts.ecologyInhabitants = [
      {
        id: 'inhabitant:reed',
        name: 'Reeds',
        description: '',
        origin: 'generated',
        category: 'flora',
        roles: ['producer'],
        source: { kind: 'described', label: 'reeds' },
        habitatIds: [saved.facts.habitats[0].id],
      },
    ];
    saved.facts.ecologyRelationships = [
      {
        id: 'ecology:reed-use',
        name: 'Reed use',
        description: '',
        origin: 'generated',
        subjectId: 'inhabitant:reed',
        habitatIds: [saved.facts.habitats[0].id],
        relation: {
          kind: 'used-by',
          settlement: { kind: 'embedded', settlementId: saved.settlements[0].id },
          use: 'material',
        },
      },
    ];
    saved.facts.claims.push({
      id: 'claim:reed-use',
      name: 'Reed roofs',
      description: '',
      origin: 'generated',
      subjectId: 'ecology:reed-use',
      relatedIds: [],
    });
    expect(validateRegionSnapshot(saved).ok).toBe(true);
    const removed = removeRegionPlace(saved, 'settlements', 0);
    expect(removed.facts.ecologyRelationships).toEqual([]);
    expect(removed.facts.claims.some((entry) => entry.id === 'claim:reed-use')).toBe(false);
    expect(removed.facts.ecologyInhabitants).toEqual(saved.facts.ecologyInhabitants);
    expect(validateRegionSnapshot(removed).ok).toBe(true);
    saved.facts.ecologyRelationships[0].origin = 'authored';
    expect(canRemoveRegionSettlement(saved, 0)).toBe(false);
    expect(removeRegionPlace(saved, 'settlements', 0)).toBe(saved);
  });
});
