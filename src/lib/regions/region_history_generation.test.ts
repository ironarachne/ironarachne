import { historyAfterSourceRemoval } from './region_history_removal';
import { canRemoveRegionSettlement, removeRegionPlace } from './region_editing';
import { removeRegionResourceFact } from './region_resource_editing';
import { regionFromSnapshot } from './region_rehydrate';
import { toRegionSnapshot } from './region_snapshot';
import { describe, expect, it, vi } from 'vitest';
import { RNG } from '@ironarachne/rng';
import { validateRegionSnapshot } from './region_artifact_kind';
import type { RegionSnapshot } from './region_snapshot';
import { retainRegionRealms } from './region_realm_identity';
import { generateRegionHistory } from './region_history_generation';
import { regionHistoryError } from './region_history_validation';
import { historyEvidenceCurrent } from './region_history_evidence';
import { regionHistoryCandidates } from './region_history_candidates';
import type { RegionHistory } from './region_history_types';
import * as Names from '$lib/names';
import * as Passes from './region_generation_passes';
import { rollRegionSnapshot } from './region_roll';

import {
  context,
  realms,
  organizations,
  settlement,
  historyPresentBase as base,
} from '../../../test_fixtures/region_history_scenarios';
function roll(snapshot: RegionSnapshot, seed = 'history-test'): RegionHistory {
  const result = generateRegionHistory(snapshot, new RNG(seed));
  expect(regionHistoryError(result, snapshot)).toBeNull();
  expect(result.events.length).toBeLessThanOrEqual(6);
  for (const event of result.events) {
    expect(historyEvidenceCurrent({ ...snapshot, history: result }, event.evidence)).toBe(true);
    expect(event.time.yearsBeforePresent).toBeUndefined();
    expect(event.description).not.toBe('');
    expect(event.evidence.reason.ruleId).toMatch(/^fantasy:region:history:.*:v1$/);
  }
  const valid = validateRegionSnapshot({ ...snapshot, history: result });
  expect(valid.ok, valid.ok ? '' : valid.message).toBe(true);
  return result;
}

describe('seeded regional history generation', () => {
  it('records an empty history when nothing has eligible support', () => {
    expect(roll(context())).toEqual({ version: 2, state: 'generated', events: [], actors: [] });
  });
  it('gives a sparse unaffiliated settlement one grounded founding without filler', () => {
    const snapshot = context();
    settlement(snapshot);
    const before = structuredClone(snapshot),
      result = roll(snapshot);
    expect(result.events).toHaveLength(1);
    expect(result.actors).toEqual([]);
    expect(result.events[0].outcome).toEqual({
      kind: 'founding',
      founded: { kind: 'settlement', settlementId: 'settlement:one' },
    });
    expect(result.events[0].evidence.reason.sources).toEqual([
      { kind: 'fact', factId: 'role:site:settlement:one' },
    ]);
    expect(result.events[0].description).toContain(snapshot.settlements[0].snapshot.name);
    expect(snapshot).toEqual(before);
  });
  it('requires a current embedded site at the actual dry-land location', () => {
    for (const change of ['stale', 'external', 'moved', 'water', 'missing'] as const) {
      const snapshot = context();
      settlement(snapshot);
      const role = snapshot.facts.settlementRoles[0];
      if (change === 'stale') role.reason!.status = 'stale';
      if (change === 'external') role.settlement = { kind: 'artifact', targetId: 'unresolved' };
      if (change === 'moved') role.anchor.nodeIds = [];
      if (change === 'water')
        snapshot.map.nodes.find(
          (n) => n.id === snapshot.settlements[0].snapshot.mapNodeId,
        )!.isWater = true;
      if (change === 'missing') snapshot.facts.settlementRoles = [];
      expect(generateRegionHistory(snapshot, new RNG('ineligible')).events).toEqual([]);
    }
  });
  it('makes saved subordination historical without removing the subordinate polity', () => {
    const snapshot = context();
    realms(snapshot, 2);
    snapshot.realms[0].parent = 1;
    const before = structuredClone(snapshot),
      result = roll(snapshot);
    const entry = result.events.find((event) =>
      event.evidence.reason.ruleId.includes(':subordination:'),
    )!;
    expect(entry.outcome).toEqual({
      kind: 'incorporation',
      predecessor: { kind: 'realm', realmId: 'realm:0' },
      successorRealmId: 'realm:1',
    });
    expect(entry.consequences).toEqual([
      { kind: 'subordination', target: { kind: 'realm', realmId: 'realm:0' } },
    ]);
    expect(entry.description).toContain('today');
    expect(snapshot).toEqual(before);
  });
  it('deduplicates symmetric rivalries and explains their unresolved origin', () => {
    const snapshot = context();
    organizations(snapshot, 2);
    snapshot.organizations[0].relationships = [
      { kind: 'rival', relatedOrganizationId: 'organization:1' },
    ];
    snapshot.organizations[1].relationships = [
      { kind: 'rival', relatedOrganizationId: 'organization:0' },
    ];
    const result = roll(snapshot),
      wars = result.events.filter((e) => e.outcome.kind === 'war');
    expect(wars).toHaveLength(1);
    expect(wars[0].description).toContain('rivalry');
    expect(wars[0].participants).toHaveLength(2);
    expect(wars[0].consequences.every((c) => c.kind === 'rivalry')).toBe(true);
    for (const extra of ['allied', 'parent', 'client'] as const) {
      const changed = structuredClone(snapshot);
      changed.organizations[0].relationships.push({
        kind: extra,
        relatedOrganizationId: 'organization:1',
      });
      expect(roll(changed).events.some((e) => e.outcome.kind === 'war')).toBe(false);
    }
    snapshot.organizations[0].relationships = [{ kind: 'rival', relatedOrganizationId: 'missing' }];
    snapshot.organizations[1].relationships = [];
    expect(roll(snapshot).events.some((e) => e.outcome.kind === 'war')).toBe(false);
  });
  it('recognizes unpressed realm claims without granting control or declaring active war', () => {
    const snapshot = context();
    realms(snapshot, 2);
    snapshot.realms[0].claims = [
      { claimantId: 1, claimantName: snapshot.realms[1].name, status: 'unpressed' },
    ];
    const before = structuredClone(snapshot),
      result = roll(snapshot);
    const war = result.events.find((e) => e.outcome.kind === 'war')!;
    expect(war.outcome).toMatchObject({ kind: 'war', resolution: 'claim-persists' });
    expect(war.description).toContain('claim');
    expect(snapshot).toEqual(before);
    snapshot.realms[0].claims[0].status = 'unknown-status';
    const unknown = roll(snapshot);
    expect(unknown.events.some((e) => e.outcome.kind === 'war')).toBe(false);
    expect(
      unknown.events.some((e) =>
        e.participants.some((p) => p.kind === 'realm' && p.realmId === 'realm:0'),
      ),
    ).toBe(false);
    snapshot.realms[0].claims[0].status = 'unpressed';
    snapshot.realms[0].claims[0].claimantId = 0;
    expect(roll(snapshot).events.some((e) => e.outcome.kind === 'war')).toBe(false);
  });
  it('omits cyclic parent support and does not turn current hierarchy into unresolved war', () => {
    const snapshot = context();
    realms(snapshot, 2);
    snapshot.realms[0].parent = 1;
    snapshot.realms[1].parent = 0;
    expect(generateRegionHistory(snapshot, new RNG('cycle')).events).toEqual([]);
    snapshot.realms[1].parent = -1;
    snapshot.realms[0].claims = [{ claimantId: 1, claimantName: 'B', status: 'unpressed' }];
    expect(roll(snapshot).events.some((e) => e.outcome.kind === 'war')).toBe(false);
  });
  it('creates either fall or absorption as a complete, explicitly invented predecessor bundle', () => {
    const snapshot = context();
    realms(snapshot, 1);
    const endings = new Set<string>();
    for (let i = 0; i < 12; i++) {
      const result = roll(snapshot, `predecessor:${i}`);
      expect(result.actors).toHaveLength(1);
      const actor = result.actors[0];
      expect(actor.origin).toBe('generated');
      expect(actor.name).toMatch(/^the Former Realm of /);
      expect(actor.name.toLowerCase()).not.toBe(snapshot.realms[0].name.toLowerCase());
      const start = result.events.find(
        (e) => e.outcome.kind === 'founding' && e.outcome.founded.kind === 'historicalActor',
      )!;
      const end = result.events.find(
        (e) =>
          e.outcome.kind === 'fall' ||
          (e.outcome.kind === 'incorporation' && e.outcome.predecessor.kind === 'historicalActor'),
      )!;
      endings.add(end.outcome.kind);
      expect(end.causedByEventIds).toEqual([start.id]);
      expect(start.time.order).toBeLessThan(end.time.order);
      expect(end.consequences).toEqual([
        { kind: 'claim-continuity', target: { kind: 'realm', realmId: 'realm:0' } },
      ]);
    }
    expect([...endings].sort()).toEqual(['fall', 'incorporation']);
  });
  it('terminates and leaves no orphaned predecessors or repeated founding filler in a crowded region', () => {
    const snapshot = context();
    realms(snapshot, 8);
    organizations(snapshot, 10);
    for (let i = 0; i < 8; i++) settlement(snapshot, `settlement:${i}`);
    for (let i = 0; i < 6; i++) snapshot.realms[i].parent = 7;
    snapshot.organizations.forEach((org, i) => {
      if (i % 2 === 0)
        org.relationships = [
          { kind: 'rival', relatedOrganizationId: snapshot.organizations[i + 1].id },
        ];
    });
    const result = roll(snapshot);
    expect(result.events).toHaveLength(6);
    for (const actor of result.actors)
      expect(
        result.events.filter((e) =>
          e.participants.some((p) => p.kind === 'historicalActor' && p.actorId === actor.id),
        ),
      ).toHaveLength(2);
    const currentFoundings = result.events.filter(
      (e) => e.outcome.kind === 'founding' && e.outcome.founded.kind !== 'historicalActor',
    );
    expect(currentFoundings.length).toBeLessThanOrEqual(3);
    expect(snapshot.organizations).toHaveLength(10);
    expect(snapshot.realms).toHaveLength(8);
  });
  it('keeps selection and naming canonical across collection and realm-index reorderings', () => {
    const snapshot = context();
    realms(snapshot, 3);
    organizations(snapshot, 3);
    settlement(snapshot, 'settlement:a');
    settlement(snapshot, 'settlement:b');
    snapshot.realms[0].parent = 2;
    snapshot.realms[1].claims = [{ claimantId: 0, claimantName: 'A', status: 'unpressed' }];
    snapshot.organizations[0].relationships = [
      { kind: 'rival', relatedOrganizationId: 'organization:2' },
      { kind: 'rival', relatedOrganizationId: 'organization:1' },
    ];
    const reordered = structuredClone(
      retainRegionRealms(snapshot, [...snapshot.realmIds].reverse()),
    );
    reordered.organizations.reverse();
    reordered.organizations.forEach((o) => o.relationships.reverse());
    reordered.settlements.reverse();
    reordered.facts.settlementRoles.reverse();
    expect(roll(snapshot, 'canonical')).toEqual(roll(reordered, 'canonical'));
    expect(roll(snapshot, 'canonical')).toEqual(roll(snapshot, 'canonical'));
    expect(
      new Set(Array.from({ length: 6 }, (_, i) => JSON.stringify(roll(snapshot, `different:${i}`))))
        .size,
    ).toBeGreaterThan(1);
  });
  it('does not interpret hazard names, culture or notable prose as disaster/migration evidence', () => {
    const snapshot = context();
    snapshot.facts.notables = [
      {
        id: 'hazard:flood',
        name: 'The Flooded Ruins of the Migrants',
        kind: 'hazard',
        origin: 'authored',
        description: 'A fallen empire lived here.',
        areaIds: [],
      },
    ];
    snapshot.dominantCulture = structuredClone(base.dominantCulture);
    expect(roll(snapshot).events).toEqual([]);
    expect(regionHistoryCandidates(snapshot)).toEqual([]);
  });
  it('preserves recorded or authored histories and blanks without consuming randomness', () => {
    const snapshot = context();
    settlement(snapshot);
    snapshot.history = roll(snapshot);
    const rng = new RNG('unchanged'),
      draw = vi.spyOn(rng, 'int');
    expect(generateRegionHistory(snapshot, rng)).toEqual(snapshot.history);
    expect(draw).not.toHaveBeenCalled();
    snapshot.history.state = 'authored';
    snapshot.history.events[0].description = '';
    expect(generateRegionHistory(snapshot, rng)).toEqual(snapshot.history);
    expect(draw).not.toHaveBeenCalled();
  });
  it('omits unnamed present institutions instead of inventing their identity', () => {
    const snapshot = context();
    realms(snapshot, 1);
    organizations(snapshot, 1);
    settlement(snapshot);
    snapshot.realms[0].name = ' ';
    snapshot.organizations[0].name = '';
    snapshot.settlements[0].snapshot.name = '';
    expect(roll(snapshot).events).toEqual([]);
  });
  it('bounds failed historical naming and drops both events in that bundle', () => {
    const snapshot = context();
    realms(snapshot, 1);
    snapshot.realms[0].name = 'the Former Realm of Collision';
    const generate = vi.fn(() => ['Collision']);
    const original = Names.getFantasyNameGeneratorSet('human', new RNG('stub'));
    const spy = vi
      .spyOn(Names, 'getFantasyNameGeneratorSet')
      .mockReturnValue({ ...original, country: { ...original.country, generate } });
    try {
      const result = roll(snapshot);
      expect(result.actors).toEqual([]);
      expect(
        result.events.every(
          (e) => e.outcome.kind === 'founding' && e.outcome.founded.kind === 'realm',
        ),
      ).toBe(true);
      expect(generate).toHaveBeenCalledTimes(3);
    } finally {
      spy.mockRestore();
    }
  });
});

describe('history pass isolation', () => {
  it('cannot move upstream output when extra draws are added to its named stream', () => {
    const first = rollRegionSnapshot('history-stream-isolation', {
      affiliation: 'affiliated',
      generateNeighbors: true,
    });
    const original = Passes.createRegionStageRng;
    const spy = vi.spyOn(Passes, 'createRegionStageRng').mockImplementation((seed, stage) => {
      const rng = original(seed, stage);
      if (stage === 'regional-history') rng.randomString(256);
      return rng;
    });
    let second: RegionSnapshot;
    try {
      second = rollRegionSnapshot('history-stream-isolation', {
        affiliation: 'affiliated',
        generateNeighbors: true,
      });
    } finally {
      spy.mockRestore();
    }
    const { history: firstHistory, ...firstPresent } = first;
    const { history: secondHistory, ...secondPresent } = second;
    expect(secondPresent).toEqual(firstPresent);
    expect(secondHistory).not.toEqual(firstHistory);
    expect(first.gazetteer).toEqual(second.gazetteer);
  });
});

describe('generated history source-removal safety', () => {
  function subject() {
    const snapshot = context();
    realms(snapshot, 1);
    settlement(snapshot);
    organizations(snapshot, 2);
    snapshot.organizations[0].relationships = [
      { kind: 'rival', relatedOrganizationId: 'organization:1' },
    ];
    snapshot.history = roll(snapshot);
    return snapshot;
  }
  it('keeps settlement, organization and site removal snapshots valid, preserving independent events', () => {
    const snapshot = subject(),
      before = structuredClone(snapshot);
    const settlementEvent = snapshot.history.events.find(
      (e) => e.outcome.kind === 'founding' && e.outcome.founded.kind === 'settlement',
    )!;
    expect(settlementEvent).toBeDefined();
    const removed = removeRegionPlace(snapshot, 'settlements', 0);
    expect(validateRegionSnapshot(removed).ok).toBe(true);
    expect(removed.history.events.some((e) => e.id === settlementEvent.id)).toBe(false);
    expect(removed.history.events.some((e) => e.outcome.kind === 'war')).toBe(true);
    const orgRemoved = removeRegionPlace(snapshot, 'organizations', 0);
    expect(validateRegionSnapshot(orgRemoved).ok).toBe(true);
    expect(orgRemoved.history.events.some((e) => e.outcome.kind === 'war')).toBe(false);
    const siteRemoved = removeRegionResourceFact(
      snapshot,
      'settlementRoles',
      snapshot.facts.settlementRoles[0].id,
    );
    expect(validateRegionSnapshot(siteRemoved).ok).toBe(true);
    expect(siteRemoved.history.events.some((e) => e.id === settlementEvent.id)).toBe(false);
    const referenced = toRegionSnapshot(regionFromSnapshot(snapshot, new RNG('load')), {
      referencedSettlementName: snapshot.settlements[0].snapshot.name,
    });
    expect(validateRegionSnapshot(referenced).ok).toBe(true);
    expect(referenced.settlements).toEqual([]);
    expect(snapshot).toEqual(before);
  });
  it('blocks existing source-removal transactions when they would destroy authored history', () => {
    const snapshot = subject();
    snapshot.history.events.forEach((e) => {
      e.origin = 'authored';
    });
    snapshot.history.state = 'authored';
    expect(canRemoveRegionSettlement(snapshot, 0)).toBe(false);
    expect(removeRegionPlace(snapshot, 'settlements', 0)).toBe(snapshot);
    expect(removeRegionPlace(snapshot, 'organizations', 0)).toBe(snapshot);
    expect(
      removeRegionResourceFact(snapshot, 'settlementRoles', snapshot.facts.settlementRoles[0].id),
    ).toBe(snapshot);
  });
  it('removes causal descendants and orphaned generated actors while protecting authored actors', () => {
    const snapshot = subject();
    const h = structuredClone(snapshot.history);
    const founding = h.events.find(
      (e) => e.outcome.kind === 'founding' && e.outcome.founded.kind === 'historicalActor',
    )!;
    const factId = snapshot.facts.settlementRoles[0].id;
    founding.evidence.reason.sources.push({ kind: 'fact', factId });
    const removed = historyAfterSourceRemoval(h, new Set([factId]))!;
    expect(removed.actors).toEqual([]);
    expect(
      removed.events.every((e) => e.participants.every((p) => p.kind !== 'historicalActor')),
    ).toBe(true);
    expect(regionHistoryError(removed, snapshot)).toBeNull();
    expect(historyAfterSourceRemoval(h, new Set(), [{ kind: 'fact', factId }])).toEqual(removed);
    h.actors[0].origin = 'authored';
    expect(historyAfterSourceRemoval(h, new Set([factId]))).toBeNull();
    expect(historyAfterSourceRemoval(snapshot.history, new Set())).toBe(snapshot.history);
  });
});
