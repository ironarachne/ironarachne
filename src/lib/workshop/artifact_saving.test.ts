import { IDBFactory } from 'fake-indexeddb';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  getArtifactSummary,
  readArtifact,
  resetArtifactIndex,
  type Artifact,
} from '$lib/artifacts';
import { closeVault } from '$lib/vault_db';

import { ARTIFACT_KINDS } from './artifact_kind_catalog';
import { saveToolArtifact } from './artifact_saving';

beforeEach(() => {
  closeVault();
  resetArtifactIndex();
  vi.stubGlobal('indexedDB', new IDBFactory());
});

afterEach(() => {
  closeVault();
  resetArtifactIndex();
  vi.unstubAllGlobals();
});

/**
 * A real culture snapshot is a large object, and this is not the place that proves the culture
 * kind validates one — `culture_artifact_kind.test.ts` is. What is needed here is the smallest
 * payload the registered kind accepts, so the test is about saving rather than about cultures.
 */
function cultureSnapshot(name = 'Ashfall'): Record<string, unknown> {
  return {
    name,
    greeting: 'Well met',
    eatingTrait: 'They eat at dusk.',
    designTrait: 'Angular.',
    musicStyle: 'Drums.',
    taboos: ['No iron indoors.'],
    organization: {
      powerConcentration: 'centralized',
      socialMobility: 'rigid',
      dominantProfession: 'smith',
      description: 'A guild of smiths rules.',
    },
    religion: { name: 'The Ember' },
    nameGenerators: {
      name: 'ashfall',
      culture: ['a$'],
      country: ['a$'],
      family: ['a$'],
      female: ['a$'],
      male: ['a$'],
      town: ['a$'],
    },
  };
}

async function saved(artifact: Artifact): Promise<Artifact | undefined> {
  const read = await readArtifact(ARTIFACT_KINDS, artifact.projectId, artifact.id);
  return read?.ok === true ? read.artifact : undefined;
}

describe('saveToolArtifact', () => {
  it('stores a snapshot as an artifact in the project', async () => {
    const result = await saveToolArtifact('p1', {
      kind: 'culture',
      payload: cultureSnapshot(),
      toolPath: '/culture',
      seed: 'abc123',
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(getArtifactSummary('p1', result.value.id)?.name).toBe('Ashfall');
    expect(await saved(result.value)).toBeDefined();
  });

  it('records the tool, the seed, and the settings as provenance', async () => {
    const result = await saveToolArtifact('p1', {
      kind: 'culture',
      payload: cultureSnapshot(),
      toolPath: '/culture',
      seed: 'abc123',
      config: { nameSet: 'human' },
    });

    expect(result.ok && result.value.provenance).toEqual({
      toolPath: '/culture',
      seed: 'abc123',
      config: { nameSet: 'human' },
    });
  });

  it('records no provenance at all rather than an invented seed', async () => {
    const result = await saveToolArtifact('p1', {
      kind: 'culture',
      payload: cultureSnapshot(),
      toolPath: '/culture',
    });

    expect(result.ok && result.value.provenance).toBeUndefined();
  });

  it('takes the name and tags the user gave over the kind’s default', async () => {
    const result = await saveToolArtifact('p1', {
      kind: 'culture',
      payload: cultureSnapshot(),
      toolPath: '/culture',
      name: 'The northerners',
      tags: ['north'],
    });

    expect(result.ok && result.value.name).toBe('The northerners');
    expect(result.ok && result.value.tags).toEqual(['north']);
  });

  it('records the saved artifacts a tool was handed, as references', async () => {
    const culture = await saveToolArtifact('p1', {
      kind: 'culture',
      payload: cultureSnapshot(),
      toolPath: '/culture',
    });
    const result = await saveToolArtifact('p1', {
      kind: 'religion',
      payload: {
        name: 'The Ember',
        seed: 'abc123',
        religion: { name: 'The Ember' },
        generatorOptions: {
          lockSeed: false,
          useSavedCulture: true,
          selectedCategories: [],
          selectedSpecies: [],
          polytheisticStanding: 'random',
          spiritCosmologyDepth: 'random',
        },
      },
      toolPath: '/fantasy/religion',
      references: culture.ok
        ? [{ targetId: culture.value.id, targetKind: 'culture', role: 'naming-culture' }]
        : [],
    });

    expect(result.ok && result.value.references).toEqual([
      {
        targetId: culture.ok ? culture.value.id : '',
        targetKind: 'culture',
        role: 'naming-culture',
      },
    ]);
  });

  it('records no references for a tool that was handed nothing', async () => {
    const result = await saveToolArtifact('p1', {
      kind: 'culture',
      payload: cultureSnapshot(),
      toolPath: '/culture',
    });

    expect(result.ok && result.value.references).toEqual([]);
  });

  it('rejects a kind this build does not have, rather than storing it', async () => {
    const result = await saveToolArtifact('p1', {
      kind: 'not-a-kind',
      payload: {},
      toolPath: '/culture',
    });

    expect(result).toMatchObject({ ok: false, reason: 'unknown-kind' });
  });

  it('rejects a payload its own kind refuses', async () => {
    const result = await saveToolArtifact('p1', {
      kind: 'culture',
      payload: { name: 'Ashfall' },
      toolPath: '/culture',
    });

    expect(result).toMatchObject({ ok: false, reason: 'invalid-payload' });
  });

  it('reports a database that would not take the write', async () => {
    closeVault();
    vi.stubGlobal('indexedDB', undefined);
    resetArtifactIndex();

    const result = await saveToolArtifact('p1', {
      kind: 'culture',
      payload: cultureSnapshot(),
      toolPath: '/culture',
    });

    expect(result).toMatchObject({ ok: false, reason: 'unavailable' });
  });
});
