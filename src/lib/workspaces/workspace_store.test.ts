import { IDBFactory } from 'fake-indexeddb';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { closeVault, readWorkspaceRecord, writeWorkspaceRecord } from '$lib/vault_db';

import {
  deleteProjectWorkspace,
  readProjectWorkspace,
  writeProjectWorkspace,
} from './workspace_store';
import { emptyWorkspace, withPanelOpened } from './workspaces';
import { WORKSPACE_VERSION } from './workspace_types';

beforeEach(() => {
  closeVault();
  vi.stubGlobal('indexedDB', new IDBFactory());
});

afterEach(() => {
  closeVault();
  vi.unstubAllGlobals();
});

/** A browser with no IndexedDB at all — a private window, or a page being prerendered. */
function takeTheDatabaseAway(): void {
  closeVault();
  vi.stubGlobal('indexedDB', undefined);
}

describe('readProjectWorkspace', () => {
  it('is an empty bench for a project that has never had one', async () => {
    expect(await readProjectWorkspace('p1')).toEqual(emptyWorkspace('p1'));
  });

  it('reads back what was written', async () => {
    const bench = withPanelOpened(emptyWorkspace('p1'), { toolPath: '/culture' });
    await writeProjectWorkspace(bench);

    expect(await readProjectWorkspace('p1')).toEqual(bench);
  });

  it('keeps one project’s bench out of another’s', async () => {
    await writeProjectWorkspace(withPanelOpened(emptyWorkspace('p1'), { toolPath: '/culture' }));

    expect(await readProjectWorkspace('p2').then((bench) => bench.panels)).toEqual([]);
  });

  it('resets to an empty bench when the stored shape cannot be read', async () => {
    await writeWorkspaceRecord('p1', { projectId: 'p1', workspaceVersion: 99, panels: [] });

    expect(await readProjectWorkspace('p1')).toEqual(emptyWorkspace('p1'));
  });

  it('resets to an empty bench when the stored record names another project', async () => {
    await writeWorkspaceRecord('p1', {
      projectId: 'p2',
      workspaceVersion: WORKSPACE_VERSION,
      panels: [{ order: 0, toolPath: '/culture' }],
    });

    expect(await readProjectWorkspace('p1')).toEqual(emptyWorkspace('p1'));
  });

  it('resets to an empty bench when the database cannot be reached', async () => {
    takeTheDatabaseAway();

    expect(await readProjectWorkspace('p1')).toEqual(emptyWorkspace('p1'));
  });
});

describe('writeProjectWorkspace', () => {
  it('reports a database that refused, rather than throwing', async () => {
    takeTheDatabaseAway();

    const written = await writeProjectWorkspace(emptyWorkspace('p1'));

    expect(written.ok).toBe(false);
  });

  it('replaces the bench rather than accumulating benches', async () => {
    await writeProjectWorkspace(withPanelOpened(emptyWorkspace('p1'), { toolPath: '/culture' }));
    await writeProjectWorkspace(withPanelOpened(emptyWorkspace('p1'), { artifactId: 'a1' }));

    expect((await readProjectWorkspace('p1')).panels).toEqual([{ order: 0, artifactId: 'a1' }]);
  });
});

describe('deleteProjectWorkspace', () => {
  it('leaves the project with an empty bench', async () => {
    await writeProjectWorkspace(withPanelOpened(emptyWorkspace('p1'), { toolPath: '/culture' }));

    await deleteProjectWorkspace('p1');

    expect(await readWorkspaceRecord('p1').then((stored) => stored.ok && stored.value)).toBe(
      undefined,
    );
    expect(await readProjectWorkspace('p1')).toEqual(emptyWorkspace('p1'));
  });

  it('reports a database that refused', async () => {
    takeTheDatabaseAway();

    expect((await deleteProjectWorkspace('p1')).ok).toBe(false);
  });
});
