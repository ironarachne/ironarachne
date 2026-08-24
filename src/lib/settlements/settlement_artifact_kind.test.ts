import { describe, expect, it } from 'vitest';

import { readArtifactPayload, type AnyArtifactKindEntry } from '$lib/artifact_kinds';

import {
  migrateSettlementSnapshot,
  settlementArtifactKind,
  SETTLEMENT_ARTIFACT_KIND,
  SETTLEMENT_PAYLOAD_VERSION,
  validateSettlementSnapshot,
} from './settlement_artifact_kind';
import { toSettlementSnapshot } from './settlement_snapshot';
import { rollSettlement } from './settlement_roll';
import type { SettlementSnapshot } from './settlement_snapshot';

/** A stored payload, as anything reading one actually receives it. */
function storedSnapshot(seed: string, config = {}): Record<string, unknown> {
  const snapshot = toSettlementSnapshot(rollSettlement(seed, config).settlement);
  return JSON.parse(JSON.stringify(snapshot)) as Record<string, unknown>;
}

describe('validateSettlementSnapshot', () => {
  /**
   * The two shapes of the same kind. `enrich_settlement.ts` is opt-in four times over, so a
   * settlement rolled with enrichment and one rolled without are both current payloads, and a
   * validator that demanded either would reject half the settlements the generator makes.
   */
  it('accepts a settlement with every enrichment layer on', () => {
    const result = validateSettlementSnapshot(
      storedSnapshot('greyhaven', {
        size: 'large',
        includeTrade: true,
        includeProblems: true,
        includeOrganizations: true,
        includeNotables: true,
      }),
    );
    expect(result.ok).toBe(true);
  });

  it('accepts a settlement with no enrichment at all', () => {
    expect(validateSettlementSnapshot(storedSnapshot('greyhaven')).ok).toBe(true);
  });

  it('accepts each enrichment layer on its own', () => {
    for (const layer of [
      'includeTrade',
      'includeProblems',
      'includeOrganizations',
      'includeNotables',
    ]) {
      expect(
        validateSettlementSnapshot(storedSnapshot('greyhaven', { size: 'large', [layer]: true }))
          .ok,
      ).toBe(true);
    }
  });

  /**
   * Requirement 3.3, in the case that actually arrives: a payload written by a build whose
   * enrichment defaults were not this one's. A settlement carrying a layer this build would not
   * have rolled is still a settlement, and quarantining it would take away work nobody damaged.
   */
  it('accepts a settlement carrying layers a differently configured build wrote', () => {
    const payload = {
      ...storedSnapshot('greyhaven'),
      primaryExports: ['salt', 'timber'],
      acuteProblems: [{ kind: 'acute', summary: 'The mill has stopped.' }],
      creepingProblems: [
        { kind: 'creeping', summary: 'The river is silting.', detail: 'A season at a time.' },
      ],
    };
    expect(validateSettlementSnapshot(payload).ok).toBe(true);
  });

  it.each([
    ['a payload that is not an object', 'a settlement'],
    ['an array', []],
    ['null', null],
  ])('rejects %s', (_label, payload) => {
    const result = validateSettlementSnapshot(payload);
    expect(result.ok).toBe(false);
    expect(result.ok === false && result.reason).toBe('invalid-payload');
  });

  it.each([
    ['name', { name: 42 }],
    ['description', { description: null }],
    ['economicRole', { economicRole: undefined }],
    ['population', { population: 'many' }],
    ['prosperity', { prosperity: Number.NaN }],
    ['lawAndOrder', { lawAndOrder: null }],
    ['settlementTags', { settlementTags: 'river_trade' }],
    ['category', { category: 'city' }],
    ['category size band', { category: { name: 'city', sizeClass: 'large' } }],
    ['environment', { environment: {} }],
    ['primaryImports', { primaryImports: 'salt' }],
    ['acuteProblems', { acuteProblems: [{ kind: 'sudden', summary: 'The mill has stopped.' }] }],
    ['creepingProblems', { creepingProblems: [{ kind: 'creeping' }] }],
    ['organizations', { organizations: [{ name: 'The Ledger' }] }],
    ['importantPeople', { importantPeople: [{ roleId: 'mayor' }] }],
  ])('rejects a payload with a bad %s, saying which', (field, override) => {
    const result = validateSettlementSnapshot({ ...storedSnapshot('greyhaven'), ...override });
    expect(result.ok).toBe(false);
    expect(result.ok === false && result.message).toContain('settlement');
  });

  it('names the field it could not read, so quarantine has something to report', () => {
    const result = validateSettlementSnapshot({
      ...storedSnapshot('greyhaven'),
      settlementTags: 'river_trade',
    });
    expect(result.ok === false && result.message).toContain('settlementTags');
  });
});

describe('migrateSettlementSnapshot', () => {
  it('rejects, because version 1 is the only shape there has been', () => {
    const result = migrateSettlementSnapshot({}, 0);
    expect(result.ok).toBe(false);
    expect(result.ok === false && result.reason).toBe('unsupported-version');
  });
});

describe('settlementArtifactKind', () => {
  it('is registered under a stable, system-neutral id', () => {
    expect(settlementArtifactKind.kind).toBe(SETTLEMENT_ARTIFACT_KIND);
    expect(settlementArtifactKind.displayName).toBe('Settlement');
    expect(settlementArtifactKind.payloadVersion).toBe(SETTLEMENT_PAYLOAD_VERSION);
  });

  it('names an artifact after the settlement in it', () => {
    const snapshot = storedSnapshot('greyhaven') as unknown as SettlementSnapshot;
    expect(settlementArtifactKind.nameOf(snapshot)).toBe(snapshot.name);
  });

  it('loads a codec that round-trips through the registry', async () => {
    const codec = await settlementArtifactKind.loadCodec();
    const settlement = rollSettlement('greyhaven', {
      size: 'large',
      includeProblems: true,
      includeNotables: true,
    }).settlement;
    const stored = JSON.parse(JSON.stringify(codec.toSnapshot(settlement))) as unknown;
    expect(codec.fromSnapshot(stored as never, undefined as never)).toEqual(settlement);
  });

  it('reads a current-version payload and refuses one from a newer build', () => {
    const payload = storedSnapshot('greyhaven');
    // The erased form the registry hands every consumer back. `registerArtifactKind` is the one
    // place a typed entry becomes one; this is that same step taken by hand.
    const entry = settlementArtifactKind as unknown as AnyArtifactKindEntry;
    expect(readArtifactPayload(entry, payload, SETTLEMENT_PAYLOAD_VERSION).ok).toBe(true);
    const ahead = readArtifactPayload(entry, payload, SETTLEMENT_PAYLOAD_VERSION + 1);
    expect(ahead.ok).toBe(false);
    expect(ahead.ok === false && ahead.reason).toBe('unsupported-version');
  });
});
