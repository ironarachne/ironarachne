import { describe, expect, it } from 'vitest';

import { describeImportSummary } from './vault_file_summary';
import type { QuarantinedArtifact } from '$lib/quarantine';

import type { ImportSummary } from './vault_file_types';

function summary(overrides: Partial<ImportSummary> = {}): ImportSummary {
  return {
    mode: 'merge',
    scope: 'project',
    projectsAdded: 0,
    artifactsAdded: 0,
    projectsRemoved: 0,
    artifactsRemoved: 0,
    nameCollisions: [],
    remintedIds: {},
    quarantined: [],
    duplicateIds: [],
    fromThisVault: false,
    checksum: 'ok',
    formatMigrated: false,
    ...overrides,
  };
}

function quarantined(overrides: Partial<QuarantinedArtifact> = {}): QuarantinedArtifact {
  return {
    id: 'artifact-1',
    projectId: 'project-1',
    kind: 'culture',
    name: 'A culture',
    raw: {},
    reason: 'unknown-kind',
    message: 'no such kind',
    ...overrides,
  };
}

describe('describeImportSummary', () => {
  it('reports project and artifact totals on separate lines for additions and removals', () => {
    const [added, removed] = describeImportSummary(
      summary({ projectsAdded: 1, artifactsAdded: 12, projectsRemoved: 4, artifactsRemoved: 212 }),
    );

    expect(added).toMatch(/\b1 project\b.*\b12 artifacts\b/i);
    expect(removed).toMatch(/\b4 projects\b.*\b212 artifacts\b/i);
  });

  it('distinguishes an artifact-only import from an import that added nothing', () => {
    const [added] = describeImportSummary(summary({ scope: 'artifact', artifactsAdded: 1 }));
    const [empty] = describeImportSummary(summary());

    expect(added).toMatch(/\b1 artifact\b/i);
    expect(empty.trim()).not.toBe('');
    expect(empty).not.toMatch(/\d/);
  });

  it('names what was quarantined and why', () => {
    const lines = describeImportSummary(
      summary({
        artifactsAdded: 1,
        quarantined: [
          quarantined({ name: 'Alien', reason: 'unknown-kind' }),
          quarantined({ name: 'Broken', reason: 'invalid-payload' }),
          quarantined({ name: 'Ahead', reason: 'unsupported-version' }),
          quarantined({ name: 'Stuck', reason: 'migration-failed' }),
        ],
      }),
    );
    expect(lines[1]).toMatch(/\b4 artifacts\b/i);
    expect(lines[1]).toMatch(/Alien[^)]*no tool/i);
    expect(lines[1]).toMatch(/Broken[^)]*contents/i);
    expect(lines[1]).toMatch(/Ahead[^)]*newer build/i);
    expect(lines[1]).toMatch(/Stuck[^)]*older version/i);
  });

  it('stops naming quarantined records past a handful', () => {
    const many = Array.from({ length: 8 }, (_unused, index) =>
      quarantined({ name: `Record ${index}` }),
    );
    const lines = describeImportSummary(summary({ quarantined: many }));
    expect(lines[1].match(/Record \d+/g)).toEqual(many.slice(0, 5).map(({ name }) => name));
    expect(lines[1]).toMatch(/\b3 more\b/i);
  });

  it('falls back to the kind, then to a placeholder, for a record with no name', () => {
    expect(
      describeImportSummary(summary({ quarantined: [quarantined({ name: '' })] }))[1],
    ).toContain('culture');
    expect(
      describeImportSummary(summary({ quarantined: [quarantined({ name: '', kind: '' })] }))[1],
    ).toMatch(/unnamed/i);
  });

  it('names the project or artifact involved in a collision', () => {
    const lines = describeImportSummary(
      summary({ projectsAdded: 1, artifactsAdded: 0, nameCollisions: ['Aldia'] }),
    );
    expect(lines[1]).toMatch(/\bproject\b.*\bAldia\b/i);

    const artifactLines = describeImportSummary(
      summary({ scope: 'artifact', artifactsAdded: 1, nameCollisions: ['Twin'] }),
    );
    expect(artifactLines[1]).toMatch(/\bartifact\b.*\bTwin\b/i);
  });

  it('reports duplicated ids, reminted ids, migration, and a checksum that does not match', () => {
    const lines = describeImportSummary(
      summary({
        projectsAdded: 1,
        artifactsAdded: 2,
        duplicateIds: ['twice'],
        remintedIds: { a: 'a2', b: 'b2' },
        formatMigrated: true,
        checksum: 'mismatch',
        fromThisVault: true,
      }),
    );
    expect(lines).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/same id.*\b1 time\b/i),
        expect.stringMatching(/\b2 artifacts\b.*new ids/i),
        expect.stringMatching(/older format/i),
        expect.stringMatching(/checksum/i),
        expect.stringMatching(/this browser/i),
      ]),
    );
  });

  it('says nothing about a checksum that was never checked', () => {
    const lines = describeImportSummary(summary({ checksum: 'unchecked', artifactsAdded: 1 }));
    expect(lines.some((line) => line.includes('checksum'))).toBe(false);
  });
});
