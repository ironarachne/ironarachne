import { describe, expect, it } from 'vitest';

import {
  ENVIRONMENT_ARTIFACT_KIND,
  ENVIRONMENT_PAYLOAD_VERSION,
  environmentArtifactKind,
  migrateEnvironmentSnapshot,
  validateEnvironmentSnapshot,
} from './environment_artifact_kind';
import { rollEnvironmentSnapshot } from './environment_roll';
import type { EnvironmentSnapshot } from './environment_snapshot';

const snapshot = rollEnvironmentSnapshot('kind-seed');

/** A copy of the good payload with one part replaced, for the rejection cases. */
function broken(changes: Record<string, unknown>): unknown {
  return { ...(snapshot as unknown as Record<string, unknown>), ...changes };
}

describe('the environment artifact kind', () => {
  it('is registered under a stable, unqualified id', () => {
    expect(environmentArtifactKind.kind).toEqual(ENVIRONMENT_ARTIFACT_KIND);
    expect(ENVIRONMENT_ARTIFACT_KIND).toEqual('environment');
  });

  it('declares the payload version it writes', () => {
    expect(environmentArtifactKind.payloadVersion).toEqual(ENVIRONMENT_PAYLOAD_VERSION);
  });

  it('names a saved environment by its biome and climate', () => {
    expect(environmentArtifactKind.nameOf(snapshot)).toEqual(
      `${snapshot.biome.name}, ${snapshot.climate.name}`,
    );
  });

  it('falls back to whichever half it still has', () => {
    expect(
      environmentArtifactKind.nameOf({ ...snapshot, biome: { ...snapshot.biome, name: '  ' } }),
    ).toEqual(snapshot.climate.name);
  });

  it('falls back to the kind when both have been emptied', () => {
    expect(
      environmentArtifactKind.nameOf({
        ...snapshot,
        biome: { ...snapshot.biome, name: '' },
        climate: { ...snapshot.climate, name: '' },
      }),
    ).toEqual('Environment');
  });

  it('round-trips through its own codec', async () => {
    const codec = await environmentArtifactKind.loadCodec();
    expect(codec.toSnapshot(codec.fromSnapshot(snapshot, undefined as never))).toEqual(snapshot);
  });
});

describe('validating a stored environment', () => {
  it('accepts what the generator wrote', () => {
    expect(validateEnvironmentSnapshot(snapshot).ok).toBe(true);
  });

  it('accepts one whose description a user has emptied', () => {
    // An editing decision, not a broken artifact: 3.3 asks for a well-defined empty result.
    expect(validateEnvironmentSnapshot(broken({ description: '' })).ok).toBe(true);
  });

  it('accepts one with no ecosystems, which is every environment this build makes', () => {
    expect(validateEnvironmentSnapshot(broken({ ecosystems: [] })).ok).toBe(true);
  });

  it('rejects something that is not an object at all', () => {
    expect(validateEnvironmentSnapshot('a forest')).toMatchObject({
      ok: false,
      reason: 'invalid-payload',
    });
  });

  it('rejects a payload with no description', () => {
    const { description: _description, ...rest } = snapshot as unknown as Record<string, unknown>;
    expect(validateEnvironmentSnapshot(rest)).toMatchObject({ ok: false });
  });

  it('rejects ecosystems that are not a list', () => {
    expect(validateEnvironmentSnapshot(broken({ ecosystems: 'lots' }))).toMatchObject({
      ok: false,
    });
  });

  it('rejects an ecosystem whose flora is not a list of strings', () => {
    expect(
      validateEnvironmentSnapshot(
        broken({ ecosystems: [{ name: '', description: '', flora: [3], fauna: [] }] }),
      ),
    ).toMatchObject({ ok: false });
  });

  it('rejects a biome with no name', () => {
    expect(
      validateEnvironmentSnapshot(broken({ biome: { ...snapshot.biome, name: 4 } })),
    ).toMatchObject({ ok: false });
  });

  it('rejects a biome that does not say whether it is water', () => {
    expect(
      validateEnvironmentSnapshot(broken({ biome: { ...snapshot.biome, isAquatic: 'yes' } })),
    ).toMatchObject({ ok: false });
  });

  it('rejects a biome whose features are not strings', () => {
    expect(
      validateEnvironmentSnapshot(broken({ biome: { ...snapshot.biome, features: [1, 2] } })),
    ).toMatchObject({ ok: false });
  });

  it('rejects a climate with a non-numeric measurement', () => {
    expect(
      validateEnvironmentSnapshot(broken({ climate: { ...snapshot.climate, humidity: 'damp' } })),
    ).toMatchObject({ ok: false });
  });

  it('rejects a climate whose wind is not a vector', () => {
    expect(
      validateEnvironmentSnapshot(broken({ climate: { ...snapshot.climate, wind: 'westerly' } })),
    ).toMatchObject({ ok: false });
  });

  it('rejects a season with no name', () => {
    const seasons = snapshot.climate.seasons.map((season, index) =>
      index === 0 ? { ...season, name: undefined } : season,
    );
    expect(
      validateEnvironmentSnapshot(broken({ climate: { ...snapshot.climate, seasons } })),
    ).toMatchObject({ ok: false });
  });

  it('rejects a season whose adjustment is not a number', () => {
    const seasons = snapshot.climate.seasons.map((season, index) =>
      index === 0 ? { ...season, humidityAdjustment: 'wetter' } : season,
    );
    expect(
      validateEnvironmentSnapshot(broken({ climate: { ...snapshot.climate, seasons } })),
    ).toMatchObject({ ok: false });
  });

  it('rejects terrain with no geological makeup', () => {
    expect(
      validateEnvironmentSnapshot(
        broken({ terrain: { ...snapshot.terrain, geologicalMakeup: undefined } }),
      ),
    ).toMatchObject({ ok: false });
  });

  it('rejects terrain whose slope is not a vector', () => {
    expect(
      validateEnvironmentSnapshot(broken({ terrain: { ...snapshot.terrain, normalVector: [] } })),
    ).toMatchObject({ ok: false });
  });

  it('rejects a water system with no water type', () => {
    expect(
      validateEnvironmentSnapshot(
        broken({ waterSystem: { ...snapshot.waterSystem, waterType: undefined } }),
      ),
    ).toMatchObject({ ok: false });
  });

  it('rejects a water system with a non-numeric surface level', () => {
    expect(
      validateEnvironmentSnapshot(
        broken({ waterSystem: { ...snapshot.waterSystem, surfaceLevel: 'high' } }),
      ),
    ).toMatchObject({ ok: false });
  });

  it('rejects each of the four parts being missing outright', () => {
    for (const part of ['biome', 'climate', 'terrain', 'waterSystem']) {
      expect(validateEnvironmentSnapshot(broken({ [part]: undefined })), part).toMatchObject({
        ok: false,
      });
    }
  });
});

describe('migrating a stored environment (7.3)', () => {
  it('rejects every version, because version 1 is the only shape there has been', () => {
    // The whole of this kind's migration story today, asserted so that the day a version 2 lands
    // this test is what has to change rather than something that silently drops a user's work.
    const result = migrateEnvironmentSnapshot(snapshot as unknown as EnvironmentSnapshot, 0);
    expect(result).toMatchObject({ ok: false, reason: 'unsupported-version' });
    expect(result.ok ? '' : result.message).toContain('version 0');
  });
});
