import { IDBFactory } from 'fake-indexeddb';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  acceptedPayload,
  asRecord,
  createArtifactKindRegistry,
  defineArtifactKind,
  registerArtifactKind,
  rejectedPayload,
} from '$lib/artifact_kinds';
import { createArtifact, listArtifacts, resetArtifactIndex } from '$lib/artifacts';
import { createProject, resetProjectIndex } from '$lib/projects';
import { closeVault, writeArtifactSummaryRecord } from '$lib/vault_db';
import { writeProjectWorkspace } from '$lib/workspaces';

import {
  appVersion,
  buildArtifactExportFile,
  buildProjectExportFile,
  exportFileName,
} from './vault_file_export';
import { parseExportFile } from './vault_file_format';

/**
 * A kind that stores whatever it is given, so a test can put something in the database that the
 * exporter then has to cope with. The real kinds all validate their payloads, which is exactly
 * what makes them unable to stand in for the legacy and malformed data an export must not refuse.
 */
const anythingKind = defineArtifactKind<unknown, unknown>({
  kind: 'test.anything',
  displayName: 'Anything',
  payloadVersion: 1,
  loadCodec: () =>
    Promise.resolve({ toSnapshot: (value) => value, fromSnapshot: (snapshot) => snapshot }),
  nameOf: () => 'Anything',
  validate: (payload) =>
    asRecord(payload) === null
      ? rejectedPayload('invalid-payload', 'not an object')
      : acceptedPayload(payload),
  migrate: (_payload, from) =>
    rejectedPayload('unsupported-version', `no step from version ${from}`),
});

function testKinds() {
  const registry = createArtifactKindRegistry();
  registerArtifactKind(registry, anythingKind);
  return registry;
}

const EXPORTED_AT = Date.parse('2026-08-17T09:30:00.000Z');

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

async function seedProject(name = 'Aldia'): Promise<string> {
  const project = await createProject({ name, description: 'A place', tags: ['setting'] });
  if (!project.ok) {
    throw new Error('the test project could not be created');
  }
  return project.value.id;
}

async function seedArtifact(
  projectId: string,
  payload: unknown,
  overrides: { name?: string; id?: string } = {},
): Promise<string> {
  const created = await createArtifact(
    testKinds(),
    { projectId, kind: anythingKind.kind, payload, name: overrides.name ?? 'A thing' },
    { id: overrides.id, now: EXPORTED_AT },
  );
  if (!created.ok) {
    throw new Error(`the test artifact could not be created: ${created.message}`);
  }
  return created.value.id;
}

describe('exportFileName', () => {
  it('names a file for what it holds and the day it was made', () => {
    expect(exportFileName('project', 'Aldia', '2026-08-17T09:30:00.000Z')).toBe(
      'ironarachne-aldia-2026-08-17.json',
    );
  });

  it('reduces a name with punctuation to something a file system can hold', () => {
    expect(exportFileName('artifact', 'Ka’ren — the Deep!', '2026-08-17T00:00:00.000Z')).toBe(
      'ironarachne-ka-ren-the-deep-2026-08-17.json',
    );
  });

  it('falls back to the scope when a name reduces to nothing', () => {
    expect(exportFileName('project', '???', '2026-08-17T00:00:00.000Z')).toBe(
      'ironarachne-project-2026-08-17.json',
    );
    expect(exportFileName('vault', '', '2026-08-17T00:00:00.000Z')).toBe(
      'ironarachne-vault-2026-08-17.json',
    );
  });
});

describe('appVersion', () => {
  it('is the released version, substituted at build time', () => {
    expect(appVersion()).toMatch(/^\d+\.\d+\.\d+/);
  });
});

describe('buildProjectExportFile', () => {
  it('writes the project, its artifacts, and a header that describes the file', async () => {
    const projectId = await seedProject();
    await seedArtifact(projectId, { text: 'first' }, { name: 'First' });
    await seedArtifact(projectId, { text: 'second' }, { name: 'Second' });

    const built = await buildProjectExportFile(projectId, { now: EXPORTED_AT });
    expect(built.ok).toBe(true);
    if (!built.ok) {
      return;
    }
    expect(built.value.fileName).toBe('ironarachne-aldia-2026-08-17.json');
    expect(built.value.issues).toEqual([]);
    expect(built.value.envelope.scope).toBe('project');
    expect(built.value.envelope.exportedAt).toBe('2026-08-17T09:30:00.000Z');
    expect(built.value.envelope.vaultId).not.toBe('');
    expect(built.value.envelope.checksum).toMatch(/^[0-9a-f]{64}$/);

    const parsed = await parseExportFile(built.value.text);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok || parsed.envelope.scope !== 'project') {
      return;
    }
    expect(parsed.checksum).toBe('ok');
    expect(parsed.envelope.body.project.name).toBe('Aldia');
    expect(parsed.envelope.body.project.description).toBe('A place');
    expect(parsed.envelope.body.artifacts.map((artifact) => artifact.name).sort()).toEqual([
      'First',
      'Second',
    ]);
  });

  it('sorts artifacts by id, so two exports of unchanged content are byte-identical', async () => {
    const projectId = await seedProject();
    await seedArtifact(projectId, { text: 'b' }, { id: 'zzz', name: 'Last' });
    await seedArtifact(projectId, { text: 'a' }, { id: 'aaa', name: 'First' });

    const first = await buildProjectExportFile(projectId, { now: EXPORTED_AT });
    const second = await buildProjectExportFile(projectId, { now: EXPORTED_AT });
    expect(first.ok && second.ok).toBe(true);
    if (!first.ok || !second.ok) {
      return;
    }
    expect(first.value.text).toBe(second.value.text);
    if (first.value.envelope.scope === 'project') {
      expect(first.value.envelope.body.artifacts.map((artifact) => artifact.id)).toEqual([
        'aaa',
        'zzz',
      ]);
    }
  });

  it('carries the bench when the project has one', async () => {
    const projectId = await seedProject();
    const artifactId = await seedArtifact(projectId, { text: 'a' });
    await writeProjectWorkspace({
      projectId,
      workspaceVersion: 1,
      panels: [{ order: 0, artifactId }],
    });

    const built = await buildProjectExportFile(projectId, { now: EXPORTED_AT });
    if (!built.ok || built.value.envelope.scope !== 'project') {
      expect.unreachable('a project export should carry a project body');
      return;
    }
    expect(built.value.envelope.body.workspace?.panels).toEqual([{ order: 0, artifactId }]);
  });

  it('leaves the bench out when there is nothing on it', async () => {
    const projectId = await seedProject();
    const built = await buildProjectExportFile(projectId, { now: EXPORTED_AT });
    if (!built.ok || built.value.envelope.scope !== 'project') {
      expect.unreachable('a project export should carry a project body');
      return;
    }
    expect(built.value.envelope.body.workspace).toBeUndefined();
  });

  it('does not carry byteSize, which is a fact about this browser rather than about the work', async () => {
    const projectId = await seedProject();
    await seedArtifact(projectId, { text: 'a' });
    const built = await buildProjectExportFile(projectId, { now: EXPORTED_AT });
    if (!built.ok || built.value.envelope.scope !== 'project') {
      return;
    }
    expect(built.value.envelope.body.artifacts[0]).not.toHaveProperty('byteSize');
  });

  it('reports a project that is not there rather than writing an empty file', async () => {
    const built = await buildProjectExportFile('nobody');
    expect(built).toMatchObject({ ok: false, reason: 'not-found' });
  });

  it('exports an artifact whose payload is missing, and says so', async () => {
    const projectId = await seedProject();
    const artifactId = await seedArtifact(projectId, { text: 'a' }, { name: 'Ghost' });
    const [summary] = listArtifacts(projectId);
    // A summary with no payload beside it: the state a half-written record leaves behind, and one
    // an export has to survive rather than refuse.
    await writeArtifactSummaryRecord({ ...summary, id: `${artifactId}-orphan` });
    resetArtifactIndex();

    const built = await buildProjectExportFile(projectId, { now: EXPORTED_AT });
    if (!built.ok || built.value.envelope.scope !== 'project') {
      expect.unreachable('a project export should carry a project body');
      return;
    }
    expect(built.value.issues).toHaveLength(1);
    expect(built.value.issues[0]).toMatch(/no stored payload/);
    const orphan = built.value.envelope.body.artifacts.find(
      (artifact) => artifact.id === `${artifactId}-orphan`,
    );
    expect(orphan?.payload).toBeNull();
  });

  it('reports a payload that cannot be written rather than throwing', async () => {
    const projectId = await seedProject();
    const cyclic: Record<string, unknown> = { name: 'loop' };
    cyclic.self = cyclic;
    await seedArtifact(projectId, cyclic, { name: 'Loop' });

    const built = await buildProjectExportFile(projectId, { now: EXPORTED_AT });
    if (!built.ok || built.value.envelope.scope !== 'project') {
      expect.unreachable('a project export should carry a project body');
      return;
    }
    expect(built.value.issues[0]).toMatch(/could not be written/);
    expect(built.value.envelope.body.artifacts[0].payload).toBeNull();
    // And the file it produced is still a file: a backup that throws is no backup at all.
    expect((await parseExportFile(built.value.text)).ok).toBe(true);
  });
});

describe('buildArtifactExportFile', () => {
  it('writes one artifact, with the references it had', async () => {
    const projectId = await seedProject();
    const targetId = await seedArtifact(projectId, { text: 'target' }, { name: 'Target' });
    const created = await createArtifact(testKinds(), {
      projectId,
      kind: anythingKind.kind,
      payload: { text: 'source' },
      name: 'Source',
      references: [{ targetId, targetKind: anythingKind.kind, role: 'uses' }],
    });
    if (!created.ok) {
      throw new Error('the referring artifact could not be created');
    }

    const built = await buildArtifactExportFile(projectId, created.value.id, { now: EXPORTED_AT });
    if (!built.ok || built.value.envelope.scope !== 'artifact') {
      expect.unreachable('an artifact export should carry an artifact body');
      return;
    }
    expect(built.value.fileName).toBe('ironarachne-source-2026-08-17.json');
    expect(built.value.envelope.body.artifact.references).toEqual([
      { targetId, targetKind: anythingKind.kind, role: 'uses' },
    ]);
  });

  it('reports an artifact that is not in that project', async () => {
    const projectId = await seedProject();
    expect(await buildArtifactExportFile(projectId, 'nobody')).toMatchObject({
      ok: false,
      reason: 'not-found',
    });
  });
});
