import { describe, expect, it } from 'vitest';

import {
  canonicalJson,
  checksumOf,
  exportFileText,
  parseExportFile,
  tryCanonicalJson,
} from './vault_file_format';
import {
  EXPORT_FORMAT_MARKER,
  EXPORT_FORMAT_VERSION,
  type ExportEnvelope,
  type ExportFormatMigration,
  type ExportedArtifact,
} from './vault_file_types';

function exportedArtifact(overrides: Partial<ExportedArtifact> = {}): ExportedArtifact {
  return {
    id: 'artifact-1',
    projectId: 'project-1',
    kind: 'note',
    name: 'A note',
    tags: [],
    references: [],
    payloadVersion: 1,
    createdAt: 10,
    updatedAt: 20,
    payload: { text: 'hello' },
    ...overrides,
  };
}

function projectEnvelope(body: Record<string, unknown>): Record<string, unknown> {
  return {
    format: EXPORT_FORMAT_MARKER,
    formatVersion: EXPORT_FORMAT_VERSION,
    scope: 'project',
    exportedAt: '2026-08-17T00:00:00.000Z',
    appVersion: '2.4.0',
    vaultId: 'vault-1',
    checksum: '',
    body,
  };
}

const project = {
  id: 'project-1',
  name: 'Aldia',
  tags: ['setting'],
  createdAt: 1,
  updatedAt: 2,
};

/** A file as it would arrive, with a checksum that actually matches its body. */
async function sealedFile(envelope: Record<string, unknown>): Promise<string> {
  const checksum = await checksumOf(canonicalJson(envelope.body));
  return JSON.stringify({ ...envelope, checksum });
}

describe('canonicalJson', () => {
  it('sorts object keys at every depth', () => {
    expect(canonicalJson({ b: 1, a: { d: 2, c: 3 } })).toBe('{"a":{"c":3,"d":2},"b":1}');
  });

  it('leaves array order alone, because order is the data there', () => {
    expect(canonicalJson([3, 1, 2])).toBe('[3,1,2]');
  });

  it('drops keys with no JSON representation and nulls them inside arrays', () => {
    expect(canonicalJson({ a: undefined, b: 1 })).toBe('{"b":1}');
    expect(canonicalJson([undefined, 1])).toBe('[null,1]');
  });

  it('writes non-finite numbers as null, as JSON.stringify does', () => {
    expect(canonicalJson({ a: Number.NaN, b: Number.POSITIVE_INFINITY })).toBe(
      '{"a":null,"b":null}',
    );
  });

  it('honours toJSON, so a stored Date reads back as its ISO string', () => {
    expect(canonicalJson({ at: new Date('2026-08-17T00:00:00.000Z') })).toBe(
      '{"at":"2026-08-17T00:00:00.000Z"}',
    );
  });

  it('drops a bigint rather than throwing, so one field cannot cost a whole backup', () => {
    expect(canonicalJson({ a: 1n, b: 2 })).toBe('{"b":2}');
  });

  it('handles null and repeated references that are not cycles', () => {
    const shared = { a: 1 };
    expect(canonicalJson({ x: shared, y: shared, z: null })).toBe(
      '{"x":{"a":1},"y":{"a":1},"z":null}',
    );
  });

  it('throws on a value that refers to itself', () => {
    const cyclic: Record<string, unknown> = { name: 'loop' };
    cyclic.self = cyclic;
    expect(() => canonicalJson(cyclic)).toThrow(/refers to itself/);
    expect(tryCanonicalJson(cyclic)).toBeUndefined();
  });

  it('reports a serialisable value through tryCanonicalJson', () => {
    expect(tryCanonicalJson({ b: 1, a: 2 })).toBe('{"a":2,"b":1}');
  });

  it('produces the same bytes for the same content written two ways', () => {
    expect(canonicalJson({ a: 1, b: [{ d: 1, c: 2 }] })).toBe(
      canonicalJson({ b: [{ c: 2, d: 1 }], a: 1 }),
    );
  });
});

describe('checksumOf', () => {
  it('is SHA-256 hex of the canonical body', async () => {
    const checksum = await checksumOf(canonicalJson({ a: 1 }));
    expect(checksum).toMatch(/^[0-9a-f]{64}$/);
    expect(await checksumOf(canonicalJson({ a: 1 }))).toBe(checksum);
    expect(await checksumOf(canonicalJson({ a: 2 }))).not.toBe(checksum);
  });
});

describe('exportFileText', () => {
  it('writes the header before the body, so a file says what it is in its first line', () => {
    const envelope: ExportEnvelope = {
      format: EXPORT_FORMAT_MARKER,
      formatVersion: EXPORT_FORMAT_VERSION,
      scope: 'artifact',
      exportedAt: '2026-08-17T00:00:00.000Z',
      appVersion: '2.4.0',
      vaultId: 'vault-1',
      checksum: 'abc',
      body: { artifact: exportedArtifact() },
    };
    const text = exportFileText(envelope);
    expect(text.indexOf('"format"')).toBeLessThan(text.indexOf('"body"'));
    expect(JSON.parse(text)).toMatchObject({ scope: 'artifact', checksum: 'abc' });
  });
});

describe('parseExportFile', () => {
  it('reads a project file back into a typed envelope', async () => {
    const text = await sealedFile(
      projectEnvelope({ project, artifacts: [exportedArtifact()], workspace: undefined }),
    );
    const result = await parseExportFile(text);
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.envelope.scope).toBe('project');
    expect(result.checksum).toBe('ok');
    expect(result.formatMigrated).toBe(false);
    expect(result.quarantined).toEqual([]);
    if (result.envelope.scope === 'project') {
      expect(result.envelope.body.project.name).toBe('Aldia');
      expect(result.envelope.body.artifacts).toHaveLength(1);
      expect(result.envelope.body.artifacts[0].payload).toEqual({ text: 'hello' });
    }
  });

  it('carries a bench when the file has one, and drops one it cannot read', async () => {
    const withBench = await sealedFile(
      projectEnvelope({
        project,
        artifacts: [],
        workspace: { projectId: 'project-1', workspaceVersion: 1, panels: [] },
      }),
    );
    const parsedBench = await parseExportFile(withBench);
    expect(parsedBench.ok && parsedBench.envelope.scope === 'project').toBe(true);
    if (parsedBench.ok && parsedBench.envelope.scope === 'project') {
      expect(parsedBench.envelope.body.workspace?.projectId).toBe('project-1');
    }

    const brokenBench = await sealedFile(
      projectEnvelope({ project, artifacts: [], workspace: { panels: 'not a list' } }),
    );
    const parsedBroken = await parseExportFile(brokenBench);
    if (parsedBroken.ok && parsedBroken.envelope.scope === 'project') {
      expect(parsedBroken.envelope.body.workspace).toBeUndefined();
    }
  });

  it('rejects a truncated file as damaged rather than as a syntax error', async () => {
    const text = await sealedFile(projectEnvelope({ project, artifacts: [] }));
    const result = await parseExportFile(text.slice(0, text.length - 40));
    expect(result).toMatchObject({ ok: false, problem: 'damaged' });
    if (!result.ok) {
      expect(result.message).toMatch(/damaged or incomplete/);
    }
  });

  it('rejects a foreign JSON file by a different name than a damaged one', async () => {
    const result = await parseExportFile('{"some":"other file"}');
    expect(result).toMatchObject({ ok: false, problem: 'not-ours' });
  });

  it('rejects a file with no format version', async () => {
    const result = await parseExportFile(
      JSON.stringify({ format: EXPORT_FORMAT_MARKER, scope: 'project', body: {} }),
    );
    expect(result).toMatchObject({ ok: false, problem: 'malformed' });
  });

  it('rejects a file from a newer build, and never partially reads it', async () => {
    const text = await sealedFile({
      ...projectEnvelope({ project, artifacts: [] }),
      formatVersion: EXPORT_FORMAT_VERSION + 1,
    });
    const result = await parseExportFile(text);
    expect(result).toMatchObject({ ok: false, problem: 'newer-format' });
    if (!result.ok) {
      expect(result.message).toMatch(/newer version/);
    }
  });

  it('rejects an older file it has no migration step for', async () => {
    const text = await sealedFile({
      ...projectEnvelope({ project, artifacts: [] }),
      formatVersion: EXPORT_FORMAT_VERSION - 1,
    });
    const result = await parseExportFile(text);
    expect(result).toMatchObject({ ok: false, problem: 'unmigratable' });
  });

  it('migrates an older file forward through the chain', async () => {
    // The chain is empty in this build, so the step is supplied here. What is under test is that
    // an older file is brought forward at all rather than compared with `===` and thrown away.
    const migration: ExportFormatMigration = {
      from: EXPORT_FORMAT_VERSION - 1,
      migrate: (envelope) => ({
        ...envelope,
        body: {
          project,
          artifacts: [exportedArtifact({ name: 'renamed by the migration' })],
        },
      }),
    };
    const text = JSON.stringify({
      ...projectEnvelope({ oldShape: true }),
      formatVersion: EXPORT_FORMAT_VERSION - 1,
    });

    const result = await parseExportFile(text, { migrations: [migration] });
    expect(result.ok).toBe(true);
    if (!result.ok || result.envelope.scope !== 'project') {
      return;
    }
    expect(result.formatMigrated).toBe(true);
    expect(result.envelope.formatVersion).toBe(EXPORT_FORMAT_VERSION);
    expect(result.envelope.body.artifacts[0].name).toBe('renamed by the migration');
  });

  it('warns about a checksum that does not match, and reads the file anyway', async () => {
    const text = JSON.stringify({
      ...projectEnvelope({ project, artifacts: [exportedArtifact()] }),
      checksum: 'f'.repeat(64),
    });
    const result = await parseExportFile(text);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.checksum).toBe('mismatch');
    }
  });

  it('reports an absent checksum as unchecked rather than as a mismatch', async () => {
    const result = await parseExportFile(
      JSON.stringify(projectEnvelope({ project, artifacts: [] })),
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.checksum).toBe('unchecked');
    }
  });

  it('quarantines a record that is not an artifact and keeps the rest of the file', async () => {
    const text = await sealedFile(
      projectEnvelope({
        project,
        artifacts: [exportedArtifact(), { id: 'artifact-2', kind: 'note' }, 'not even an object'],
      }),
    );
    const result = await parseExportFile(text);
    expect(result.ok).toBe(true);
    if (!result.ok || result.envelope.scope !== 'project') {
      return;
    }
    expect(result.envelope.body.artifacts).toHaveLength(1);
    expect(result.quarantined).toHaveLength(2);
    expect(result.quarantined[0]).toMatchObject({ id: 'artifact-2', kind: 'note' });
    expect(result.quarantined[0].raw).toEqual({ id: 'artifact-2', kind: 'note' });
    expect(result.quarantined[1]).toMatchObject({ id: '', kind: '' });
  });

  it('reads a vault file rather than misreading it as a project', async () => {
    const text = await sealedFile({
      ...projectEnvelope({
        projects: [project],
        artifacts: [exportedArtifact()],
        workspaces: [{ projectId: 'project-1', workspaceVersion: 1, panels: [] }],
      }),
      scope: 'vault',
    });
    const result = await parseExportFile(text);
    expect(result.ok).toBe(true);
    if (!result.ok || result.envelope.scope !== 'vault') {
      expect.unreachable('a vault file should parse as a vault');
      return;
    }
    expect(result.envelope.body.projects).toHaveLength(1);
    expect(result.envelope.body.artifacts).toHaveLength(1);
    expect(result.envelope.body.workspaces).toHaveLength(1);
  });

  it('tolerates a vault body with nothing usable in it', async () => {
    const text = await sealedFile({ ...projectEnvelope({}), scope: 'vault' });
    const result = await parseExportFile(text);
    if (result.ok && result.envelope.scope === 'vault') {
      expect(result.envelope.body).toEqual({ projects: [], artifacts: [], workspaces: [] });
    }
  });

  it('rejects a file whose scope is not one of the three', async () => {
    const text = await sealedFile({ ...projectEnvelope({ project }), scope: 'everything' });
    const result = await parseExportFile(text);
    expect(result).toMatchObject({ ok: false, problem: 'malformed' });
  });

  it('rejects a project file with no readable project, and an artifact file with no artifact', async () => {
    const noProject = await sealedFile(projectEnvelope({ project: { id: '' }, artifacts: [] }));
    expect(await parseExportFile(noProject)).toMatchObject({ ok: false, problem: 'malformed' });

    const noArtifact = await sealedFile({
      ...projectEnvelope({ artifact: { id: 'artifact-1' } }),
      scope: 'artifact',
    });
    expect(await parseExportFile(noArtifact)).toMatchObject({ ok: false, problem: 'malformed' });
  });

  it('rejects a file with no body', async () => {
    const text = JSON.stringify({ ...projectEnvelope({}), body: 'not an object' });
    expect(await parseExportFile(text)).toMatchObject({ ok: false, problem: 'malformed' });
  });

  it('reads an artifact file', async () => {
    const text = await sealedFile({
      ...projectEnvelope({ artifact: exportedArtifact({ name: 'Solo' }) }),
      scope: 'artifact',
    });
    const result = await parseExportFile(text);
    expect(result.ok).toBe(true);
    if (result.ok && result.envelope.scope === 'artifact') {
      expect(result.envelope.body.artifact.name).toBe('Solo');
    }
  });

  it('repairs missing header diagnostics rather than refusing a file full of work', async () => {
    const text = JSON.stringify({
      format: EXPORT_FORMAT_MARKER,
      formatVersion: EXPORT_FORMAT_VERSION,
      scope: 'project',
      body: { project, artifacts: [] },
    });
    const result = await parseExportFile(text);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.envelope.exportedAt).toBe('');
      expect(result.envelope.appVersion).toBe('');
      expect(result.envelope.vaultId).toBe('');
    }
  });
});
