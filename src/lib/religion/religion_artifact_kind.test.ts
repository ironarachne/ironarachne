import { RNG } from '@ironarachne/rng';
import { describe, expect, it } from 'vitest';

import { generateReligion, getDefaultReligionGenerationConfig } from './religion_generation';
import {
  religionArtifactKind,
  RELIGION_ARTIFACT_KIND,
  RELIGION_PAYLOAD_VERSION,
  migrateReligionSnapshot,
  validateReligionSnapshot,
} from './religion_artifact_kind';
import type { ReligionGeneratorOptionsSnapshot, ReligionSnapshot } from './religion_snapshot';
import type { RestoredReligion } from './religion_snapshot';

const sampleOptions: ReligionGeneratorOptionsSnapshot = {
  lockSeed: true,
  selectedCategories: ['polytheistic'],
  selectedSpecies: ['human'],
  polytheisticStanding: 'hierarchical',
  spiritCosmologyDepth: 'moderate',
  useSavedCulture: false,
};

function sampleRestoredReligion(seed = 'religion-artifact-kind'): RestoredReligion {
  return {
    religion: generateReligion(seed, getDefaultReligionGenerationConfig()),
    seed,
    generatorOptions: sampleOptions,
  };
}

async function sampleSnapshot(): Promise<ReligionSnapshot> {
  const { toSnapshot } = await religionArtifactKind.loadCodec();
  return toSnapshot(sampleRestoredReligion());
}

describe('religionArtifactKind', () => {
  it('declares its kind, name, and current payload version', () => {
    expect(religionArtifactKind.kind).toBe(RELIGION_ARTIFACT_KIND);
    expect(religionArtifactKind.displayName).toBe('Religion');
    expect(religionArtifactKind.payloadVersion).toBe(RELIGION_PAYLOAD_VERSION);
  });

  it('round-trips a religion through JSON', async () => {
    const value = sampleRestoredReligion();
    const { toSnapshot, fromSnapshot } = await religionArtifactKind.loadCodec();

    const parsed = JSON.parse(JSON.stringify(toSnapshot(value))) as ReligionSnapshot;
    const restored = fromSnapshot(parsed, new RNG('unused'));

    expect(restored.seed).toBe(value.seed);
    expect(restored.generatorOptions).toEqual(sampleOptions);
    expect(restored.religion.name).toBe(value.religion.name);
    expect(restored.religion.description).toBe(value.religion.description);
  });

  it('names an artifact after the religion', async () => {
    const snapshot = await sampleSnapshot();
    expect(religionArtifactKind.nameOf(snapshot)).toBe(snapshot.religion.name);
  });

  it('strips the functions a live religion carries so the payload is JSON', async () => {
    const snapshot = await sampleSnapshot();
    expect(validateReligionSnapshot(JSON.parse(JSON.stringify(snapshot))).ok).toBe(true);
  });
});

describe('validateReligionSnapshot', () => {
  it('accepts a snapshot this build wrote', async () => {
    expect(validateReligionSnapshot(await sampleSnapshot()).ok).toBe(true);
  });

  it('rejects anything that is not an object', () => {
    expect(validateReligionSnapshot('a religion').ok).toBe(false);
  });

  it('rejects a payload with no seed', async () => {
    const { seed: _seed, ...withoutSeed } = await sampleSnapshot();
    const result = validateReligionSnapshot(withoutSeed);
    expect(result.ok === false && result.message).toContain('seed');
  });

  it('rejects a payload whose religion is not an object with a name', async () => {
    const snapshot = await sampleSnapshot();
    expect(validateReligionSnapshot({ ...snapshot, religion: 'the Ashen Path' }).ok).toBe(false);
    expect(validateReligionSnapshot({ ...snapshot, religion: { description: 'x' } }).ok).toBe(
      false,
    );
  });

  it.each([
    ['lockSeed', { lockSeed: 'yes' }],
    ['selectedCategories', { selectedCategories: [1] }],
    ['selectedSpecies', { selectedSpecies: 'human' }],
    ['polytheisticStanding', { polytheisticStanding: 3 }],
    ['savedCultureName', { savedCultureName: 7 }],
  ])('rejects generator options with a bad %s', async (_field, override) => {
    const snapshot = await sampleSnapshot();
    const result = validateReligionSnapshot({
      ...snapshot,
      generatorOptions: { ...sampleOptions, ...override },
    });
    expect(result.ok === false && result.reason).toBe('invalid-payload');
  });

  it('rejects generator options that are not an object', async () => {
    const snapshot = await sampleSnapshot();
    expect(validateReligionSnapshot({ ...snapshot, generatorOptions: null }).ok).toBe(false);
  });

  it('accepts a saved culture name when there is one', async () => {
    const snapshot = await sampleSnapshot();
    const result = validateReligionSnapshot({
      ...snapshot,
      generatorOptions: { ...sampleOptions, useSavedCulture: true, savedCultureName: 'Ashfall' },
    });
    expect(result.ok).toBe(true);
  });
});

describe('migrateReligionSnapshot', () => {
  it('has nothing older to migrate and says so', () => {
    const result = migrateReligionSnapshot({ name: 'the Ashen Path' }, 0);
    expect(result.ok === false && result.reason).toBe('unsupported-version');
    expect(result.ok === false && result.message).toContain('version 0');
  });
});
