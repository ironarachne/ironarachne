import { IDBFactory } from 'fake-indexeddb';
import { readFile } from 'node:fs/promises';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createArtifact, resetArtifactIndex, type ArtifactAssetRead } from '$lib/artifacts';
import { closeVault } from '$lib/vault_db';
import { createProject, resetProjectIndex } from '$lib/projects';
import { ARTIFACT_KINDS } from '$lib/workshop';
import { rollPotion, toPotionSnapshot } from '$lib/potions';

import {
  buildProjectPdf,
  collectProjectPdfArtifacts,
  downloadProjectPdf,
  buildProjectPdfResult,
  projectPdfFilename,
} from './project_pdf';
import { PRESENTERS, presentationMarkdownToBlocks } from './project_publication';
import { renderProjectBook } from './project_book_layout';

function savedImage(blob: Blob, width: number, height: number): ArtifactAssetRead {
  return {
    metadata: {
      id: 'image',
      artifactId: 'one',
      role: 'primary-preview',
      mediaType: blob.type,
      byteSize: blob.size,
      width,
      height,
      sourceFingerprint: 'test',
      rendererId: 'test',
      rendererVersion: '1',
      createdAt: 0,
    },
    blob,
  };
}

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

describe('publication presenters', () => {
  it('covers every readable artifact kind', () => {
    expect(Object.keys(PRESENTERS).sort()).toEqual([...ARTIFACT_KINDS.byKind.keys()].sort());
  });

  it('loads every artifact presentation without a missing export', async () => {
    const presenters = await Promise.all(Object.values(PRESENTERS).map((load) => load()));
    expect(presenters.every((presenter) => typeof presenter === 'function')).toBe(true);
  });

  it('turns reader-facing Markdown into structured book blocks', () => {
    expect(
      presentationMarkdownToBlocks(
        '# A potion\n\n- Rarity: rare\n- Value: 1 gp\n\n## Effect\n\nRestores health.',
      ),
    ).toEqual([
      {
        type: 'facts',
        facts: [
          { label: 'Rarity', value: 'rare' },
          { label: 'Value', value: '1 gp' },
        ],
      },
      { type: 'heading', level: 2, text: 'Effect' },
      { type: 'paragraph', text: 'Restores health.' },
    ]);
  });

  it('keeps list, table, and inline text structure for the compositor', () => {
    expect(
      presentationMarkdownToBlocks(
        '## **Crew**\n\n- First sailor\n- Second sailor\n\n| Name | Role |\n| --- | --- |\n| Ada | Captain |\n\n> Keep watch.\n> Stay ready.\n\nSee [the chart](https://example.com).',
      ),
    ).toEqual([
      { type: 'heading', level: 2, text: 'Crew' },
      { type: 'list', ordered: false, items: ['First sailor', 'Second sailor'] },
      { type: 'table', columns: ['Name', 'Role'], rows: [['Ada', 'Captain']] },
      { type: 'quote', text: 'Keep watch. Stay ready.' },
      { type: 'paragraph', text: 'See the chart.' },
    ]);
  });
});

describe('project PDF export', () => {
  it('embeds a saved primary image and carries a long description onto a project page', async () => {
    const png = new Uint8Array(
      await readFile(new URL('../../../static/favicon-32x32.png', import.meta.url)),
    );
    const image = savedImage(new Blob([png], { type: 'image/png' }), 32, 32);
    const result = await renderProjectBook({
      title: 'Illustrated places',
      description: 'A campaign of long journeys and forgotten cities. '.repeat(30),
      setting: ['Genre: fantasy'],
      entries: [
        {
          sourceId: 'one',
          title: 'The gate',
          kindLabel: 'Location',
          status: 'ready',
          warnings: [],
          blocks: [
            { type: 'image', asset: image },
            { type: 'paragraph', text: 'A guarded gate.' },
          ],
        },
      ],
    });
    const source = new TextDecoder('latin1').decode(await result.blob.arrayBuffer());
    expect(source).toContain('/Subtype /Image');
    expect(source).toContain('About this project');
    expect(source).toContain('A guarded gate.');
    expect(result.warnings).toEqual([]);
  });

  it('names a saved image that cannot be rendered', async () => {
    const result = await renderProjectBook({
      title: 'Lost maps',
      setting: [],
      entries: [
        {
          sourceId: 'one',
          title: 'The lost map',
          kindLabel: 'Map',
          status: 'ready',
          warnings: [],
          blocks: [
            {
              type: 'image',
              asset: savedImage(new Blob(['<svg/>'], { type: 'image/svg+xml' }), 2, 2),
            },
          ],
        },
      ],
    });
    expect(result.incompleteEntries).toEqual(['The lost map']);
    expect(result.warnings).toEqual(['A saved image for “The lost map” could not be included.']);
  });

  it('keeps long names and table content across contents and body pages', async () => {
    const title = 'The unusually long chronicle of the northern and southern watch towers';
    const entries = Array.from({ length: 24 }, (_, index) => ({
      sourceId: `entry-${index}`,
      title: `${title} ${index + 1}`,
      kindLabel: 'Location',
      status: 'ready' as const,
      warnings: [],
      blocks: [
        {
          type: 'table' as const,
          columns: ['Name', 'Story'],
          rows: [[`Tower ${index + 1}`, `Beginning ${'A long account. '.repeat(180)} Ending`]],
        },
      ],
    }));
    const result = await renderProjectBook({ title: 'Chronicles', setting: [], entries });
    const source = new TextDecoder('latin1').decode(await result.blob.arrayBuffer());
    expect((source.match(/\/Type \/Page\b/g) ?? []).length).toBeGreaterThan(entries.length + 2);
    expect(source).toContain('Ending');
    expect(source).toContain(title);
    expect(result.warnings).toEqual([]);
  });

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

  it('uses the saved artifact presentation rather than its payload keys', async () => {
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
    const entries = await collectProjectPdfArtifacts(created.value.id);
    expect(entries).toHaveLength(1);
    expect(entries[0].blocks).toContainEqual({
      type: 'paragraph',
      text: 'A unique project phrase',
    });
    expect(entries[0].blocks.some((block) => block.type === 'image')).toBe(true);
    const result = await buildProjectPdfResult(created.value.id);
    const blob = result?.blob;
    expect(new TextDecoder('latin1').decode(await blob!.arrayBuffer())).toContain(
      'A unique project phrase',
    );
    expect(new TextDecoder('latin1').decode(await blob!.arrayBuffer())).not.toContain('text:');
  });

  it('prints a saved potion using its authored document sections', async () => {
    const created = await createProject({ name: 'Elixirs' });
    if (!created.ok) throw new Error(created.message);
    const potion = toPotionSnapshot(
      rollPotion('project-pdf-potion', { allowHomebrew: false, allowProceduralNames: false }),
    );
    const saved = await createArtifact(ARTIFACT_KINDS, {
      projectId: created.value.id,
      kind: 'potion',
      name: 'Curated potion',
      payload: { ...potion, displayName: 'A saved elixir' },
    });
    if (!saved.ok) throw new Error(saved.message);
    const [entry] = await collectProjectPdfArtifacts(created.value.id);
    expect(entry.status).toBe('ready');
    expect(entry.title).toBe('Curated potion');
    expect(entry.blocks).toContainEqual({ type: 'heading', level: 2, text: 'Effect' });
    expect(entry.blocks.some((block) => block.type === 'facts')).toBe(true);
    expect(
      entry.blocks.some(
        (block) => block.type === 'paragraph' && block.text.includes('A saved elixir'),
      ),
    ).toBe(false);
  });

  it('returns undefined for an unknown project', async () => {
    expect(await buildProjectPdf('missing')).toBeUndefined();
    expect(await downloadProjectPdf('missing')).toBeUndefined();
  });
});
