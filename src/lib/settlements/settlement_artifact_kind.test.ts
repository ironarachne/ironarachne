import { describe, expect, it } from 'vitest';

import { readArtifactPayload, type AnyArtifactKindEntry } from '$lib/artifact_kinds';
import { sentientSpeciesList } from '$lib/species_sentients';

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

function withoutMechanics(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(withoutMechanics);
  if (typeof value !== 'object' || value === null) return value;
  return Object.fromEntries(
    Object.entries(value).flatMap(([key, entry]) =>
      key === 'mechanics' ? [] : [[key, withoutMechanics(entry)]],
    ),
  );
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

/**
 * A settlement as version 1 wrote it: every notable's and every organization member's character
 * carrying the whole `Species` record that version 2 stores as a name.
 *
 * Built by putting the species back rather than by pasting a captured payload, so the fixture stays
 * a *real* settlement of the shape the site actually shipped — every other field is exactly what
 * the generator produces — instead of a hand-typed approximation that goes stale.
 */
function version1Snapshot(seed: string): Record<string, unknown> {
  const snapshot = withoutMechanics(
    storedSnapshot(seed, {
      size: 'large',
      includeOrganizations: true,
      includeNotables: true,
    }),
  ) as Record<string, unknown>;

  const embed = (value: unknown): unknown => {
    const character = value as Record<string, unknown>;
    const { speciesName, ...rest } = character;
    const species = sentientSpeciesList.find((entry) => entry.name === speciesName);
    return { ...rest, species: JSON.parse(JSON.stringify(species)) as unknown };
  };

  return {
    ...snapshot,
    importantPeople: (snapshot.importantPeople as Record<string, unknown>[]).map((notable) => ({
      ...notable,
      character: embed(notable.character),
    })),
    organizations: (snapshot.organizations as Record<string, unknown>[]).map((organization) => ({
      ...organization,
      leader: embed(organization.leader),
      notableMembers: (organization.notableMembers as unknown[]).map(embed),
    })),
  };
}

describe('migrateSettlementSnapshot', () => {
  it('brings a version 2 settlement forward with migrated actor mechanics', () => {
    const legacy = withoutMechanics(
      storedSnapshot('greyhaven', {
        size: 'large',
        includeOrganizations: true,
        includeNotables: true,
      }),
    );
    const result = migrateSettlementSnapshot(legacy, 2);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.importantPeople?.[0].character.mechanics.variants[0]).toMatchObject({
        subject: 'actor',
        origin: 'migrated',
      });
      expect(result.value.organizations?.[0].leader.mechanics.variants[0]).toMatchObject({
        subject: 'actor',
        origin: 'migrated',
      });
    }
  });

  /**
   * Requirement 7.3, and the site's first real payload step. Every settlement saved before this
   * release keeps every notable it had.
   */
  it('brings a version 1 settlement’s notables forward, species and all', () => {
    const result = migrateSettlementSnapshot(version1Snapshot('greyhaven'), 1);

    expect(result.ok).toBe(true);
    const notables = result.ok ? (result.value.importantPeople ?? []) : [];
    expect(notables.length).toBeGreaterThan(0);
    for (const notable of notables) {
      expect(notable.character.speciesName).not.toBe('');
      expect(notable.character).not.toHaveProperty('species');
      // The species is resolvable, which is what makes the migrated character a whole one again.
      expect(sentientSpeciesList.some((s) => s.name === notable.character.speciesName)).toBe(true);
    }
  });

  it('brings an organization’s leader and members forward too', () => {
    const result = migrateSettlementSnapshot(version1Snapshot('greyhaven'), 1);

    expect(result.ok).toBe(true);
    const organizations = result.ok ? (result.value.organizations ?? []) : [];
    expect(organizations.length).toBeGreaterThan(0);
    for (const organization of organizations) {
      expect(organization.leader.speciesName).not.toBe('');
      for (const member of organization.notableMembers) {
        expect(member.speciesName).not.toBe('');
      }
    }
  });

  it('leaves the rest of the settlement exactly as it was', () => {
    const before = version1Snapshot('greyhaven');
    const result = migrateSettlementSnapshot(before, 1);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.name).toBe(before.name);
      expect(result.value.population).toBe(before.population);
      expect(result.value.acuteProblems).toEqual(before.acuteProblems);
    }
  });

  /**
   * Enrichment is opt-in four times over, so a version 1 settlement may have neither notables nor
   * organizations. One that has neither migrates by having nothing to do.
   */
  it('migrates an unenriched settlement by leaving it alone', () => {
    const plain = storedSnapshot('greyhaven');
    const result = migrateSettlementSnapshot(plain, 1);

    expect(result.ok).toBe(true);
    expect(result.ok && result.value.name).toBe(plain.name);
  });

  it('does not lose a settlement over one malformed notable', () => {
    const broken = version1Snapshot('greyhaven');
    const notables = broken.importantPeople as Record<string, unknown>[];
    notables[0] = {
      ...notables[0],
      character: { ...(notables[0].character as Record<string, unknown>), species: 'not a record' },
    };
    const result = migrateSettlementSnapshot(broken, 1);

    expect(result.ok).toBe(true);
    expect(result.ok && result.value.importantPeople?.[0]?.character.speciesName).toBe('');
  });

  it('rejects a version it has no step from', () => {
    const result = migrateSettlementSnapshot({}, 0);
    expect(result.ok).toBe(false);
    expect(result.ok === false && result.reason).toBe('unsupported-version');
  });

  it('rejects something that is not a settlement at all', () => {
    expect(migrateSettlementSnapshot('a town, honestly', 1).ok).toBe(false);
  });

  /** The registry's own path: an older payload reaches `migrate` and comes back current. */
  it('is reached by the registry when a stored payload is older than this build', () => {
    const entry = settlementArtifactKind as unknown as AnyArtifactKindEntry;

    expect(readArtifactPayload(entry, version1Snapshot('greyhaven'), 1).ok).toBe(true);
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
