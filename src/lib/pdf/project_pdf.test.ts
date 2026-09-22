import { IDBFactory } from 'fake-indexeddb';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createArtifact, resetArtifactIndex } from '$lib/artifacts';
import { closeVault } from '$lib/vault_db';
import { createProject, resetProjectIndex } from '$lib/projects';
import { ARTIFACT_KINDS } from '$lib/workshop';

import {
  buildProjectPdf,
  collectProjectPdfArtifacts,
  downloadProjectPdf,
  projectArtifactPayloadToLines,
  projectPdfFilename,
} from './project_pdf';

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

describe('projectArtifactPayloadToLines', () => {
  it('turns nested artifact data into readable labelled lines', () => {
    expect(
      projectArtifactPayloadToLines({
        name: 'Ashfall',
        details: { people: 3 },
        tags: ['one', 'two'],
      }),
    ).toEqual([
      'name: Ashfall',
      'details:',
      '  people: 3',
      'tags:',
      '  -',
      '    one',
      '  -',
      '    two',
    ]);
  });

  it('represents empty collections instead of omitting them', () => {
    expect(projectArtifactPayloadToLines({ entries: [] })).toEqual(['entries:', '  None']);
  });

  it('formats scalar values and empty objects', () => {
    expect(projectArtifactPayloadToLines(null)).toEqual(['None']);
    expect(projectArtifactPayloadToLines(false)).toEqual(['false']);
    expect(projectArtifactPayloadToLines({})).toEqual(['None']);
  });
});

describe('project PDF export', () => {
  it('uses a safe project filename', () => {
    expect(projectPdfFilename('Ashfall: The Deep!')).toBe('ashfall-the-deep.pdf');
    expect(projectPdfFilename('???')).toBe('project.pdf');
  });

  it('builds a cover PDF for an empty project', async () => {
    const created = await createProject({
      name: 'Ashfall',
      description: 'A place',
      genre: 'fantasy',
    });
    if (!created.ok) throw new Error(created.message);
    const blob = await buildProjectPdf(created.value.id);
    expect(blob?.type).toBe('application/pdf');
    expect(blob?.size).toBeGreaterThan(0);
  });

  it('includes readable artifacts and persisted SVG assets', async () => {
    const created = await createProject({ name: 'Ashfall' });
    if (!created.ok) throw new Error(created.message);
    const saved = await createArtifact(ARTIFACT_KINDS, {
      projectId: created.value.id,
      kind: 'chop-shop',
      name: 'Workshop notes',
      payload: { text: 'A unique project phrase' },
      assets: [
        {
          role: 'preview',
          mediaType: 'image/svg+xml',
          blob: new Blob(['<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"/>'], {
            type: 'image/svg+xml',
          }),
          width: 10,
          height: 10,
          sourceFingerprint: 'test',
          rendererId: 'test',
          rendererVersion: '1',
        },
      ],
    });
    if (!saved.ok) throw new Error(saved.message);
    expect(await collectProjectPdfArtifacts(created.value.id)).toHaveLength(1);
    const blob = await buildProjectPdf(created.value.id);
    expect(new TextDecoder('latin1').decode(await blob!.arrayBuffer())).toContain(
      'A unique project phrase',
    );
  });

  it('returns undefined for an unknown project', async () => {
    expect(await buildProjectPdf('missing')).toBeUndefined();
    expect(await downloadProjectPdf('missing')).toBeUndefined();
  });
});
