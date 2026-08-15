import { describe, expect, it } from 'vitest';

import type { ArtifactSummary } from '$lib/artifacts';
import type { Project } from '$lib/projects';

import { summarizeProjectUsage, totalAttributedBytes } from './project_usage';

function project(id: string): Project {
  return { id, name: id, tags: [], createdAt: 1, updatedAt: 1 };
}

function artifact(id: string, projectId: string, byteSize: number): ArtifactSummary {
  return {
    id,
    projectId,
    kind: 'note',
    name: id,
    tags: [],
    references: [],
    payloadVersion: 1,
    byteSize,
    createdAt: 1,
    updatedAt: 1,
  };
}

describe('attributing usage to projects', () => {
  it('counts and sums a project’s artifacts', () => {
    const usage = summarizeProjectUsage(
      [project('ashfall')],
      [artifact('a', 'ashfall', 300), artifact('b', 'ashfall', 45)],
      new Map(),
    );

    expect(usage).toEqual([{ projectId: 'ashfall', artifactCount: 2, byteSize: 345 }]);
  });

  it('lists a project with no artifacts at zero rather than omitting it', () => {
    const usage = summarizeProjectUsage([project('empty')], [], new Map());

    expect(usage).toEqual([{ projectId: 'empty', artifactCount: 0, byteSize: 0 }]);
  });

  it('orders the largest project first, because that is the question being asked', () => {
    const usage = summarizeProjectUsage(
      [project('small'), project('large'), project('middle')],
      [
        artifact('a', 'small', 10),
        artifact('b', 'large', 900),
        artifact('c', 'middle', 100),
        artifact('d', 'middle', 50),
      ],
      new Map(),
    );

    expect(usage.map((entry) => entry.projectId)).toEqual(['large', 'middle', 'small']);
  });

  it('breaks a tie on size by artifact count and then by id, so the order is total', () => {
    const usage = summarizeProjectUsage(
      [project('zulu'), project('omega'), project('alpha'), project('busy')],
      [artifact('a', 'busy', 50), artifact('b', 'busy', 50), artifact('c', 'zulu', 100)],
      new Map(),
    );

    expect(usage.map((entry) => entry.projectId)).toEqual(['busy', 'zulu', 'alpha', 'omega']);
  });

  it('carries the export stamp of a project that has one, and only of that project', () => {
    const usage = summarizeProjectUsage(
      [project('exported'), project('never')],
      [],
      new Map([['exported', 1700]]),
    );

    expect(usage.find((entry) => entry.projectId === 'exported')?.lastExportAt).toBe(1700);
    const never = usage.find((entry) => entry.projectId === 'never');
    expect(never !== undefined && 'lastExportAt' in never).toBe(false);
  });

  it('ignores a stamp for a project that is not there', () => {
    const usage = summarizeProjectUsage([project('ashfall')], [], new Map([['gone', 1700]]));

    expect(usage).toEqual([{ projectId: 'ashfall', artifactCount: 0, byteSize: 0 }]);
  });

  it('counts an artifact whose project is gone nowhere, rather than inventing a row', () => {
    const usage = summarizeProjectUsage(
      [project('ashfall')],
      [artifact('a', 'ashfall', 10), artifact('orphan', 'deleted', 999)],
      new Map(),
    );

    expect(usage).toEqual([{ projectId: 'ashfall', artifactCount: 1, byteSize: 10 }]);
  });

  it('attributes nothing when there are no projects', () => {
    expect(summarizeProjectUsage([], [artifact('a', 'gone', 10)], new Map())).toEqual([]);
  });
});

describe('the attributed total', () => {
  it('adds every project’s sum', () => {
    const usage = summarizeProjectUsage(
      [project('one'), project('two')],
      [artifact('a', 'one', 300), artifact('b', 'two', 45)],
      new Map(),
    );

    expect(totalAttributedBytes(usage)).toBe(345);
  });

  it('is zero for an empty vault', () => {
    expect(totalAttributedBytes([])).toBe(0);
  });
});
