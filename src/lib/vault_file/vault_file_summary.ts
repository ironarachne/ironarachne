import type { QuarantineReason } from '$lib/artifact_kinds';
import type { QuarantinedArtifact } from '$lib/quarantine';

import type { ImportSummary } from './vault_file_types';

/**
 * How many quarantined artifacts are named before the message starts counting. Past a handful the
 * answer is "a lot of things" either way, and a summary that fills the screen is one nobody reads.
 */
const NAMED_QUARANTINE_LIMIT = 5;

const QUARANTINE_WORDING: Record<QuarantineReason, string> = {
  'unknown-kind': 'this build has no tool for that kind of thing',
  'invalid-payload': 'its contents were not what that kind expects',
  'unsupported-version': 'it was written by a newer build',
  'migration-failed': 'it could not be brought forward from its older version',
};

function count(value: number, singular: string, plural = `${singular}s`): string {
  return `${value} ${value === 1 ? singular : plural}`;
}

function namedQuarantine(quarantined: QuarantinedArtifact[]): string {
  const named = quarantined
    .slice(0, NAMED_QUARANTINE_LIMIT)
    .map(
      (artifact) =>
        `“${artifact.name === '' ? artifact.kind || 'an unnamed record' : artifact.name}” (${QUARANTINE_WORDING[artifact.reason]})`,
    );
  const rest = quarantined.length - named.length;
  return rest === 0 ? named.join(', ') : `${named.join(', ')}, and ${rest} more`;
}

/**
 * What an import did, as sentences a user can read.
 *
 * "Import complete" is a way of not saying what happened, and this is the alternative: every line
 * here is something docs/workshop.md requires the summary to be able to say. It is a list rather
 * than a paragraph so a caller can render it as one, and so a line that has nothing to report is
 * simply absent rather than present and empty.
 */
export function describeImportSummary(summary: ImportSummary): string[] {
  const lines: string[] = [];

  if (summary.empty === true) {
    // Valid, and said rather than counted as success: a user who exported nothing should be told
    // so, not congratulated on restoring a backup of nothing.
    lines.push('That file held no projects at all.');
  }

  if (summary.mode === 'restore') {
    lines.push(
      `Restored ${count(summary.projectsAdded, 'project')} holding ${count(summary.artifactsAdded, 'artifact')}, replacing everything that was here.`,
    );
  } else if (summary.projectsAdded > 0) {
    lines.push(
      `Added ${count(summary.projectsAdded, 'project')} holding ${count(summary.artifactsAdded, 'artifact')}.`,
    );
  } else if (summary.artifactsAdded > 0) {
    lines.push(`Added ${count(summary.artifactsAdded, 'artifact')} to this project.`);
  } else {
    lines.push('Nothing was added.');
  }

  if (summary.projectsRemoved > 0 || summary.artifactsRemoved > 0) {
    lines.push(
      `Removed ${count(summary.projectsRemoved, 'project')} and ${count(summary.artifactsRemoved, 'artifact')}.`,
    );
  }

  if (summary.backupFileName !== undefined) {
    // The undo, named. A restore that says what it destroyed without saying where the copy went
    // has told the user the frightening half and withheld the reassuring one.
    lines.push(
      `Everything you had first went to ${summary.backupFileName}. That file is the undo — keep it until you are sure.`,
    );
  }

  if (summary.recoveredProjectId !== undefined) {
    lines.push(
      'Some artifacts arrived without the project they belonged to, and are in a project called “Recovered artifacts”.',
    );
  }

  if (summary.quarantined.length > 0) {
    lines.push(
      `${count(summary.quarantined.length, 'artifact')} could not be read by this build and ${
        summary.quarantined.length === 1 ? 'was' : 'were'
      } left in the file rather than imported: ${namedQuarantine(summary.quarantined)}.`,
    );
  }

  // Named for what actually collided, because "something here" is not a thing a user can go and
  // look at. Names were never unique, so this reports rather than resolves: renaming one is
  // theirs to do, and doing it for them would rewrite something they wrote.
  const collidedWith = summary.scope === 'artifact' ? 'an artifact' : 'a project';
  for (const name of summary.nameCollisions) {
    lines.push(
      `There was already ${collidedWith} called “${name}”. Both were kept; rename one if you like.`,
    );
  }

  if (summary.duplicateIds.length > 0) {
    lines.push(
      `The file used the same id for more than one artifact ${count(summary.duplicateIds.length, 'time')}. Every copy was kept.`,
    );
  }

  const reminted = Object.keys(summary.remintedIds).length;
  if (reminted > 0) {
    lines.push(
      `${count(reminted, 'artifact')} got new ids, so nothing already here was overwritten.`,
    );
  }

  if (summary.formatMigrated) {
    lines.push('The file was written in an older format and was brought forward.');
  }

  if (summary.checksum === 'mismatch') {
    lines.push(
      'The file does not match its own checksum, so it has been edited or damaged since it was written. It was imported anyway.',
    );
  }

  if (summary.fromThisVault) {
    lines.push('This file came from this browser.');
  }

  return lines;
}
