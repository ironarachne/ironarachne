import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { generateRegionHistory } from './region_history_generation';
import { describe, expect, it, vi } from 'vitest';
import { RNG } from '@ironarachne/rng';
import { historyEditingFixture } from '../../../test_fixtures/region_history_editing';
import {
  validateRegionSnapshot,
  migrateRegionSnapshot,
  REGION_PAYLOAD_VERSION,
} from './region_artifact_kind';
import {
  getCurrentHistoryEvents,
  getHistoryEventsNeedingReview,
  withRegionHistoryEvidence,
} from './region_history_dependencies';
import {
  setRegionHistoryEventText,
  setRegionHistoryEventDate,
  reorderRegionHistoryEvents,
  setRegionHistoricalActorName,
  getHistoryEventRemovalImpact,
  removeRegionHistoryEvent,
} from './region_history_editing';
import {
  setRealmText,
  setRegionPlaceText,
  removeRegionPlace,
  canRemoveRegionSettlement,
  getRegionPlaceHistoryRemovalImpact,
} from './region_editing';
import {
  setRegionResourceFactText,
  removeRegionResourceFact,
  canRemoveRegionResourceFact,
  withRegionOverviewEvidence,
  getRegionResourceHistoryRemovalImpact,
} from './region_resource_editing';
import { retainRegionRealms } from './region_realm_identity';
import { historyAfterSourceRemoval, historyRemovalImpact } from './region_history_removal';
import { toRegionSnapshot } from './region_snapshot';
import { regionFromSnapshot } from './region_rehydrate';
import type { RegionSnapshot } from './region_snapshot';
const ids = (snapshot: RegionSnapshot) => getCurrentHistoryEvents(snapshot).map((e) => e.id);
const event = (snapshot: RegionSnapshot, id: string) =>
  snapshot.history.events.find((e) => e.id === id)!;
function valid(snapshot: RegionSnapshot) {
  const result = validateRegionSnapshot(snapshot);
  expect(result.ok, result.ok ? '' : result.message).toBe(true);
}

describe('history currentness and edit invalidation', () => {
  it('reads current events in saved order without mutation or generation', () => {
    const snapshot = historyEditingFixture(),
      before = structuredClone(snapshot);
    valid(snapshot);
    const draw = vi.spyOn(RNG.prototype, 'int');
    try {
      expect(ids(snapshot)).toEqual(snapshot.history.events.map((e) => e.id));
      expect(getHistoryEventsNeedingReview(snapshot)).toEqual([]);
      expect(withRegionHistoryEvidence(snapshot)).toBe(snapshot);
    } finally {
      expect(draw).not.toHaveBeenCalled();
      draw.mockRestore();
    }
    expect(snapshot).toEqual(before);
  });
  it('stales changed realm names and causal descendants without rewriting event words', () => {
    const snapshot = historyEditingFixture();
    event(snapshot, 'event:war').causedByEventIds = ['event:fall'];
    const before = structuredClone(snapshot),
      edited = setRealmText(snapshot, 0, 'name', 'Renamed Realm');
    valid(edited);
    expect(getHistoryEventsNeedingReview(edited).map((e) => e.id)).toEqual([
      'event:old-founding',
      'event:local-founding',
      'event:fall',
      'event:war',
      'event:subordination',
    ]);
    expect(ids(edited)).toEqual(['event:town-founding']);
    expect(edited.history.events.map((e) => e.description)).toEqual(
      before.history.events.map((e) => e.description),
    );
    expect(edited.history.events.every((e) => e.origin === 'generated')).toBe(true);
    expect(snapshot).toEqual(before);
  });
  it.each(['name', 'site', 'parent', 'claim', 'relationship'] as const)(
    'rechecks directly imported %s edits and persists review through the shared boundary',
    (kind) => {
      const snapshot = historyEditingFixture();
      if (kind === 'name') snapshot.organizations[0].name = 'Imported name';
      if (kind === 'site')
        snapshot.settlements[0].snapshot.mapNodeId = snapshot.map.nodes.find(
          (n) => !n.isWater && !n.isOcean && n.id !== snapshot.settlements[0].snapshot.mapNodeId,
        )!.id;
      if (kind === 'parent') snapshot.realms[0].parent = -1;
      if (kind === 'claim')
        snapshot.realms[0].claims.push({
          claimantId: 1,
          claimantName: snapshot.realms[1].name,
          status: 'unpressed',
        });
      if (kind === 'relationship')
        snapshot.organizations[0].relationships.push({
          kind: 'allied',
          relatedOrganizationId: 'organization:b',
        });
      const affected = getHistoryEventsNeedingReview(snapshot);
      expect(affected.length).toBeGreaterThan(0);
      expect(affected.every((e) => e.evidence.reason.status === 'current')).toBe(true);
      const edited = withRegionOverviewEvidence(snapshot);
      valid(edited);
      expect(getHistoryEventsNeedingReview(edited).map((e) => e.id)).toEqual(
        affected.map((e) => e.id),
      );
      expect(affected.every((e) => event(edited, e.id).evidence.reason.status === 'stale')).toBe(
        true,
      );
    },
  );
  it('marks transitive fact dependents while leaving unrelated history current', () => {
    const snapshot = historyEditingFixture(),
      edited = setRegionResourceFactText(
        snapshot,
        'resources',
        'resource:stone',
        'description',
        'Edited source',
      );
    valid(edited);
    expect(event(edited, 'event:town-founding').evidence.reason.status).toBe('stale');
    expect(ids(edited)).toHaveLength(5);
    expect(ids(edited)).toContain('event:war');
    expect(snapshot.facts.resources[0].description).toBe('A saved local source');
    expect(event(snapshot, 'event:town-founding').evidence.reason.status).toBe('current');
  });
  it('handles supported organization and settlement text mutations and no-op field edits', () => {
    const snapshot = historyEditingFixture();
    expect(setRealmText(snapshot, 0, 'name', snapshot.realms[0].name)).toBe(snapshot);
    expect(
      setRegionPlaceText(snapshot, 'organizations', 0, 'name', snapshot.organizations[0].name),
    ).toBe(snapshot);
    expect(
      setRegionPlaceText(snapshot, 'settlements', 0, 'name', snapshot.settlements[0].snapshot.name),
    ).toBe(snapshot);
    expect(
      setRegionResourceFactText(
        snapshot,
        'resources',
        'resource:stone',
        'description',
        snapshot.facts.resources[0].description,
      ),
    ).toBe(snapshot);
    expect(
      event(setRegionPlaceText(snapshot, 'organizations', 0, 'name', 'New order'), 'event:war')
        .evidence.reason.status,
    ).toBe('stale');
    expect(
      event(
        setRegionPlaceText(snapshot, 'settlements', 0, 'name', 'New town'),
        'event:town-founding',
      ).evidence.reason.status,
    ).toBe('stale');
    expect(
      event(
        setRegionPlaceText(snapshot, 'organizations', 0, 'description', 'Only prose'),
        'event:war',
      ).evidence.reason.status,
    ).toBe('current');
  });
  it('detects actor name changes in imported version-2 histories without parsing prose', () => {
    const snapshot = historyEditingFixture();
    snapshot.history.actors[0].name = 'Imported actor';
    expect(ids(snapshot)).not.toContain('event:old-founding');
    expect(ids(snapshot)).not.toContain('event:fall');
    expect(ids(snapshot)).toContain('event:war');
    const edited = withRegionHistoryEvidence(snapshot);
    valid(edited);
    expect(event(edited, 'event:fall').description).toBe('Saved words for event:fall.');
    expect(event(edited, 'event:fall').evidence.reason.status).toBe('stale');
  });
  it('rejects malformed, unmatched, or solely historical actor-name evidence', () => {
    const badName = historyEditingFixture();
    const observed = event(badName, 'event:fall').evidence.observations.find(
      (o) => o.kind === 'historicalActor',
    )!;
    if (observed.kind !== 'historicalActor') throw new Error('Missing actor witness');
    observed.name = 42 as never;
    expect(validateRegionSnapshot(badName).ok).toBe(false);
    const unknown = historyEditingFixture();
    const witness = event(unknown, 'event:fall').evidence.observations.find(
      (o) => o.kind === 'historicalActor',
    )!;
    if (witness.kind !== 'historicalActor') throw new Error('Missing actor witness');
    witness.actorId = 'missing';
    expect(validateRegionSnapshot(unknown).ok).toBe(false);
    const unmatched = historyEditingFixture();
    event(unmatched, 'event:war').evidence.observations.push({
      kind: 'historicalActor',
      actorId: 'actor:old',
      name: 'the Old Realm',
    });
    expect(validateRegionSnapshot(unmatched).ok).toBe(false);
    const onlyPast = historyEditingFixture();
    event(onlyPast, 'event:old-founding').evidence.observations = [
      { kind: 'historicalActor', actorId: 'actor:old', name: 'the Old Realm' },
    ];
    expect(validateRegionSnapshot(onlyPast).ok).toBe(false);
    const wrongVersion = historyEditingFixture();
    wrongVersion.history.version = 1;
    expect(validateRegionSnapshot(wrongVersion).ok).toBe(false);
  });
  it('does not trust cycles, unsupported history versions or missing actor witnesses', () => {
    const snapshot = historyEditingFixture();
    event(snapshot, 'event:old-founding').causedByEventIds = ['event:fall'];
    expect(getCurrentHistoryEvents(snapshot)).toEqual([]);
    snapshot.history.version = 99 as never;
    expect(getCurrentHistoryEvents(snapshot)).toEqual([]);
    const missing = historyEditingFixture();
    event(missing, 'event:fall').evidence.observations = event(
      missing,
      'event:fall',
    ).evidence.observations.filter((o) => o.kind !== 'historicalActor');
    expect(validateRegionSnapshot(missing).ok).toBe(false);
    expect(getCurrentHistoryEvents(missing)).toEqual([]);
  });
});

describe('immutable history authoring', () => {
  it('keeps blanks, support and stale warnings when generated text becomes authored', () => {
    const snapshot = setRealmText(historyEditingFixture(), 0, 'name', 'Changed');
    const before = structuredClone(snapshot),
      edited = setRegionHistoryEventText(snapshot, 'event:fall', 'description', '');
    valid(edited);
    expect(event(edited, 'event:fall')).toMatchObject({ description: '', origin: 'authored' });
    expect(event(edited, 'event:fall').evidence).toEqual(event(snapshot, 'event:fall').evidence);
    expect(edited.history.state).toBe('authored');
    expect(ids(edited)).not.toContain('event:fall');
    expect(snapshot).toEqual(before);
    expect(setRegionHistoryEventText(edited, 'event:fall', 'description', '')).toBe(edited);
    expect(setRegionHistoryEventText(edited, 'missing', 'description', '')).toBe(edited);
  });
  it('stales event dependents on authored text/date changes, and never clears an existing warning', () => {
    const snapshot = historyEditingFixture();
    event(snapshot, 'event:war').causedByEventIds = ['event:fall'];
    const text = setRegionHistoryEventText(
      snapshot,
      'event:old-founding',
      'description',
      'An authored founding.',
    );
    expect(event(text, 'event:old-founding').evidence.reason.status).toBe('current');
    expect(getHistoryEventsNeedingReview(text).map((e) => e.id)).toEqual([
      'event:fall',
      'event:war',
    ]);
    expect(ids(text)).toContain('event:local-founding');
    const dated = setRegionHistoryEventDate(snapshot, 'event:old-founding', 500);
    expect(getHistoryEventsNeedingReview(dated).map((e) => e.id)).toEqual([
      'event:fall',
      'event:war',
    ]);
    const renamed = setRealmText(snapshot, 0, 'name', 'Changed');
    const restored = setRealmText(renamed, 0, 'name', snapshot.realms[0].name);
    expect(event(restored, 'event:fall').evidence.reason.status).toBe('stale');
    expect(ids(restored)).not.toContain('event:fall');
  });
  it('renames actors immutably and stales direct/causal dependents without changing event origin', () => {
    const snapshot = historyEditingFixture();
    event(snapshot, 'event:war').causedByEventIds = ['event:fall'];
    const edited = setRegionHistoricalActorName(snapshot, 'actor:old', 'the Edited Realm');
    valid(edited);
    expect(edited.history.actors[0]).toMatchObject({
      name: 'the Edited Realm',
      origin: 'authored',
    });
    expect(getHistoryEventsNeedingReview(edited).map((e) => e.id)).toEqual([
      'event:old-founding',
      'event:fall',
      'event:war',
    ]);
    expect(edited.history.events.map((e) => e.description)).toEqual(
      snapshot.history.events.map((e) => e.description),
    );
    expect(edited.history.events.every((e) => e.origin === 'generated')).toBe(true);
    expect(setRegionHistoricalActorName(snapshot, 'actor:old', 'the Old Realm')).toBe(snapshot);
    expect(setRegionHistoricalActorName(snapshot, 'missing', 'name')).toBe(snapshot);
    expect(() => setRegionHistoricalActorName(snapshot, 'actor:old', ' ')).toThrow('nonempty');
  });
  it('edits/removes optional dates and rejects backwards or invalid chronology without mutation', () => {
    const snapshot = historyEditingFixture(),
      before = structuredClone(snapshot);
    const older = setRegionHistoryEventDate(snapshot, 'event:old-founding', 500);
    const dated = setRegionHistoryEventDate(older, 'event:fall', 100);
    valid(dated);
    expect(event(dated, 'event:fall').time).toEqual({ order: 3, yearsBeforePresent: 100 });
    expect(event(dated, 'event:fall').origin).toBe('authored');
    expect(() => setRegionHistoryEventDate(dated, 'event:fall', 600)).toThrow('backwards');
    for (const value of [-1, 0.5, Infinity, NaN])
      expect(() => setRegionHistoryEventDate(snapshot, 'event:fall', value)).toThrow('nonnegative');
    const removed = setRegionHistoryEventDate(dated, 'event:fall', null);
    valid(removed);
    expect(event(removed, 'event:fall').time).not.toHaveProperty('yearsBeforePresent');
    expect(setRegionHistoryEventDate(dated, 'event:fall', 100)).toBe(dated);
    expect(setRegionHistoryEventDate(snapshot, 'event:fall', null)).toBe(snapshot);
    expect(snapshot).toEqual(before);
  });
  it('reorders stable IDs using existing order slots and rejects broken lifecycle/date order', () => {
    const snapshot = historyEditingFixture(),
      ordered = snapshot.history.events.map((e) => e.id);
    const reordered = [...ordered];
    [reordered[2], reordered[4]] = [reordered[4], reordered[2]];
    const edited = reorderRegionHistoryEvents(snapshot, reordered);
    valid(edited);
    expect(ids(edited)).toEqual(reordered);
    expect(edited.history.events.map((e) => e.id)).toEqual(reordered);
    expect(snapshot.history.events.map((e) => e.id)).toEqual(ordered);
    expect(event(edited, 'event:war').origin).toBe('authored');
    expect(event(edited, 'event:fall').origin).toBe('generated');
    expect(reorderRegionHistoryEvents(snapshot, ordered)).toBe(snapshot);
    expect(() => reorderRegionHistoryEvents(snapshot, ordered.slice(1))).toThrow('exactly once');
    expect(() => reorderRegionHistoryEvents(snapshot, [...ordered].reverse())).toThrow();
    const dated = setRegionHistoryEventDate(
      setRegionHistoryEventDate(snapshot, 'event:town-founding', 200),
      'event:war',
      100,
    );
    expect(() => reorderRegionHistoryEvents(dated, reordered)).toThrow('backwards');
  });
});

describe('history removal impact and protection', () => {
  it('removes a selected event without deleting independent events sharing its current target', () => {
    const snapshot = historyEditingFixture(),
      impact = getHistoryEventRemovalImpact(snapshot, 'event:local-founding');
    expect(impact.eventIds).toEqual(['event:local-founding']);
    expect(impact.actorIds).toEqual([]);
    const edited = removeRegionHistoryEvent(snapshot, 'event:local-founding');
    valid(edited);
    expect(ids(edited)).toContain('event:fall');
    expect(ids(edited)).toContain('event:subordination');
    expect(edited.history.state).toBe('authored');
    expect(removeRegionHistoryEvent(snapshot, 'missing')).toBe(snapshot);
  });
  it('removes historical foundations and their lifecycle closure even when an explicit cause was omitted', () => {
    const snapshot = historyEditingFixture();
    event(snapshot, 'event:fall').causedByEventIds = [];
    valid(snapshot);
    const impact = getHistoryEventRemovalImpact(snapshot, 'event:old-founding');
    expect(impact.eventIds).toEqual(['event:old-founding', 'event:fall']);
    expect(impact.actorIds).toEqual(['actor:old']);
    const edited = removeRegionHistoryEvent(snapshot, 'event:old-founding');
    valid(edited);
    expect(edited.history.actors).toEqual([]);
    expect(ids(edited)).toHaveLength(4);
    expect(event(edited, 'event:war').time.order).toBe(4);
  });
  it('reports authored dependent/actor protection and permits explicit deletion of an authored target', () => {
    const snapshot = setRegionHistoryEventText(
      historyEditingFixture(),
      'event:fall',
      'description',
      'Authored',
    );
    expect(getHistoryEventRemovalImpact(snapshot, 'event:old-founding').protectedEventIds).toEqual([
      'event:fall',
    ]);
    expect(removeRegionHistoryEvent(snapshot, 'event:old-founding')).toBe(snapshot);
    const deleted = removeRegionHistoryEvent(snapshot, 'event:fall');
    valid(deleted);
    expect(ids(deleted)).not.toContain('event:fall');
    const actor = setRegionHistoricalActorName(
      historyEditingFixture(),
      'actor:old',
      'Authored actor',
    );
    expect(getHistoryEventRemovalImpact(actor, 'event:old-founding').protectedActorIds).toEqual([
      'actor:old',
    ]);
    expect(removeRegionHistoryEvent(actor, 'event:old-founding')).toBe(actor);
  });
  it('previews place and fact loss/review, blocks transitive authored dependencies and cleans generated work', () => {
    const snapshot = historyEditingFixture();
    expect(getRegionPlaceHistoryRemovalImpact(snapshot, 'settlements', 0)?.eventIds).toEqual([
      'event:town-founding',
    ]);
    expect(getRegionPlaceHistoryRemovalImpact(snapshot, 'organizations', 0)?.eventIds).toEqual([
      'event:war',
    ]);
    const resource = getRegionResourceHistoryRemovalImpact(
      snapshot,
      'resources',
      'resource:stone',
    )!;
    expect(resource.eventIds).toEqual([]);
    expect(resource.staleEventIds).toEqual(['event:town-founding']);
    const removed = removeRegionResourceFact(snapshot, 'resources', 'resource:stone');
    valid(removed);
    expect(event(removed, 'event:town-founding').evidence.reason.status).toBe('stale');
    const authored = setRegionHistoryEventText(
      snapshot,
      'event:town-founding',
      'description',
      'Authored founding',
    );
    expect(
      getRegionResourceHistoryRemovalImpact(authored, 'resources', 'resource:stone')!
        .protectedEventIds,
    ).toEqual(['event:town-founding']);
    expect(canRemoveRegionResourceFact(authored, 'resources', 'resource:stone')).toBe(false);
    expect(removeRegionResourceFact(authored, 'resources', 'resource:stone')).toBe(authored);
    expect(canRemoveRegionSettlement(authored, 0)).toBe(false);
    expect(removeRegionPlace(authored, 'settlements', 0)).toBe(authored);
    valid(removeRegionPlace(snapshot, 'settlements', 0));
  });
  it('includes nested observed relationships in source removal and remaps retained realm IDs', () => {
    const snapshot = historyEditingFixture();
    const reordered = retainRegionRealms(snapshot, [...snapshot.realmIds].reverse());
    expect(reordered.history).toBe(snapshot.history);
    expect(ids(reordered)).toEqual(ids(snapshot));
    const removed = retainRegionRealms(snapshot, ['realm:local']);
    valid(removed);
    expect(removed.realms[0].parent).toBe(-1);
    expect(
      removed.history.events.some((e) =>
        e.evidence.observations.some(
          (o) => o.kind === 'realm' && o.parentRealmId === 'realm:parent',
        ),
      ),
    ).toBe(false);
    const protectedSnapshot = setRegionHistoryEventText(
      snapshot,
      'event:subordination',
      'description',
      'Authored',
    );
    expect(() => retainRegionRealms(protectedSnapshot, ['realm:local'])).toThrow(
      'authored history',
    );
    expect(
      historyRemovalImpact(snapshot.history, {
        targets: [{ kind: 'organization', organizationId: 'organization:b' }],
      }).eventIds,
    ).toContain('event:war');
    expect(historyAfterSourceRemoval(snapshot.history, new Set())).toBe(snapshot.history);
  });
});

describe('history save and legacy compatibility', () => {
  it('keeps authored text, origin, observations and stale status through JSON and reopening', () => {
    const edited = setRegionHistoryEventText(
      setRegionHistoricalActorName(historyEditingFixture(), 'actor:old', 'Changed actor'),
      'event:fall',
      'description',
      '',
    );
    const json = JSON.parse(JSON.stringify(edited));
    valid(json);
    const reopened = toRegionSnapshot(regionFromSnapshot(json, new RNG('read')));
    expect(reopened).toEqual(edited);
    expect(ids(reopened)).not.toContain('event:fall');
  });
  it('migrates payload 25 losslessly without inventing historical actor name evidence', () => {
    const legacy = historyEditingFixture();
    legacy.history.version = 1;
    for (const e of legacy.history.events)
      e.evidence.observations = e.evidence.observations.filter((o) => o.kind !== 'historicalActor');
    valid(legacy);
    expect(REGION_PAYLOAD_VERSION).toBe(26);
    expect(migrateRegionSnapshot(legacy, 25)).toEqual({ ok: true, value: legacy });
    expect(getHistoryEventsNeedingReview(legacy).map((e) => e.id)).toEqual([
      'event:old-founding',
      'event:fall',
    ]);
    expect(ids(legacy)).toContain('event:war');
    expect(legacy.history.events.every((e) => e.evidence.reason.status === 'current')).toBe(true);
  });
});

it('records version-2 actor names without changing any seeded version-1 choice or wording', () => {
  const baseline = JSON.parse(readFileSync('test_fixtures/region_history_v1.json', 'utf8'));
  const input = JSON.parse(
    gunzipSync(readFileSync(`test_fixtures/${baseline.inputFixture}`)).toString(),
  )[baseline.inputRecord].snapshot;
  const migrated = migrateRegionSnapshot(input, 24);
  if (!migrated.ok) throw new Error(migrated.message);
  const result = generateRegionHistory(migrated.value, new RNG(baseline.seed));
  expect(result.version).toBe(2);
  const prior = {
    ...result,
    version: 1,
    events: result.events.map((e) => ({
      ...e,
      evidence: {
        ...e.evidence,
        observations: e.evidence.observations.filter((o) => o.kind !== 'historicalActor'),
      },
    })),
  };
  expect(prior).toEqual(baseline.history);
  expect(validateRegionSnapshot({ ...migrated.value, history: result }).ok).toBe(true);
});
