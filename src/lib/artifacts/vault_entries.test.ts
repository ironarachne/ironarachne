import { describe, expect, it } from 'vitest';

import type { ArtifactSummary } from './artifact_types';
import {
  ORPHANED_PROJECT_NAME,
  filterVaultEntriesByProject,
  toVaultEntries,
  vaultProjectNames,
} from './vault_entries';

function summary(id: string, projectId: string): ArtifactSummary {
  return {
    id,
    projectId,
    kind: 'culture',
    name: id,
    references: [],
    payloadVersion: 1,
    byteSize: 0,
    tags: [],
    createdAt: 0,
    updatedAt: 0,
  } as ArtifactSummary;
}

const names = new Map([
  ['p1', 'Ashfall'],
  ['p2', 'Dolmenwood'],
]);

describe('toVaultEntries', () => {
  it('names each artifact’s project', () => {
    const entries = toVaultEntries([summary('a', 'p1'), summary('b', 'p2')], names);

    expect(entries.map((entry) => entry.projectName)).toEqual(['Ashfall', 'Dolmenwood']);
  });

  it('preserves the order it was given', () => {
    const entries = toVaultEntries([summary('b', 'p2'), summary('a', 'p1')], names);

    expect(entries.map((entry) => entry.artifact.id)).toEqual(['b', 'a']);
  });

  it('lists an artifact whose project is gone rather than dropping it', () => {
    // The vault answers "what do I have". Quietly omitting the user's work is the one thing it
    // must not do, even for a state that should be impossible.
    const entries = toVaultEntries([summary('orphan', 'vanished')], names);

    expect(entries).toHaveLength(1);
    expect(entries[0].projectName).toBe(ORPHANED_PROJECT_NAME);
  });

  it('returns nothing for nothing', () => {
    expect(toVaultEntries([], names)).toEqual([]);
  });
});

describe('vaultProjectNames', () => {
  it('lists each project once, alphabetically', () => {
    const entries = toVaultEntries(
      [summary('a', 'p2'), summary('b', 'p1'), summary('c', 'p2')],
      names,
    );

    expect(vaultProjectNames(entries)).toEqual(['Ashfall', 'Dolmenwood']);
  });

  it('is empty for an empty vault', () => {
    expect(vaultProjectNames([])).toEqual([]);
  });
});

describe('filterVaultEntriesByProject', () => {
  const entries = toVaultEntries([summary('a', 'p1'), summary('b', 'p2')], names);

  it('keeps only the named project', () => {
    expect(
      filterVaultEntriesByProject(entries, 'Ashfall').map((entry) => entry.artifact.id),
    ).toEqual(['a']);
  });

  it('does not narrow when no project is named', () => {
    expect(filterVaultEntriesByProject(entries)).toHaveLength(2);
    expect(filterVaultEntriesByProject(entries, '')).toHaveLength(2);
  });

  it('returns nothing for a project that is not present', () => {
    expect(filterVaultEntriesByProject(entries, 'Nowhere')).toEqual([]);
  });
});
