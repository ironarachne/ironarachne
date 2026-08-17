/**
 * Reading the files the old exporter wrote.
 *
 * The promise being kept here is the one that makes a version field worth having: a backup someone
 * made with the build that shipped before projects existed still restores. So the fixtures are real
 * generator output put through the real `buildExportPayload`, not a hand-written approximation of
 * what that function was believed to produce — the whole risk is that the two differ.
 */

import { IDBFactory } from 'fake-indexeddb';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { listArtifacts, readArtifact, resetArtifactIndex } from '$lib/artifacts';
import {
  generateCulture,
  getDefaultCultureGenerationConfig,
  toCultureSnapshot,
} from '$lib/culture';
import { ADOPTION_PROJECT_NAME } from '$lib/legacy_adoption';
import { buildExportPayload, writeScopedJson } from '$lib/persistent_save';
import { listProjects, resetProjectIndex } from '$lib/projects';
import { closeVault } from '$lib/vault_db';
import { ARTIFACT_KINDS } from '$lib/workshop';

import { importExportFile } from './vault_file_import';
import { legacySaveFileToEnvelope, looksLikeLegacySaveFile } from './vault_file_legacy';

const store = new Map<string, string>();

beforeEach(() => {
  store.clear();
  closeVault();
  resetProjectIndex();
  resetArtifactIndex();
  vi.stubGlobal('indexedDB', new IDBFactory());
  vi.stubGlobal('localStorage', {
    get length() {
      return store.size;
    },
    key: (index: number) => [...store.keys()][index] ?? null,
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
    removeItem: (key: string) => void store.delete(key),
    clear: () => store.clear(),
  });
});

afterEach(() => {
  closeVault();
  resetProjectIndex();
  resetArtifactIndex();
  vi.unstubAllGlobals();
});

/** A file the old exporter would have written, from a culture the real generator produced. */
function legacySaveFile(seed: string): { text: string; name: string } {
  const culture = generateCulture(seed, getDefaultCultureGenerationConfig());
  const snapshot = toCultureSnapshot(culture);
  writeScopedJson('generator.culture', { payloadVersion: 1, cultures: [snapshot] });
  return { text: JSON.stringify(buildExportPayload()), name: snapshot.name };
}

describe('looksLikeLegacySaveFile', () => {
  it('recognises the old marker and nothing else', () => {
    expect(looksLikeLegacySaveFile({ ironarachneExport: true, scopes: {} })).toBe(true);
    expect(looksLikeLegacySaveFile({ ironarachneExport: true })).toBe(false);
    expect(looksLikeLegacySaveFile({ format: 'ironarachne.export' })).toBe(false);
    expect(looksLikeLegacySaveFile('a string')).toBe(false);
  });

  it('does not look at the version, which is the mistake the old exporter makes', () => {
    // `save_file_export.ts` compares its `formatVersion` with `===`, which turns the first bump
    // into rejection of every file already in users' hands. A file from a later version of that
    // format is still one of ours.
    expect(
      looksLikeLegacySaveFile({ ironarachneExport: true, formatVersion: 99, scopes: {} }),
    ).toBe(true);
  });
});

describe('legacySaveFileToEnvelope', () => {
  it('refuses anything that is not one', () => {
    expect(legacySaveFileToEnvelope('not a record')).toBeUndefined();
    expect(legacySaveFileToEnvelope({ ironarachneExport: true })).toBeUndefined();
  });

  it('carries each scope’s own payload version, unrepaired', () => {
    const envelope = legacySaveFileToEnvelope({
      ironarachneExport: true,
      formatVersion: 1,
      exportedAt: '2026-05-21T00:00:00.000Z',
      scopes: {
        'generator.culture': { payloadVersion: 7, cultures: [{ name: 'From the future' }] },
      },
    });
    const body = envelope?.body as { artifacts: { payloadVersion: number }[] };
    expect(body.artifacts[0].payloadVersion).toBe(7);
  });
});

describe('importing a legacy save file', () => {
  it('reads one, so a backup made before projects existed still restores', async () => {
    const legacy = legacySaveFile('seed-for-the-old-file');

    const result = await importExportFile(ARTIFACT_KINDS, legacy.text, {
      skipCapacityCheck: true,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.summary.artifactsAdded).toBe(1);
    expect(result.summary.quarantined).toEqual([]);

    const [project] = listProjects();
    expect(project.name).toBe(ADOPTION_PROJECT_NAME);
    const [summary] = listArtifacts(project.id);
    // No name in the legacy format, so the kind's own `nameOf` decides — the same function that
    // names a freshly generated culture.
    expect(summary.name).toBe(legacy.name);
    expect(summary.kind).toBe('culture');

    const read = await readArtifact(ARTIFACT_KINDS, project.id, summary.id);
    expect(read?.ok).toBe(true);
  });

  it('goes through the same quarantine as anything else', async () => {
    const file = JSON.stringify({
      ironarachneExport: true,
      formatVersion: 1,
      exportedAt: '2026-05-21T00:00:00.000Z',
      scopes: {
        'generator.culture': { payloadVersion: 1, cultures: [{ not: 'a culture' }] },
      },
    });
    const result = await importExportFile(ARTIFACT_KINDS, file, { skipCapacityCheck: true });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.summary.artifactsAdded).toBe(0);
      expect(result.summary.quarantined[0].kind).toBe('culture');
    }
  });

  it('imports an empty legacy file as an empty project rather than refusing it', async () => {
    const file = JSON.stringify({
      ironarachneExport: true,
      formatVersion: 1,
      exportedAt: '',
      scopes: {},
    });
    const result = await importExportFile(ARTIFACT_KINDS, file, { skipCapacityCheck: true });
    expect(result.ok && result.summary.projectsAdded).toBe(1);
    expect(result.ok && result.summary.artifactsAdded).toBe(0);
  });
});
