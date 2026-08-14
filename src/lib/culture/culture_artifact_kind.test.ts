import { RNG } from '@ironarachne/rng';
import { describe, expect, it } from 'vitest';

import {
  cultureArtifactKind,
  CULTURE_ARTIFACT_KIND,
  CULTURE_PAYLOAD_VERSION,
  migrateCultureSnapshot,
  validateCultureSnapshot,
} from './culture_artifact_kind';
import { generateCulture, getDefaultCultureGenerationConfig } from './culture_generation';
import type { CultureSnapshot } from './culture_snapshot';
import type { Culture } from './culture_types';
import { getFantasyNameGeneratorSet, nameGeneratorSetToStoredPatternSet } from '$lib/names';

function sampleCulture(seed = 'culture-artifact-kind'): Culture {
  const config = getDefaultCultureGenerationConfig();
  config.nameGenerators = getFantasyNameGeneratorSet('dwarf', new RNG(seed));
  return generateCulture(seed, config);
}

async function sampleSnapshot(): Promise<CultureSnapshot> {
  const { toSnapshot } = await cultureArtifactKind.loadCodec();
  return toSnapshot(sampleCulture());
}

describe('cultureArtifactKind', () => {
  it('declares its kind, name, and current payload version', () => {
    expect(cultureArtifactKind.kind).toBe(CULTURE_ARTIFACT_KIND);
    expect(cultureArtifactKind.displayName).toBe('Culture');
    expect(cultureArtifactKind.payloadVersion).toBe(CULTURE_PAYLOAD_VERSION);
  });

  it('round-trips a culture through JSON, name generators included', async () => {
    const culture = sampleCulture();
    const { toSnapshot, fromSnapshot } = await cultureArtifactKind.loadCodec();

    const parsed = JSON.parse(JSON.stringify(toSnapshot(culture))) as CultureSnapshot;
    const restored = fromSnapshot(parsed, new RNG('culture-restore'));

    expect(restored.name).toBe(culture.name);
    expect(restored.greeting).toBe(culture.greeting);
    expect(restored.taboos).toEqual(culture.taboos);
    expect(restored.organization).toEqual(culture.organization);
    expect(restored.religion.name).toBe(culture.religion.name);
    expect(nameGeneratorSetToStoredPatternSet(restored.nameGenerators)).toEqual(
      nameGeneratorSetToStoredPatternSet(culture.nameGenerators),
    );
  });

  it('names an artifact after the culture', async () => {
    const snapshot = await sampleSnapshot();
    expect(cultureArtifactKind.nameOf(snapshot)).toBe(snapshot.name);
  });

  it('strips the functions a live culture carries so the payload is JSON', async () => {
    const snapshot = await sampleSnapshot();
    expect(() => JSON.stringify(snapshot)).not.toThrow();
    expect(validateCultureSnapshot(JSON.parse(JSON.stringify(snapshot))).ok).toBe(true);
  });
});

describe('validateCultureSnapshot', () => {
  it('accepts a snapshot this build wrote', async () => {
    expect(validateCultureSnapshot(await sampleSnapshot()).ok).toBe(true);
  });

  it('rejects anything that is not an object', () => {
    const result = validateCultureSnapshot(['a culture']);
    expect(result.ok === false && result.reason).toBe('invalid-payload');
  });

  it('rejects a culture missing the fields the restore copies through', async () => {
    const { greeting: _greeting, ...withoutGreeting } = await sampleSnapshot();
    const result = validateCultureSnapshot(withoutGreeting);
    expect(result.ok === false && result.message).toContain('greeting');
  });

  it('rejects taboos that are not strings', async () => {
    const snapshot = await sampleSnapshot();
    const result = validateCultureSnapshot({ ...snapshot, taboos: [1, 2] });
    expect(result.ok === false && result.message).toContain('taboos');
  });

  it('rejects an organization that is not one', async () => {
    const snapshot = await sampleSnapshot();
    expect(validateCultureSnapshot({ ...snapshot, organization: null }).ok).toBe(false);
    expect(
      validateCultureSnapshot({ ...snapshot, organization: { powerConcentration: 'high' } }).ok,
    ).toBe(false);
  });

  it('rejects a culture with no religion object', async () => {
    const snapshot = await sampleSnapshot();
    const result = validateCultureSnapshot({ ...snapshot, religion: 'the Ashen Path' });
    expect(result.ok === false && result.message).toContain('religion');
  });

  it('rejects name generators with no usable patterns', async () => {
    const snapshot = await sampleSnapshot();
    const result = validateCultureSnapshot({
      ...snapshot,
      nameGenerators: { ...snapshot.nameGenerators, town: 42 },
    });
    expect(result.ok === false && result.message).toContain('town');
  });

  it('accepts either spelling of a stored generator: patterns or a pattern set', async () => {
    const snapshot = await sampleSnapshot();
    const asPatternSet = {
      ...snapshot,
      nameGenerators: { ...snapshot.nameGenerators, male: { patterns: ['CVC'] } },
    };
    expect(validateCultureSnapshot(asPatternSet).ok).toBe(true);
  });

  it('rejects name generators that are not an object with a name', async () => {
    const snapshot = await sampleSnapshot();
    expect(validateCultureSnapshot({ ...snapshot, nameGenerators: null }).ok).toBe(false);
    expect(
      validateCultureSnapshot({
        ...snapshot,
        nameGenerators: { ...snapshot.nameGenerators, name: 7 },
      }).ok,
    ).toBe(false);
  });
});

describe('migrateCultureSnapshot', () => {
  it('has nothing older to migrate and says so', () => {
    const result = migrateCultureSnapshot({ name: 'Ashfall' }, 0);
    expect(result.ok).toBe(false);
    expect(result.ok === false && result.reason).toBe('unsupported-version');
    expect(result.ok === false && result.message).toContain('version 0');
  });
});
