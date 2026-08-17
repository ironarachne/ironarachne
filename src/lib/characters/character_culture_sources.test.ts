import { RNG } from '@ironarachne/rng';
import { IDBFactory } from 'fake-indexeddb';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { resetArtifactIndex } from '$lib/artifacts';
import {
  CULTURE_SAVE_PAYLOAD_VERSION,
  CULTURE_SAVE_SCOPE_ID,
  generateCulture,
  getDefaultCultureGenerationConfig,
  toCultureSnapshot,
  type CultureSnapshot,
} from '$lib/culture';
import { getFantasyNameGeneratorSet } from '$lib/names';
import { writeScopedJson } from '$lib/persistent_save';
import { createProject, resetProjectIndex, setActiveProject } from '$lib/projects';
import { closeVault } from '$lib/vault_db';
import { saveToolArtifact } from '$lib/workshop';

import { loadCulturesForNaming } from './character_culture_sources';

/**
 * Cultures as a build that still wrote to the legacy scope would have left them.
 *
 * Written straight to the scope: it is read-only as of #44, so there is no writer left to call.
 */
function storeLegacyCultures(cultures: CultureSnapshot[]): void {
  writeScopedJson(CULTURE_SAVE_SCOPE_ID, {
    payloadVersion: CULTURE_SAVE_PAYLOAD_VERSION,
    cultures,
  });
}

/** A localStorage the legacy scope can be written into and read back from. */
function stubLocalStorage() {
  const store = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    get length() {
      return store.size;
    },
    key: (index: number) => [...store.keys()][index] ?? null,
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
  });
}

function cultureNamed(name: string) {
  const config = getDefaultCultureGenerationConfig();
  config.nameGenerators = getFantasyNameGeneratorSet('dwarf', new RNG(name));
  return { ...generateCulture(name, config), name };
}

async function openAProject(): Promise<string> {
  const created = await createProject({ name: 'Ashfall' });
  if (!created.ok) {
    throw new Error(`expected a project, got ${created.reason}`);
  }
  setActiveProject(created.value.id);
  return created.value.id;
}

beforeEach(() => {
  closeVault();
  resetArtifactIndex();
  resetProjectIndex();
  vi.stubGlobal('indexedDB', new IDBFactory());
  stubLocalStorage();
});

afterEach(() => {
  closeVault();
  resetArtifactIndex();
  resetProjectIndex();
  vi.unstubAllGlobals();
});

describe('loadCulturesForNaming', () => {
  it('offers the open project’s cultures', async () => {
    const projectId = await openAProject();
    await saveToolArtifact(projectId, {
      kind: 'culture',
      payload: toCultureSnapshot(cultureNamed('Emberfolk')),
      toolPath: '/culture',
    });

    const cultures = await loadCulturesForNaming();

    expect(cultures.map((culture) => culture.name)).toEqual(['Emberfolk']);
    expect(cultures[0].nameGenerators.female.generate(1)).toHaveLength(1);
  });

  /**
   * The reason this exists. Cultures saved before the workshop are still in the old scope, and a
   * character generator that stopped seeing them would look like it had forgotten the user's work.
   */
  it('still offers cultures left in the older save scope', async () => {
    storeLegacyCultures([toCultureSnapshot(cultureNamed('Saltmarch'))]);

    expect((await loadCulturesForNaming()).map((culture) => culture.name)).toEqual(['Saltmarch']);
  });

  it('offers both at once, without listing an adopted culture twice', async () => {
    const projectId = await openAProject();
    await saveToolArtifact(projectId, {
      kind: 'culture',
      payload: toCultureSnapshot(cultureNamed('Emberfolk')),
      toolPath: '/culture',
    });
    storeLegacyCultures([
      toCultureSnapshot(cultureNamed('Emberfolk')),
      toCultureSnapshot(cultureNamed('Saltmarch')),
    ]);

    const names = (await loadCulturesForNaming()).map((culture) => culture.name);

    expect(names).toEqual(['Emberfolk', 'Saltmarch']);
  });

  it('offers nothing rather than failing when there is nothing saved anywhere', async () => {
    expect(await loadCulturesForNaming()).toEqual([]);
  });
});
