/**
 * Rescuing work that never reached storage (#180).
 *
 * The point of this file is a round trip: what a failed save leaves in hand comes out as a file and
 * goes back in as an ordinary artifact. A test that only checked the file's shape would miss the
 * thing that matters, which is that the rescue is importable rather than a souvenir.
 */

import { IDBFactory } from 'fake-indexeddb';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  acceptedPayload,
  asRecord,
  createArtifactKindRegistry,
  defineArtifactKind,
  registerArtifactKind,
  rejectedPayload,
  type ArtifactKindRegistry,
  type PayloadResult,
} from '$lib/artifact_kinds';
import { listArtifacts, readArtifact, resetArtifactIndex } from '$lib/artifacts';
import { createProject, listProjects, resetProjectIndex } from '$lib/projects';
import { closeVault } from '$lib/vault_db';

import { buildUnsavedArtifactExportFile } from './vault_file_export';
import { importExportFile } from './vault_file_import';

type NoteSnapshot = { text: string };

function validateNote(payload: unknown): PayloadResult<NoteSnapshot> {
  const record = asRecord(payload);
  if (record === null || typeof record.text !== 'string') {
    return rejectedPayload('invalid-payload', 'a note needs a text string');
  }
  return acceptedPayload({ text: record.text });
}

const noteKind = defineArtifactKind<NoteSnapshot, NoteSnapshot>({
  kind: 'test.note',
  displayName: 'Note',
  payloadVersion: 3,
  loadCodec: () =>
    Promise.resolve({ toSnapshot: (value) => value, fromSnapshot: (snapshot) => snapshot }),
  nameOf: (snapshot) => snapshot.text,
  validate: validateNote,
  migrate: (_payload, from) => rejectedPayload('unsupported-version', `no step from ${from}`),
});

function testKinds(): ArtifactKindRegistry {
  const registry = createArtifactKindRegistry();
  registerArtifactKind(registry, noteKind);
  return registry;
}

const NOW = Date.parse('2026-08-17T09:30:00.000Z');

beforeEach(() => {
  closeVault();
  resetProjectIndex();
  resetArtifactIndex();
  vi.stubGlobal('indexedDB', new IDBFactory());
});

afterEach(() => {
  closeVault();
  resetProjectIndex();
  resetArtifactIndex();
  vi.unstubAllGlobals();
});

describe('buildUnsavedArtifactExportFile', () => {
  it('writes an artifact file from a value that was never stored', async () => {
    const built = await buildUnsavedArtifactExportFile(
      testKinds(),
      { kind: 'test.note', payload: { text: 'The Deep' }, name: 'The Deep' },
      { now: NOW },
    );
    expect(built.ok).toBe(true);
    if (!built.ok || built.value.envelope.scope !== 'artifact') {
      expect.unreachable('an unsaved artifact should export at artifact scope');
      return;
    }
    expect(built.value.fileName).toBe('ironarachne-the-deep-2026-08-17.json');
    expect(built.value.envelope.body.artifact).toMatchObject({
      kind: 'test.note',
      name: 'The Deep',
      payloadVersion: 3,
      payload: { text: 'The Deep' },
    });
    expect(built.value.issues).toEqual([]);
  });

  it('names it through the kind, exactly as a real save would', async () => {
    const built = await buildUnsavedArtifactExportFile(testKinds(), {
      kind: 'test.note',
      payload: { text: 'Named by the kind' },
    });
    if (!built.ok || built.value.envelope.scope !== 'artifact') {
      return;
    }
    expect(built.value.envelope.body.artifact.name).toBe('Named by the kind');
  });

  /**
   * The whole point. A rescue file that could not be imported would be a souvenir of the work
   * rather than the work.
   */
  it('imports back into a project as an ordinary artifact', async () => {
    const created = await createProject({ name: 'Somewhere to land' });
    if (!created.ok) {
      throw new Error('the test project could not be created');
    }

    const built = await buildUnsavedArtifactExportFile(testKinds(), {
      kind: 'test.note',
      payload: { text: 'Rescued' },
      name: 'Rescued',
      tags: ['note'],
      provenance: { toolPath: '/culture', seed: 'rescue-seed', config: { depth: 1 } },
    });
    if (!built.ok) {
      throw new Error('the rescue file could not be built');
    }

    const imported = await importExportFile(testKinds(), built.value.text, {
      targetProjectId: created.value.id,
      skipCapacityCheck: true,
    });
    expect(imported.ok).toBe(true);
    if (!imported.ok) {
      return;
    }
    expect(imported.summary.artifactsAdded).toBe(1);
    expect(imported.summary.quarantined).toEqual([]);

    const [summary] = listArtifacts(created.value.id);
    expect(summary.name).toBe('Rescued');
    expect(summary.tags).toEqual(['note']);
    expect(summary.provenance?.seed).toBe('rescue-seed');
    const read = await readArtifact(testKinds(), created.value.id, summary.id);
    expect(read?.ok && read.artifact.payload).toEqual({ text: 'Rescued' });
  });

  it('needs no project to exist, which is the situation it is built for', async () => {
    expect(listProjects()).toEqual([]);

    const built = await buildUnsavedArtifactExportFile(testKinds(), {
      kind: 'test.note',
      payload: { text: 'Nowhere to go' },
    });

    expect(built.ok).toBe(true);
  });

  it('reports a kind this build does not have rather than writing a file nothing can read', async () => {
    const built = await buildUnsavedArtifactExportFile(testKinds(), {
      kind: 'not.a.kind',
      payload: {},
    });
    expect(built).toMatchObject({ ok: false, reason: 'not-found' });
  });

  it('still produces a file when the payload cannot be written, and says so', async () => {
    const cyclic: Record<string, unknown> = { text: 'loop' };
    cyclic.self = cyclic;

    const built = await buildUnsavedArtifactExportFile(testKinds(), {
      kind: 'test.note',
      payload: cyclic,
    });
    if (!built.ok || built.value.envelope.scope !== 'artifact') {
      expect.unreachable('a file should still be produced');
      return;
    }
    expect(built.value.issues[0]).toMatch(/could not be written/);
    expect(built.value.envelope.body.artifact.payload).toBeNull();
  });
});
