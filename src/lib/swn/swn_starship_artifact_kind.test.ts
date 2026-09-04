import { RNG } from '@ironarachne/rng';
import { describe, expect, it } from 'vitest';

import {
  migrateSwnStarshipSnapshot,
  swnStarshipArtifactKind,
  swnStarshipName,
  validateSwnStarshipSnapshot,
  SWN_STARSHIP_ARTIFACT_KIND,
  SWN_STARSHIP_PAYLOAD_VERSION,
} from './swn_starship_artifact_kind';
import { rollSwnStarshipSnapshot } from './swn_starship_roll';
import type { SwnStarshipSnapshot } from './swn_starship_snapshot';

const SNAPSHOT = rollSwnStarshipSnapshot('kind-seed');

/**
 * The payload as it comes out of the store: plain JSON, with nothing typed about it.
 *
 * Typed as a record rather than `unknown` so the tests below can spread one field over it, which is
 * how each of them builds the payload it is actually about.
 */
function stored(snapshot: SwnStarshipSnapshot): Record<string, unknown> {
  return JSON.parse(JSON.stringify(snapshot)) as Record<string, unknown>;
}

describe('the kind', () => {
  it('is system-qualified, concept first', () => {
    // Decision 4 of docs/workshop.md: a hull's mass, power and hardpoint budget mean something only
    // under this ruleset. Not the same kind as `spooky-ship`, which decision 6 of
    // docs/readiness-objects.md settled.
    expect(SWN_STARSHIP_ARTIFACT_KIND).toBe('starship.swn');
    expect(swnStarshipArtifactKind.payloadVersion).toBe(SWN_STARSHIP_PAYLOAD_VERSION);
  });

  it('round-trips through its own codec', async () => {
    const codec = await swnStarshipArtifactKind.loadCodec();
    const ship = codec.fromSnapshot(
      stored(SNAPSHOT) as unknown as SwnStarshipSnapshot,
      new RNG('unused'),
    );

    expect(JSON.stringify(codec.toSnapshot(ship))).toBe(JSON.stringify(SNAPSHOT));
  });
});

describe('validateSwnStarshipSnapshot', () => {
  it('accepts what the roller produces', () => {
    const result = validateSwnStarshipSnapshot(stored(SNAPSHOT));

    expect(result.ok).toBe(true);
    expect(result.ok && result.value.name).toBe(SNAPSHOT.name);
    expect(result.ok && result.value.fittings.length).toBe(SNAPSHOT.fittings.length);
  });

  it('refuses something that is not an object', () => {
    expect(validateSwnStarshipSnapshot('a corvette').ok).toBe(false);
    expect(validateSwnStarshipSnapshot(null).ok).toBe(false);
  });

  it('refuses a payload with no identity', () => {
    const result = validateSwnStarshipSnapshot({ ...stored(SNAPSHOT), ownerTypeName: 7 });

    expect(result.ok).toBe(false);
    expect(result.ok === false && result.reason).toBe('invalid-payload');
  });

  it('refuses a payload with no hull to print a budget against', () => {
    // Reading the pools as zero would show a ship whose every fitting overflows a hull that does
    // not exist, which is worse than saying so.
    expect(validateSwnStarshipSnapshot({ ...stored(SNAPSHOT), hullType: undefined }).ok).toBe(
      false,
    );
    expect(
      validateSwnStarshipSnapshot({
        ...stored(SNAPSHOT),
        hullType: { name: 'free merchant', mass: 'lots' },
      }).ok,
    ).toBe(false);
  });

  it('reads a ship with nothing fitted as a ship with nothing fitted', () => {
    // Requirement 3.3: a well-defined empty result rather than a refusal. An unarmed merchant
    // stored with no weapons and a list hand-edited into nonsense both read back the same way.
    const result = validateSwnStarshipSnapshot({
      ...stored(SNAPSHOT),
      weapons: 'none',
      defenses: undefined,
      fittings: [],
    });

    expect(result.ok).toBe(true);
    expect(result.ok && result.value.weapons).toEqual([]);
    expect(result.ok && result.value.defenses).toEqual([]);
    expect(result.ok && result.value.fittings).toEqual([]);
  });

  it('drops an allocation row with no name rather than taking the ship with it', () => {
    const result = validateSwnStarshipSnapshot({
      ...stored(SNAPSHOT),
      fittings: [{ name: 'Cargo Space', effect: 'Holds things' }, { effect: 'nameless' }, 12],
    });

    expect(result.ok).toBe(true);
    expect(result.ok && result.value.fittings.map((row) => row.name)).toEqual(['Cargo Space']);
  });

  it('gives a missing number a zero rather than refusing the ship', () => {
    const result = validateSwnStarshipSnapshot({ ...stored(SNAPSHOT), tonsOfCargo: undefined });

    expect(result.ok).toBe(true);
    expect(result.ok && result.value.tonsOfCargo).toBe(0);
  });

  it('reads a ship stored with no drive back as one with an unnamed drive', () => {
    const result = validateSwnStarshipSnapshot({ ...stored(SNAPSHOT), drive: null });

    expect(result.ok).toBe(true);
    expect(result.ok && result.value.drive.name).toBe('');
  });
});

describe('migrateSwnStarshipSnapshot', () => {
  it('refuses every version, there having only ever been one', () => {
    // Requirement 7.3 with one payload version: the step that does not exist is asserted as not
    // existing, so the day a second shape lands there is a test to fill in rather than write.
    for (const from of [0, 2, 99]) {
      const result = migrateSwnStarshipSnapshot(stored(SNAPSHOT), from);

      expect(result.ok).toBe(false);
      expect(result.ok === false && result.reason).toBe('unsupported-version');
      expect(result.ok === false && result.message).toContain(`version ${from}`);
    }
  });
});

describe('swnStarshipName', () => {
  it('is the ship name the generator gave it', () => {
    expect(swnStarshipName(SNAPSHOT)).toBe(SNAPSHOT.name);
  });

  it('falls back to what the ship is when it has no name', () => {
    expect(swnStarshipName({ ...SNAPSHOT, name: '   ' })).toBe(
      `${SNAPSHOT.ownerTypeName} ${SNAPSHOT.hullType.name}`,
    );
  });

  it('has something to call a ship that is nothing in particular', () => {
    expect(
      swnStarshipName({
        ...SNAPSHOT,
        name: '',
        ownerTypeName: '',
        hullType: { ...SNAPSHOT.hullType, name: '' },
      }),
    ).toBe('SWN Starship');
  });
});
