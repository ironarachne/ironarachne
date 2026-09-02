import { describe, expect, it } from 'vitest';

import {
  PLANET_ARTIFACT_KIND,
  PLANET_PAYLOAD_VERSION,
  migratePlanetSnapshot,
  planetArtifactKind,
  validatePlanetSnapshot,
} from './planet_artifact_kind';
import { rollPlanet } from './planet_roll';
import { toPlanetSnapshot, type PlanetSnapshot } from './planet_snapshot';

function inhabitedSnapshot(): PlanetSnapshot {
  for (let index = 0; index < 60; index++) {
    const roll = rollPlanet(`kind-${index}`);
    if (roll.civilization !== undefined && roll.moons.length > 0) {
      return toPlanetSnapshot(roll);
    }
  }
  throw new Error('no seed in range produced an inhabited planet with moons');
}

const snapshot = inhabitedSnapshot();

/** A copy of the good payload with one part replaced, for the rejection cases. */
function broken(changes: Record<string, unknown>): unknown {
  return { ...(snapshot as unknown as Record<string, unknown>), ...changes };
}

describe('the planet artifact kind', () => {
  it('is registered under a stable, unqualified id', () => {
    expect(planetArtifactKind.kind).toEqual(PLANET_ARTIFACT_KIND);
    expect(PLANET_ARTIFACT_KIND).toEqual('planet');
  });

  it('declares the payload version it writes', () => {
    expect(planetArtifactKind.payloadVersion).toEqual(PLANET_PAYLOAD_VERSION);
  });

  it('names a saved planet by its own name', () => {
    expect(planetArtifactKind.nameOf(snapshot)).toEqual(snapshot.name);
  });

  it('falls back to the kind when the name has been emptied', () => {
    expect(planetArtifactKind.nameOf({ ...snapshot, name: '  ' })).toEqual('Planet');
  });

  it('round-trips through its own codec', async () => {
    const codec = await planetArtifactKind.loadCodec();
    expect(codec.toSnapshot(codec.fromSnapshot(snapshot, undefined as never))).toEqual(snapshot);
  });
});

describe('validating a stored planet', () => {
  it('accepts what the generator wrote', () => {
    expect(validatePlanetSnapshot(snapshot).ok).toBe(true);
  });

  it('accepts a planet with no moons and nobody on it', () => {
    const { civilization: _civilization, ...rest } = snapshot;
    expect(validatePlanetSnapshot({ ...rest, moons: [] }).ok).toBe(true);
  });

  it('rejects something that is not an object at all', () => {
    expect(validatePlanetSnapshot('a planet')).toMatchObject({
      ok: false,
      reason: 'invalid-payload',
    });
  });

  it('rejects a planet with no classification', () => {
    expect(validatePlanetSnapshot(broken({ classification: undefined }))).toMatchObject({
      ok: false,
    });
  });

  it('rejects a planet that does not say whether it has an atmosphere', () => {
    expect(validatePlanetSnapshot(broken({ has_atmosphere: 'thin' }))).toMatchObject({ ok: false });
  });

  it('rejects a measurement that is not a finite number', () => {
    // NaN is what an emptied field in a hand-edited payload produces, it passes `typeof number`,
    // and it propagates silently through every figure derived from it.
    expect(validatePlanetSnapshot(broken({ mass: Number.NaN }))).toMatchObject({ ok: false });
    expect(validatePlanetSnapshot(broken({ gravity: 'heavy' }))).toMatchObject({ ok: false });
  });

  it('rejects moons that are not a list', () => {
    expect(validatePlanetSnapshot(broken({ moons: 'two' }))).toMatchObject({ ok: false });
  });

  it('rejects a moon missing a measurement', () => {
    const moons = snapshot.moons.map((moon, index) =>
      index === 0 ? { ...moon, radius: undefined } : moon,
    );
    expect(validatePlanetSnapshot(broken({ moons }))).toMatchObject({ ok: false });
  });

  it('rejects a civilization with no population', () => {
    expect(
      validatePlanetSnapshot(
        broken({ civilization: { ...snapshot.civilization, population: undefined } }),
      ),
    ).toMatchObject({ ok: false });
  });

  it('rejects a civilization with no government', () => {
    expect(
      validatePlanetSnapshot(
        broken({ civilization: { ...snapshot.civilization, government_type: undefined } }),
      ),
    ).toMatchObject({ ok: false });
  });

  it('rejects a government whose name options are not a list', () => {
    const government = { ...snapshot.civilization!.government_type, name_options: 'many' };
    expect(
      validatePlanetSnapshot(
        broken({ civilization: { ...snapshot.civilization, government_type: government } }),
      ),
    ).toMatchObject({ ok: false });
  });

  it('rejects a military with a non-numeric rating', () => {
    const military = { ...snapshot.civilization!.military, training_level: 'good' };
    expect(
      validatePlanetSnapshot(broken({ civilization: { ...snapshot.civilization, military } })),
    ).toMatchObject({ ok: false });
  });

  it('rejects a civilization with no economy', () => {
    expect(
      validatePlanetSnapshot(
        broken({ civilization: { ...snapshot.civilization, economy_type: undefined } }),
      ),
    ).toMatchObject({ ok: false });
  });
});

describe('migrating a stored planet (7.3)', () => {
  it('rejects every version, because version 1 is the only shape there has been', () => {
    // The whole of this kind's migration story today, asserted so that the day a version 2 lands
    // this test is what has to change rather than something that silently drops a user's work.
    const result = migratePlanetSnapshot(snapshot, 0);
    expect(result).toMatchObject({ ok: false, reason: 'unsupported-version' });
    expect(result.ok ? '' : result.message).toContain('version 0');
  });
});
