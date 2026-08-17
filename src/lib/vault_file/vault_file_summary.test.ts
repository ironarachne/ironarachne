import { describe, expect, it } from 'vitest';

import { describeImportSummary } from './vault_file_summary';
import type { ImportSummary, QuarantinedArtifact } from './vault_file_types';

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
  it('leads with what arrived, counted in the user’s terms', () => {
    expect(describeImportSummary(summary({ projectsAdded: 1, artifactsAdded: 12 }))[0]).toBe(
      'Added 1 project holding 12 artifacts.',
    );
  });

  it('says an artifact went into this project when there is no new project', () => {
    expect(describeImportSummary(summary({ scope: 'artifact', artifactsAdded: 1 }))[0]).toBe(
      'Added 1 artifact to this project.',
    );
  });

  it('says plainly when nothing arrived', () => {
    expect(describeImportSummary(summary())[0]).toBe('Nothing was added.');
  });

  it('counts removals, which is the half of a restore that loses data', () => {
    const lines = describeImportSummary(
      summary({ projectsAdded: 1, artifactsAdded: 2, projectsRemoved: 4, artifactsRemoved: 212 }),
    );
    expect(lines[1]).toBe('Removed 4 projects and 212 artifacts.');
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
    expect(lines[1]).toContain('4 artifacts could not be read');
    expect(lines[1]).toContain('“Alien” (this build has no tool for that kind of thing)');
    expect(lines[1]).toContain('“Broken” (its contents were not what that kind expects)');
    expect(lines[1]).toContain('“Ahead” (it was written by a newer build)');
    expect(lines[1]).toContain('“Stuck” (it could not be brought forward from its older version)');
  });

  it('stops naming quarantined records past a handful', () => {
    const many = Array.from({ length: 8 }, (_unused, index) =>
      quarantined({ name: `Record ${index}` }),
    );
    const lines = describeImportSummary(summary({ quarantined: many }));
    expect(lines[1]).toContain('and 3 more');
  });

  it('falls back to the kind, then to a placeholder, for a record with no name', () => {
    expect(
      describeImportSummary(summary({ quarantined: [quarantined({ name: '' })] }))[1],
    ).toContain('“culture”');
    expect(
      describeImportSummary(summary({ quarantined: [quarantined({ name: '', kind: '' })] }))[1],
    ).toContain('“an unnamed record”');
  });

  it('reports a name collision without resolving it, naming what collided', () => {
    const lines = describeImportSummary(
      summary({ projectsAdded: 1, artifactsAdded: 0, nameCollisions: ['Aldia'] }),
    );
    expect(lines[1]).toBe(
      'There was already a project called “Aldia”. Both were kept; rename one if you like.',
    );

    const artifactLines = describeImportSummary(
      summary({ scope: 'artifact', artifactsAdded: 1, nameCollisions: ['Twin'] }),
    );
    expect(artifactLines[1]).toBe(
      'There was already an artifact called “Twin”. Both were kept; rename one if you like.',
    );
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
    expect(lines).toContain(
      'The file used the same id for more than one artifact 1 time. Every copy was kept.',
    );
    expect(lines).toContain('2 artifacts got new ids, so nothing already here was overwritten.');
    expect(lines).toContain('The file was written in an older format and was brought forward.');
    expect(lines.some((line) => line.includes('does not match its own checksum'))).toBe(true);
    expect(lines).toContain('This file came from this browser.');
  });

  it('says nothing about a checksum that was never checked', () => {
    const lines = describeImportSummary(summary({ checksum: 'unchecked', artifactsAdded: 1 }));
    expect(lines.some((line) => line.includes('checksum'))).toBe(false);
  });
});
