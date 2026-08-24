import { IDBFactory } from 'fake-indexeddb';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createProject, resetProjectIndex } from '$lib/projects';
import { resetArtifactIndex } from '$lib/artifacts';
import {
  invalidateStorageMeasurement,
  lastPersistenceRequest,
  resetPersistenceRequestSession,
} from '$lib/storage_status';
import { VAULT_META_KEYS, closeVault, readVaultMeta } from '$lib/vault_db';

import { exportWholeVault } from './vault_export';

/**
 * Whether the browser took the download, and what it was handed.
 *
 * The real `downloadTextFile` reports rather than throws, which is the seam this whole flow turns
 * on: a browser that refuses the file has not lost the user's work, and must not be told it has.
 */
const browser = { takesTheFile: true, handed: [] as { text: string; fileName: string }[] };

vi.mock('$lib/download', () => ({
  default: () => undefined,
  downloadTextFile: (text: string, fileName: string) => {
    browser.handed.push({ text, fileName });
    return browser.takesTheFile;
  },
}));

beforeEach(() => {
  closeVault();
  resetProjectIndex();
  resetArtifactIndex();
  resetPersistenceRequestSession();
  invalidateStorageMeasurement();
  browser.takesTheFile = true;
  browser.handed = [];
  vi.stubGlobal('indexedDB', new IDBFactory());
});

afterEach(() => {
  closeVault();
  resetProjectIndex();
  resetArtifactIndex();
  resetPersistenceRequestSession();
  vi.unstubAllGlobals();
});

async function seedProject(name = 'Aldia'): Promise<void> {
  const project = await createProject({ name, tags: [] });
  if (!project.ok) {
    throw new Error('the test project could not be created');
  }
}

async function exportStamp(): Promise<unknown> {
  const stored = await readVaultMeta(VAULT_META_KEYS.lastVaultExportAt);
  return stored.ok ? stored.value : undefined;
}

describe('exporting the whole vault', () => {
  it('builds a file, hands it to the browser, and reports it saved', async () => {
    await seedProject();

    const result = await exportWholeVault();

    expect(result.status).toBe('saved');
    expect(result.fileName).toMatch(/\.json$/);
    expect(browser.handed).toHaveLength(1);
    expect(browser.handed[0].text).toContain('Aldia');
  });

  it('records the export only once the browser has taken the file', async () => {
    await seedProject();
    expect(await exportStamp()).toBeUndefined();

    await exportWholeVault();

    expect(typeof (await exportStamp())).toBe('number');
  });

  it('asks for persistence, because a finished export is real work', async () => {
    await seedProject();

    await exportWholeVault();

    expect(lastPersistenceRequest()?.trigger).toBe('vaultExported');
  });

  it('does not carry the file text back when there is no reason to', async () => {
    await seedProject();

    // The text is for the one case where the caller has to offer it by hand. Returning it always
    // would mean every caller held a copy of the whole vault for no purpose.
    expect((await exportWholeVault()).text).toBeUndefined();
  });
});

describe('when the browser will not take the download', () => {
  beforeEach(() => {
    browser.takesTheFile = false;
  });

  it('reports it blocked rather than failed, and carries the file', async () => {
    await seedProject();

    const result = await exportWholeVault();

    expect(result.status).toBe('blocked');
    expect(result.fileName).toMatch(/\.json$/);
    expect(result.text).toContain('Aldia');
  });

  it('does not stamp an export that never landed', async () => {
    await seedProject();

    await exportWholeVault();

    // The stamp is what tells a user how long their work has been the only copy. A false
    // reassurance here is worse than no figure at all.
    expect(await exportStamp()).toBeUndefined();
  });

  it('does not ask for persistence on the strength of an export that did not happen', async () => {
    await seedProject();

    await exportWholeVault();

    expect(lastPersistenceRequest()).toBeNull();
  });
});

describe('when the file cannot be built', () => {
  it('reports the failure with the reason, and stamps nothing', async () => {
    await seedProject();
    vi.stubGlobal('indexedDB', undefined);

    const result = await exportWholeVault();

    expect(result).toMatchObject({ status: 'failed', reason: 'unavailable' });
    expect(result.issues).toEqual([]);
    expect(browser.handed).toHaveLength(0);
  });

  it('never rejects, whatever the database did', async () => {
    vi.stubGlobal('indexedDB', undefined);

    await expect(exportWholeVault()).resolves.toMatchObject({ status: 'failed' });
  });
});
