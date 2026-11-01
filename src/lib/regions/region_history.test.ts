import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import { rollRegionSnapshot } from './region_roll';
import {
  migrateRegionSnapshot,
  validateRegionSnapshot,
  REGION_PAYLOAD_VERSION,
} from './region_artifact_kind';
import { toRegionSnapshot, type RegionSnapshot } from './region_snapshot';
import { regionFromSnapshot } from './region_rehydrate';
import {
  historyEvidenceCurrent,
  historyObservation,
  historyEvidenceKey,
} from './region_history_evidence';
import { regionHistoryError } from './region_history_validation';
import {
  initialRegionRealmIds,
  nextRegionRealmId,
  regionRealmIdentityError,
  retainRegionRealms,
} from './region_realm_identity';
import type { HistoryEvent, HistoryReference, RegionHistory } from './region_history_types';

const fixtures: {
  seed: string;
  config: { affiliation: 'affiliated' | 'unaffiliated'; generateNeighbors: boolean };
  snapshot: RegionSnapshot;
}[] = JSON.parse(gunzipSync(readFileSync('test_fixtures/region_history_481.json.gz')).toString());
function migrated(snapshot = fixtures[0].snapshot) {
  const result = migrateRegionSnapshot(structuredClone(snapshot), 24);
  if (!result.ok) throw new Error(result.message);
  return result.value;
}
const base = migrated();
const realm: HistoryReference = { kind: 'realm', realmId: base.realmIds[0] };
function founding(snapshot = base, target = realm): HistoryEvent {
  const observation = historyObservation(snapshot, target);
  if (!observation) throw new Error('Fixture lacks observation');
  return {
    id: 'event:one',
    name: 'Establishment',
    description: 'The realm was established.',
    origin: 'generated',
    time: { order: 0 },
    outcome: { kind: 'founding', founded: target },
    participants: [target],
    consequences: [
      {
        kind: 'existence',
        target: target as Exclude<HistoryReference, { kind: 'historicalActor' }>,
      },
    ],
    causedByEventIds: [],
    evidence: {
      reason: { ruleId: 'fantasy:region:history:founding:v1', status: 'current', sources: [] },
      observations: [observation],
    },
  };
}
const history = (...events: HistoryEvent[]): RegionHistory => ({
  version: 1,
  state: 'generated',
  actors: [],
  events,
});

// The baseline is persisted JSON captured on macOS/Node 22; CI runs Linux/Node 24.
// Math-library rounding can differ by a few machine epsilons. Normalize JSON-only
// omissions first, then tolerate that roundoff without changing strings, integers or order.
function portableBaseline(actual: unknown, expected: unknown): unknown {
  const close = (a: number, b: number, epsilons = 4) =>
    Number.isFinite(a) &&
    Number.isFinite(b) &&
    Math.abs(a - b) <= epsilons * Number.EPSILON * Math.max(1, Math.abs(a), Math.abs(b));
  // River widths accumulate Math.hypot and interpolation roundoff; Node 24
  // differs from the baseline by about five epsilons at unit scale.
  const align = (a: unknown, b: unknown, field = ''): unknown => {
    if (typeof a === 'number' && typeof b === 'number')
      return !Number.isInteger(b) && close(a, b, field === 'waterWidth' ? 8 : 4) ? b : a;
    if (Array.isArray(a))
      return a.map((entry, index) => align(entry, Array.isArray(b) ? b[index] : undefined));
    if (a === null || typeof a !== 'object' || b === null || typeof b !== 'object') return a;
    const observed = a as Record<string, unknown>,
      baseline = b as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(observed).map(([key, value]) => {
        if (
          key === 'observedValue' &&
          observed.kind === 'map-node' &&
          baseline.kind === 'map-node' &&
          observed.property === baseline.property &&
          ['elevation', 'temperature', 'moisture'].includes(String(observed.property)) &&
          typeof value === 'string' &&
          typeof baseline[key] === 'string' &&
          value.trim() &&
          baseline[key].trim() &&
          close(Number(value), Number(baseline[key]))
        )
          return [key, baseline[key]];
        return [key, align(value, baseline[key], key)];
      }),
    );
  };
  return align(JSON.parse(JSON.stringify(actual)), expected);
}

describe('history foundation persistence and upstream compatibility', () => {
  it('limits portable baseline normalization to serialization and numerical roundoff', () => {
    const baseline = {
      coordinate: 1.4266218411561222,
      source: { kind: 'map-node', property: 'elevation', observedValue: '1.4266218411561222' },
      name: 'Saved',
      count: 12,
      ids: [1, 2],
    };
    const rounded = {
      ...baseline,
      coordinate: 1.426621841156122,
      source: { ...baseline.source, observedValue: '1.426621841156122' },
      omitted: undefined,
    };
    expect(portableBaseline(rounded, baseline)).toEqual(baseline);
    for (const changed of [
      { ...rounded, coordinate: 1.426621841166122 },
      { ...rounded, name: 'Changed' },
      { ...rounded, count: 13 },
      { ...rounded, count: 12 + Number.EPSILON * 12 },
      { ...rounded, ids: [2, 1] },
      { ...rounded, source: { ...rounded.source, observedValue: '1.426621841166122' } },
      { ...rounded, source: { ...rounded.source, property: 'biomeId' } },
    ])
      expect(portableBaseline(changed, baseline)).not.toEqual(baseline);
  });
  it('handles the observed Node 24 river-width rounding while rejecting larger changes', () => {
    for (const [actual, expected] of [
      [0.05388742314701832, 0.05388742314701937],
      [0.05274520091527091, 0.05274520091527197],
    ]) {
      expect(portableBaseline({ waterWidth: actual }, { waterWidth: expected })).toEqual({
        waterWidth: expected,
      });
      expect(
        portableBaseline({ waterWidth: actual + 1e-12 }, { waterWidth: expected }),
      ).not.toEqual({ waterWidth: expected });
    }
  });
  it('uses payload 25 without changing facts or gazetteer schemas', () => {
    expect(REGION_PAYLOAD_VERSION).toBe(25);
    expect(base.facts.version).toBe(12);
    expect(base.gazetteer?.version).toBe(6);
  });
  for (const fixture of fixtures)
    it(`preserves every old seeded field: ${fixture.seed}`, () => {
      const generated = rollRegionSnapshot(fixture.seed, fixture.config);
      const { realmIds, history: stored, ...prior } = generated;
      expect(portableBaseline(prior, fixture.snapshot)).toEqual(fixture.snapshot);
      // Same-runtime reproducibility still requires exact values, with no tolerance.
      expect(rollRegionSnapshot(fixture.seed, fixture.config)).toEqual(generated);
      expect(realmIds).toEqual(initialRegionRealmIds(generated.realms.length));
      expect(stored.state).toBe('generated');
      expect(stored.events.length).toBeLessThanOrEqual(6);
      expect(validateRegionSnapshot(generated).ok).toBe(true);
    });
  it('migrates v24 without inferring history or modifying old fields', () => {
    const { realmIds, history: stored, ...prior } = base;
    expect(prior).toEqual(fixtures[0].snapshot);
    expect(stored.state).toBe('unrecorded');
    expect(realmIds).toHaveLength(base.realms.length);
    expect(validateRegionSnapshot(fixtures[0].snapshot).ok).toBe(false);
  });
  it.each(['current', 'stale'] as const)(
    'round trips %s history and authored blanks without generation',
    (status) => {
      const snapshot = structuredClone(base);
      const event = founding(snapshot);
      event.origin = 'authored';
      event.description = '';
      event.evidence.reason.status = status;
      snapshot.history = { ...history(event), state: 'authored' };
      const json = JSON.parse(JSON.stringify(snapshot));
      expect(validateRegionSnapshot(json).ok).toBe(true);
      expect(toRegionSnapshot(regionFromSnapshot(json, new RNG('unrelated')))).toEqual(snapshot);
    },
  );
});

describe('stable realm identities', () => {
  it('remaps seat, parent and claims atomically on reorder', () => {
    const snapshot = structuredClone(base);
    snapshot.realms[0].claims = [
      { claimantId: 1, claimantName: snapshot.realms[1].name, status: 'unpressed' },
    ];
    const ids = [...snapshot.realmIds].reverse();
    const before = structuredClone(snapshot);
    const reordered = retainRegionRealms(snapshot, ids);
    expect(reordered.realmIds[reordered.mainRealm!]).toBe(snapshot.realmIds[snapshot.mainRealm!]);
    const original = reordered.realms[ids.indexOf(snapshot.realmIds[0])];
    expect(ids[original.claims[0].claimantId]).toBe(snapshot.realmIds[1]);
    if (snapshot.realms[0].parent !== -1)
      expect(ids[original.parent]).toBe(snapshot.realmIds[snapshot.realms[0].parent]);
    expect(snapshot).toEqual(before);
    expect(validateRegionSnapshot(reordered).ok).toBe(true);
    expect(historyObservation(reordered, realm)).toEqual(historyObservation(snapshot, realm));
  });
  it('removes a non-seat realm and remaps or drops positional references', () => {
    const snapshot = structuredClone(base);
    const remove = snapshot.realms.length - 1;
    snapshot.realms[0].parent = remove;
    snapshot.realms[0].claims = [
      { claimantId: remove, claimantName: 'Removed', status: 'unpressed' },
    ];
    const result = retainRegionRealms(
      snapshot,
      snapshot.realmIds.filter((_, i) => i !== remove),
    );
    expect(result.realms[0].parent).toBe(-1);
    expect(result.realms[0].claims).toEqual([]);
    expect(regionRealmIdentityError(result)).toBeNull();
  });
  it('protects the seat, history and malformed identity requests', () => {
    expect(() => retainRegionRealms(base, [])).toThrow('seat');
    expect(() => retainRegionRealms(base, ['missing'])).toThrow('unique existing');
    expect(() => retainRegionRealms(base, [base.realmIds[0], base.realmIds[0]])).toThrow();
    const snapshot = structuredClone(base);
    snapshot.history = history(founding());
    expect(() => retainRegionRealms(snapshot, [])).toThrow('history');
    snapshot.realmIds = [];
    expect(() => retainRegionRealms(snapshot, [])).toThrow('unique local IDs');
  });
  it('rejects duplicate identities and malformed claim/parent indexes, preserving unknown status text', () => {
    const snapshot = structuredClone(base);
    snapshot.realmIds[1] = snapshot.realmIds[0];
    expect(regionRealmIdentityError(snapshot)).not.toBeNull();
    snapshot.realmIds = [...base.realmIds];
    snapshot.realms[0].parent = 999;
    expect(regionRealmIdentityError(snapshot)).not.toBeNull();
    snapshot.realms[0].parent = -1;
    snapshot.realms[0].claims = [{ claimantId: 999, claimantName: 'X', status: 'unpressed' }];
    expect(regionRealmIdentityError(snapshot)).not.toBeNull();
    snapshot.realms[0].claims[0].claimantId = 0;
    snapshot.realms[0].claims[0].status = 'future-status';
    expect(regionRealmIdentityError(snapshot)).toBeNull();
    expect(historyObservation(snapshot, realm)).toBeNull();
    expect(nextRegionRealmId(['realm:0', 'realm:2'])).toBe('realm:1');
    expect(nextRegionRealmId([])).toBe('realm:0');
  });
});

describe('saved history evidence projections', () => {
  it('detects name, claim, tile, settlement and relationship changes without rewriting evidence', () => {
    const snapshot = structuredClone(base);
    const e = founding(snapshot).evidence;
    expect(historyEvidenceCurrent(snapshot, e)).toBe(true);
    snapshot.realms[0].name = 'Changed';
    expect(historyEvidenceCurrent(snapshot, e)).toBe(false);
    const settlement = historyObservation(base, {
      kind: 'settlement',
      settlementId: base.settlements[0].id,
    })!;
    const se = { ...e, observations: [settlement] };
    expect(historyEvidenceCurrent(base, se)).toBe(true);
    snapshot.settlements[0].snapshot.mapNodeId = -1;
    expect(historyEvidenceCurrent(snapshot, se)).toBe(false);
    const org = base.organizations[0];
    if (!org) throw new Error('Expected fixture organization');
    const observation = historyObservation(base, { kind: 'organization', organizationId: org.id })!;
    const oe = { ...e, observations: [observation] };
    expect(historyEvidenceCurrent(base, oe)).toBe(true);
    snapshot.organizations[0].relationships.push({
      kind: 'rival',
      relatedOrganizationId: 'new-id',
    });
    expect(historyEvidenceCurrent(snapshot, oe)).toBe(false);
    expect(historyEvidenceCurrent(base, { ...e, reason: { ...e.reason, status: 'stale' } })).toBe(
      false,
    );
    expect(historyEvidenceCurrent(base, { ...e, observations: [] })).toBe(false);
  });
  it('checks transitive fact observations, preserving review state outside canonical JSON', () => {
    const snapshot = structuredClone(base);
    const fact = snapshot.facts.areas[0];
    const obs = historyObservation(snapshot, { kind: 'fact', factId: fact.id })!;
    const evidence = { ...founding().evidence, observations: [obs] };
    expect(historyEvidenceCurrent(snapshot, evidence)).toBe(true);
    fact.reason!.status = 'stale';
    expect(historyObservation(snapshot, { kind: 'fact', factId: fact.id })).toEqual(obs);
    expect(historyEvidenceCurrent(snapshot, evidence)).toBe(false);
    expect(historyEvidenceKey({ areaIds: ['b', 'a'] })).toBe(
      historyEvidenceKey({ areaIds: ['a', 'b'] }),
    );
    expect(historyObservation(snapshot, { kind: 'historicalActor', actorId: 'past' })).toBeNull();
    expect(historyObservation(snapshot, { kind: 'realm', realmId: 'missing' })).toBeNull();
    expect(historyObservation(snapshot, { kind: 'fact', factId: 'missing' })).toBeNull();
    expect(
      historyObservation(snapshot, { kind: 'settlement', settlementId: 'missing' }),
    ).toBeNull();
    expect(
      historyObservation(snapshot, { kind: 'organization', organizationId: 'missing' }),
    ).toBeNull();
  });
  it('projects actual node identities from legacy realm tile coordinates, rejecting unmapped tiles', () => {
    const snapshot = structuredClone(base);
    snapshot.realms[0].tiles = [snapshot.map.nodes[0].center];
    const obs = historyObservation(snapshot, realm);
    expect(obs?.kind === 'realm' && obs.tiles).toEqual([snapshot.map.nodes[0].id]);
    snapshot.realms[0].tiles = [{ x: -999, y: -999 }];
    expect(historyObservation(snapshot, realm)).toBeNull();
  });
});

describe('history schema, chronology and lifecycle', () => {
  it('accepts a supported founding and does not enforce observation freshness on storage', () => {
    const snapshot = { ...base, history: history(founding()) };
    expect(regionHistoryError(snapshot.history, snapshot)).toBeNull();
    const changed = structuredClone(snapshot);
    changed.realms[0].name = 'Renamed';
    expect(regionHistoryError(changed.history, changed)).toBeNull();
    expect(historyEvidenceCurrent(changed, changed.history.events[0].evidence)).toBe(false);
  });
  it.each([
    ['duplicate event', (h: RegionHistory) => h.events.push(structuredClone(h.events[0]))],
    [
      'invalid order',
      (h: RegionHistory) => {
        h.events[0].time.order = -1;
      },
    ],
    [
      'negative date',
      (h: RegionHistory) => {
        h.events[0].time.yearsBeforePresent = -1;
      },
    ],
    [
      'unresolved participant',
      (h: RegionHistory) => {
        h.events[0].participants = [{ kind: 'realm', realmId: 'missing' }];
      },
    ],
    [
      'self cause',
      (h: RegionHistory) => {
        h.events[0].causedByEventIds = ['event:one'];
      },
    ],
    [
      'missing cause',
      (h: RegionHistory) => {
        h.events[0].causedByEventIds = ['missing'];
      },
    ],
    [
      'missing observation',
      (h: RegionHistory) => {
        h.events[0].evidence.observations = [];
      },
    ],
    [
      'wrong consequence',
      (h: RegionHistory) => {
        h.events[0].consequences[0].kind = 'rivalry';
      },
    ],
    [
      'missing source',
      (h: RegionHistory) => {
        h.events[0].evidence.reason.sources = [{ kind: 'fact', factId: 'missing' }];
      },
    ],
    [
      'unrecorded content',
      (h: RegionHistory) => {
        h.state = 'unrecorded';
      },
    ],
    [
      'unused actor',
      (h: RegionHistory) => {
        h.actors = [{ id: 'past', name: 'Old realm', kind: 'realm', origin: 'generated' }];
      },
    ],
  ])('rejects %s', (_, edit) => {
    const h = history(founding());
    edit(h);
    expect(regionHistoryError(h, base)).not.toBeNull();
  });
  it('rejects future variants and malformed observations without throwing', () => {
    for (const value of [
      null,
      {},
      { ...history(), version: 2 },
      { ...history(), actors: [null] },
      { ...history(), events: [null] },
    ])
      expect(regionHistoryError(value, base)).not.toBeNull();
    const h = history(founding());
    for (const observation of [
      null,
      {},
      { kind: 'fact', factId: base.facts.areas[0].id, observed: 'bad-json' },
      {
        kind: 'realm',
        realmId: base.realmIds[0],
        name: 'X',
        tiles: [],
        claims: [],
        parentRealmId: 'missing',
      },
    ]) {
      h.events[0].evidence.observations = [observation as never];
      expect(regionHistoryError(h, base)).not.toBeNull();
    }
    h.events[0] = founding();
    h.events[0].outcome = { kind: 'unknown' } as never;
    expect(regionHistoryError(h, base)).toContain('unknown outcome');
  });
  it('accepts a predecessor founding/fall bundle, rejecting use after fall and before founding', () => {
    const actor = {
      id: 'past:realm',
      name: 'Earlier realm',
      kind: 'realm' as const,
      origin: 'generated' as const,
    };
    const ref: HistoryReference = { kind: 'historicalActor', actorId: actor.id };
    const first = founding();
    first.outcome = { kind: 'founding', founded: ref };
    first.participants = [ref];
    const fall = founding();
    fall.id = 'event:fall';
    fall.time = { order: 1 };
    fall.outcome = {
      kind: 'fall',
      historicalRealmId: actor.id,
      successorRealmId: base.realmIds[0],
    };
    fall.participants = [ref, realm];
    fall.consequences[0].kind = 'claim-continuity';
    fall.causedByEventIds = [first.id];
    const h = { ...history(first, fall), actors: [actor] };
    expect(regionHistoryError(h, base)).toBeNull();
    first.time.order = 2;
    fall.causedByEventIds = [];
    expect(regionHistoryError(h, base)).toContain('before founding');
    first.time.order = 0;
    const later = structuredClone(fall);
    later.id = 'later';
    later.time.order = 3;
    h.events.push(later);
    expect(regionHistoryError(h, base)).toContain('after dissolution');
  });
  it('rejects institutional participation before its recorded founding', () => {
    const first = founding();
    first.time.order = 2;
    const second = founding();
    second.id = 'earlier-action';
    second.time.order = 0;
    second.outcome = {
      kind: 'incorporation',
      predecessor: realm,
      successorRealmId: base.realmIds[1],
    };
    second.participants.push({ kind: 'realm', realmId: base.realmIds[1] });
    second.evidence.observations.push(
      historyObservation(base, { kind: 'realm', realmId: base.realmIds[1] })!,
    );
    second.consequences[0].kind = 'subordination';
    expect(regionHistoryError(history(first, second), base)).toContain('before founding');
  });
  it('checks dated ordering and unique founding subjects', () => {
    const first = founding(),
      second = founding();
    second.id = 'second';
    second.time = { order: 1, yearsBeforePresent: 100 };
    second.outcome = {
      kind: 'incorporation',
      predecessor: realm,
      successorRealmId: base.realmIds[1],
    };
    second.participants.push({ kind: 'realm', realmId: base.realmIds[1] });
    second.evidence.observations.push(
      historyObservation(base, { kind: 'realm', realmId: base.realmIds[1] })!,
    );
    second.consequences[0].kind = 'subordination';
    first.time.yearsBeforePresent = 50;
    const h = history(first, second);
    expect(regionHistoryError(h, base)).toContain('dates run backwards');
    first.time.yearsBeforePresent = 150;
    expect(regionHistoryError(h, base)).toBeNull();
    second.outcome = first.outcome;
    second.consequences[0].kind = 'existence';
    expect(regionHistoryError(h, base)).toContain('duplicate foundings');
  });
});

describe('history outcome compatibility', () => {
  it('accepts an institutional rivalry war only with its saved relationship', () => {
    const snapshot = structuredClone(base);
    const a = snapshot.organizations[0],
      b = structuredClone(a);
    b.id = 'org:other';
    b.name = 'Other';
    snapshot.organizations.push(b);
    a.relationships = [{ kind: 'rival', relatedOrganizationId: b.id }];
    b.relationships = [];
    const refs: HistoryReference[] = [a, b].map((o) => ({
      kind: 'organization',
      organizationId: o.id,
    }));
    const event = founding(snapshot, refs[0]);
    event.outcome = { kind: 'war', sides: refs, resolution: 'rivalry-persists' };
    event.participants = refs;
    event.consequences[0].kind = 'rivalry';
    event.evidence.observations = refs.map((ref) => historyObservation(snapshot, ref)!);
    expect(regionHistoryError(history(event), snapshot)).toBeNull();
    a.relationships = [];
    expect(historyEvidenceCurrent(snapshot, event.evidence)).toBe(false);
    event.evidence.observations = refs.map((ref) => historyObservation(snapshot, ref)!);
    expect(regionHistoryError(history(event), snapshot)).toContain('saved rivalry');
    event.outcome.sides = [refs[0], refs[0]];
    expect(regionHistoryError(history(event), snapshot)).toContain('invalid sides');
  });
  it('accepts claim continuity only from recognized saved realm claims', () => {
    const snapshot = structuredClone(base);
    snapshot.realms[0].claims = [
      { claimantId: 1, claimantName: snapshot.realms[1].name, status: 'unpressed' },
    ];
    const refs: HistoryReference[] = snapshot.realmIds
      .slice(0, 2)
      .map((realmId) => ({ kind: 'realm', realmId }));
    const e = founding(snapshot, refs[0]);
    e.outcome = { kind: 'war', sides: refs, resolution: 'claim-persists' };
    e.participants = refs;
    e.consequences[0].kind = 'claim-continuity';
    e.evidence.observations = refs.map((ref) => historyObservation(snapshot, ref)!);
    expect(regionHistoryError(history(e), snapshot)).toBeNull();
    const obs = e.evidence.observations[0];
    if (obs.kind !== 'realm') throw new Error('Expected realm');
    obs.claims[0].status = 'unknown';
    expect(regionHistoryError(history(e), snapshot)).toContain('recognized saved claim');
    obs.claims = [];
    expect(regionHistoryError(history(e), snapshot)).not.toBeNull();
  });
  it('rejects unrelated founding and succession consequences, and disabled evidence families', () => {
    const e = founding();
    e.consequences[0].target = { kind: 'realm', realmId: base.realmIds[1] };
    expect(regionHistoryError(history(e), base)).toContain('positive observation');
    e.evidence.observations.push(historyObservation(base, e.consequences[0].target)!);
    expect(regionHistoryError(history(e), base)).toContain('founded subject');
    e.outcome = { kind: 'incorporation', predecessor: realm, successorRealmId: base.realmIds[0] };
    expect(regionHistoryError(history(e), base)).toContain('invalid realms');
    const damage = base.facts.areas[0];
    const ref: HistoryReference = { kind: 'fact', factId: damage.id };
    const disaster = founding(base, ref);
    disaster.outcome = { kind: 'disaster', damageFactId: damage.id, disasterKind: 'flood' };
    disaster.consequences[0].kind = 'recovery';
    expect(regionHistoryError(history(disaster), base)).toContain(
      'approved typed evidence adapter',
    );
    disaster.outcome = {
      kind: 'migration',
      movementFactId: damage.id,
      communityId: 'past:community',
    };
    disaster.participants.push({ kind: 'historicalActor', actorId: 'past:community' });
    disaster.consequences[0].kind = 'population-origin';
    const h = history(disaster);
    h.actors = [{ id: 'past:community', name: 'People', kind: 'community', origin: 'authored' }];
    expect(regionHistoryError(h, base)).toContain('approved typed evidence adapter');
  });
});
