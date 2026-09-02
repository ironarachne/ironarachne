import { describe, expect, it } from 'vitest';

import {
  STAR_SYSTEM_ARTIFACT_KIND,
  STAR_SYSTEM_PAYLOAD_VERSION,
  migrateStarSystemSnapshot,
  starSystemArtifactKind,
  validateStarSystemSnapshot,
} from './star_system_artifact_kind';
import { rollStarSystemSnapshot } from './star_system_roll';

const snapshot = rollStarSystemSnapshot('kind-seed', { planetCount: 4 });

/** A copy of the good payload with one part replaced, for the rejection cases. */
function broken(changes: Record<string, unknown>): unknown {
  return { ...(snapshot as unknown as Record<string, unknown>), ...changes };
}

describe('the star system artifact kind', () => {
  it('is registered under a stable, unqualified id', () => {
    expect(starSystemArtifactKind.kind).toEqual(STAR_SYSTEM_ARTIFACT_KIND);
    expect(STAR_SYSTEM_ARTIFACT_KIND).toEqual('star-system');
  });

  it('declares the payload version it writes', () => {
    expect(starSystemArtifactKind.payloadVersion).toEqual(STAR_SYSTEM_PAYLOAD_VERSION);
  });

  it('names a saved system the way the page heads it', () => {
    expect(starSystemArtifactKind.nameOf(snapshot)).toEqual(`The ${snapshot.name} System`);
  });

  it('falls back to the kind when the name has been emptied', () => {
    expect(starSystemArtifactKind.nameOf({ ...snapshot, name: '  ' })).toEqual('Star System');
  });

  it('round-trips through its own codec', async () => {
    const codec = await starSystemArtifactKind.loadCodec();
    expect(codec.toSnapshot(codec.fromSnapshot(snapshot, undefined as never))).toEqual(snapshot);
  });
});

describe('validating a stored star system', () => {
  it('accepts what the generator wrote', () => {
    expect(validateStarSystemSnapshot(snapshot).ok).toBe(true);
  });

  it('accepts a system a user has emptied of planets', () => {
    // An editing decision, and also what a system whose every planet is a saved one looks like.
    expect(validateStarSystemSnapshot(broken({ planets: [] })).ok).toBe(true);
  });

  it('accepts a system with no stars, strange as that is', () => {
    // 3.3 asks for a well-defined empty result rather than a refusal; the presentation drops the
    // section, and the user gets their artifact back to fix.
    expect(validateStarSystemSnapshot(broken({ stars: [] })).ok).toBe(true);
  });

  it('rejects something that is not an object at all', () => {
    expect(validateStarSystemSnapshot('a system')).toMatchObject({
      ok: false,
      reason: 'invalid-payload',
    });
  });

  it('rejects a payload with no name or description', () => {
    expect(validateStarSystemSnapshot(broken({ name: undefined }))).toMatchObject({ ok: false });
    expect(validateStarSystemSnapshot(broken({ description: 4 }))).toMatchObject({ ok: false });
  });

  it('rejects lists that are not lists', () => {
    expect(validateStarSystemSnapshot(broken({ stars: 'one' }))).toMatchObject({ ok: false });
    expect(validateStarSystemSnapshot(broken({ planets: {} }))).toMatchObject({ ok: false });
  });

  it('rejects a star missing a measurement', () => {
    const stars = snapshot.stars.map((star, index) =>
      index === 0 ? { ...star, luminosity: undefined } : star,
    );
    expect(validateStarSystemSnapshot(broken({ stars }))).toMatchObject({ ok: false });
  });

  it('rejects a planet with a measurement that is not finite', () => {
    // NaN is what an emptied field in a hand-edited payload produces, it passes `typeof number`,
    // and it propagates silently through every figure derived from it.
    const planets = snapshot.planets.map((planet, index) =>
      index === 0 ? { ...planet, mass: Number.NaN } : planet,
    );
    expect(validateStarSystemSnapshot(broken({ planets }))).toMatchObject({ ok: false });
  });

  it('rejects a body that does not say whether it has an atmosphere', () => {
    const planets = snapshot.planets.map((planet, index) =>
      index === 0 ? { ...planet, has_atmosphere: 'thin' } : planet,
    );
    expect(validateStarSystemSnapshot(broken({ planets }))).toMatchObject({ ok: false });
  });

  it('rejects a body with no classification', () => {
    const stars = snapshot.stars.map((star, index) =>
      index === 0 ? { ...star, classification: undefined } : star,
    );
    expect(validateStarSystemSnapshot(broken({ stars }))).toMatchObject({ ok: false });
  });
});

describe('migrating a stored star system (7.3)', () => {
  it('rejects every version, because version 1 is the only shape there has been', () => {
    // The whole of this kind's migration story today, asserted so that the day a version 2 lands
    // this test is what has to change rather than something that silently drops a user's work.
    const result = migrateStarSystemSnapshot(snapshot, 0);
    expect(result).toMatchObject({ ok: false, reason: 'unsupported-version' });
    expect(result.ok ? '' : result.message).toContain('version 0');
  });
});
