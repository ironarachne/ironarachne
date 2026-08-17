import { asRecord } from '$lib/artifact_kinds';
import { toArtifactSummary } from '$lib/artifacts';
import { toProject } from '$lib/projects';
import { toProjectWorkspace } from '$lib/workspaces';

import {
  EXPORT_FORMAT_MARKER,
  EXPORT_FORMAT_VERSION,
  type ArtifactBody,
  type ChecksumState,
  type ExportEnvelope,
  type ExportFileParseResult,
  type ExportFileProblem,
  type ExportFormatMigration,
  type ExportedArtifact,
  type ProjectBody,
  type QuarantinedArtifact,
  type VaultBody,
} from './vault_file_types';

/**
 * The envelope's fields, in the order they are written.
 *
 * The header comes before the body so that a file opened in an editor says what it is in its first
 * line rather than after nine megabytes of artifacts. Everything below the top level is sorted by
 * key instead — see {@link canonicalJson}.
 */
const ENVELOPE_FIELD_ORDER = [
  'format',
  'formatVersion',
  'scope',
  'exportedAt',
  'appVersion',
  'vaultId',
  'checksum',
  'body',
] as const;

/** What {@link canonicalJson} throws on a value that refers to itself. */
const CYCLE_MESSAGE = 'this value refers to itself and cannot be written to a file';

/**
 * JSON with every object's keys sorted, recursively.
 *
 * This is what "the body is emitted in a stable order" means in practice, and it buys two things
 * that are worth the deterministic serialiser: two exports of unchanged content differ only in
 * their header, so backups kept in a folder or a git repository can be diffed; and the checksum
 * over the body is reproducible by anyone, including by a reader that has since reordered the keys
 * while parsing.
 *
 * It follows `JSON.stringify` where it can: `toJSON` is honoured, non-finite numbers become `null`,
 * and a value with no JSON representation is dropped from an object and becomes `null` in an array.
 * It parts company on two points, deliberately — a cycle throws a message a user can read rather
 * than `TypeError: Converting circular structure to JSON`, and a `bigint` is dropped rather than
 * throwing, because one unrepresentable field must not cost a whole backup.
 */
export function canonicalJson(value: unknown): string {
  return canonicalValue(value, new Set()) ?? 'null';
}

/**
 * The same, reporting failure rather than throwing — how export asks "can this payload be written
 * at all?" before it decides what to do about a payload that cannot.
 */
export function tryCanonicalJson(value: unknown): string | undefined {
  try {
    return canonicalJson(value);
  } catch {
    return undefined;
  }
}

/** `undefined` for a value JSON has no representation for; the caller decides what that means. */
function canonicalValue(value: unknown, path: Set<object>): string | undefined {
  if (value === null) {
    return 'null';
  }
  const type = typeof value;
  if (type === 'string' || type === 'boolean') {
    return JSON.stringify(value);
  }
  if (type === 'number') {
    return Number.isFinite(value) ? JSON.stringify(value) : 'null';
  }
  if (type !== 'object') {
    return undefined;
  }
  return canonicalObject(value as object, path);
}

function canonicalObject(value: object, path: Set<object>): string | undefined {
  const unwrapped = unwrapToJson(value);
  if (typeof unwrapped !== 'object' || unwrapped === null) {
    return canonicalValue(unwrapped, path);
  }
  if (path.has(unwrapped)) {
    throw new Error(CYCLE_MESSAGE);
  }
  path.add(unwrapped);
  try {
    if (Array.isArray(unwrapped)) {
      return `[${unwrapped.map((item) => canonicalValue(item, path) ?? 'null').join(',')}]`;
    }
    return canonicalRecord(unwrapped as Record<string, unknown>, path);
  } finally {
    path.delete(unwrapped);
  }
}

/** A `Date` and anything else with a `toJSON` is written as whatever it says it is. */
function unwrapToJson(value: object): unknown {
  const candidate = value as { toJSON?: unknown };
  return typeof candidate.toJSON === 'function'
    ? (candidate.toJSON as () => unknown).call(value)
    : value;
}

function canonicalRecord(record: Record<string, unknown>, path: Set<object>): string {
  const parts: string[] = [];
  for (const key of Object.keys(record).sort()) {
    const written = canonicalValue(record[key], path);
    if (written !== undefined) {
      parts.push(`${JSON.stringify(key)}:${written}`);
    }
  }
  return `{${parts.join(',')}}`;
}

/**
 * SHA-256 of the canonical body, as lowercase hex.
 *
 * Empty when the browser has no `crypto.subtle` — an insecure context, or an old browser. A file
 * with no checksum is read as unchecked rather than as corrupt, which is the honest reading: the
 * field's job is to tell truncation from a syntax error, and a browser that cannot compute one has
 * not learned anything about the file.
 */
export async function checksumOf(canonicalBody: string): Promise<string> {
  const subtle = globalThis.crypto?.subtle;
  if (subtle === undefined) {
    return '';
  }
  const digest = await subtle.digest('SHA-256', new TextEncoder().encode(canonicalBody));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

/** The envelope as the bytes that go in the file. */
export function exportFileText(envelope: ExportEnvelope): string {
  const record = envelope as unknown as Record<string, unknown>;
  const fields = ENVELOPE_FIELD_ORDER.map(
    (key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`,
  );
  return `{${fields.join(',')}}`;
}

/**
 * The envelope's own migration chain, oldest step first.
 *
 * Empty, because version 1 is the only envelope that has ever been written. It is a list rather
 * than nothing at all so that the *next* version is a step appended here, not a parser rewritten
 * under files that are already in users' Downloads folders.
 */
export const EXPORT_FORMAT_MIGRATIONS: ExportFormatMigration[] = [];

export type ParseExportFileOptions = {
  /** Overridden by tests, which is the only way an empty chain can be exercised. */
  migrations?: ExportFormatMigration[];
};

function rejected(problem: ExportFileProblem, message: string): ExportFileParseResult {
  return { ok: false, problem, message };
}

/**
 * Read a file into an envelope, or say why it could not be read.
 *
 * One parser for all three scopes: the file declares what it is and this reads it, so a vault file
 * dropped on "import project" is understood rather than misread. Refusing a scope is the importer's
 * decision, not the reader's — which is what keeps #47 an added branch there instead of a second
 * copy of everything here.
 *
 * The order of the checks is the order the failure states are written in docs/workshop.md, and it
 * matters: the checksum is verified against the body **as the file carries it**, before any
 * migration rewrites it, because that is the body it was computed over.
 */
export async function parseExportFile(
  text: string,
  options: ParseExportFileOptions = {},
): Promise<ExportFileParseResult> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text) as unknown;
  } catch {
    return rejected(
      'damaged',
      'This file is damaged or incomplete. A download that was interrupted looks like this; try exporting or downloading it again.',
    );
  }

  const record = asRecord(parsed);
  if (record === null || record.format !== EXPORT_FORMAT_MARKER) {
    return rejected(
      'not-ours',
      'This is not an Iron Arachne export file. It may be valid JSON, but nothing in it says it came from here.',
    );
  }
  if (typeof record.formatVersion !== 'number' || !Number.isInteger(record.formatVersion)) {
    return rejected('malformed', 'This export file does not say which format version it is.');
  }
  if (record.formatVersion > EXPORT_FORMAT_VERSION) {
    return rejected(
      'newer-format',
      `This file was written by a newer version of Iron Arachne (format ${record.formatVersion}; this build reads ${EXPORT_FORMAT_VERSION}). Reload the site and try again.`,
    );
  }

  const checksum = await verifyChecksum(record);
  const migrated = migrateEnvelopeShape(record, options.migrations ?? EXPORT_FORMAT_MIGRATIONS);
  if (!migrated.ok) {
    return migrated;
  }

  return readEnvelope(migrated.record, {
    formatMigrated: migrated.formatMigrated,
    checksum,
  });
}

async function verifyChecksum(record: Record<string, unknown>): Promise<ChecksumState> {
  if (typeof record.checksum !== 'string' || record.checksum === '') {
    return 'unchecked';
  }
  const computed = await checksumOf(canonicalJson(record.body));
  if (computed === '') {
    return 'unchecked';
  }
  return computed === record.checksum ? 'ok' : 'mismatch';
}

type MigratedEnvelope =
  | { ok: true; record: Record<string, unknown>; formatMigrated: boolean }
  | { ok: false; problem: ExportFileProblem; message: string };

/**
 * Walk an older envelope forward, one version at a time.
 *
 * A missing step is a refusal rather than a guess. Reading a version we have no rule for and hoping
 * the shape happens to line up is how an import writes something nobody wrote — the one outcome
 * worse than telling the user this build cannot read their file.
 */
function migrateEnvelopeShape(
  record: Record<string, unknown>,
  migrations: ExportFormatMigration[],
): MigratedEnvelope {
  let current = record;
  let version = record.formatVersion as number;
  if (version === EXPORT_FORMAT_VERSION) {
    return { ok: true, record: current, formatMigrated: false };
  }

  while (version < EXPORT_FORMAT_VERSION) {
    const step = migrations.find((migration) => migration.from === version);
    if (step === undefined) {
      return {
        ok: false,
        problem: 'unmigratable',
        message: `This file is in format version ${version}, which this build has no way to read. It was written by a version of Iron Arachne older than any this one knows about.`,
      };
    }
    current = step.migrate(current);
    version += 1;
  }
  return {
    ok: true,
    record: { ...current, formatVersion: EXPORT_FORMAT_VERSION },
    formatMigrated: true,
  };
}

type EnvelopeContext = { formatMigrated: boolean; checksum: ChecksumState };

function readEnvelope(
  record: Record<string, unknown>,
  context: EnvelopeContext,
): ExportFileParseResult {
  const header = readHeader(record);
  if (header === undefined) {
    return rejected('malformed', 'This export file is missing the header fields every file has.');
  }
  const body = asRecord(record.body);
  if (body === null) {
    return rejected('malformed', 'This export file has no body to read.');
  }

  const quarantined: QuarantinedArtifact[] = [];
  if (record.scope === 'vault') {
    return {
      ok: true,
      envelope: { ...header, scope: 'vault', body: readVaultBody(body, quarantined) },
      ...context,
      quarantined,
    };
  }
  if (record.scope === 'project') {
    const projectBody = readProjectBody(body, quarantined);
    if (projectBody === undefined) {
      return rejected('malformed', 'This project file has no readable project in it.');
    }
    return {
      ok: true,
      envelope: { ...header, scope: 'project', body: projectBody },
      ...context,
      quarantined,
    };
  }
  if (record.scope === 'artifact') {
    const artifactBody = readArtifactBody(body);
    if (artifactBody === undefined) {
      return rejected('malformed', 'This artifact file has no readable artifact in it.');
    }
    return {
      ok: true,
      envelope: { ...header, scope: 'artifact', body: artifactBody },
      ...context,
      quarantined,
    };
  }
  return rejected(
    'malformed',
    'This export file does not say whether it holds a vault, a project, or an artifact.',
  );
}

type ParsedHeader = Omit<ExportEnvelope, 'scope' | 'body'>;

/**
 * The header, with the diagnostic fields repaired rather than checked.
 *
 * `exportedAt`, `appVersion`, and `vaultId` are for the user's benefit and for telling a file of
 * their own work from someone else's. None of them gates anything, so a file that lost one is
 * still a file full of work, and refusing it over a missing date would be the format enforcing
 * bookkeeping at the expense of the data.
 */
function readHeader(record: Record<string, unknown>): ParsedHeader | undefined {
  if (typeof record.formatVersion !== 'number') {
    return undefined;
  }
  return {
    format: EXPORT_FORMAT_MARKER,
    formatVersion: record.formatVersion,
    exportedAt: typeof record.exportedAt === 'string' ? record.exportedAt : '',
    appVersion: typeof record.appVersion === 'string' ? record.appVersion : '',
    vaultId: typeof record.vaultId === 'string' ? record.vaultId : '',
    checksum: typeof record.checksum === 'string' ? record.checksum : '',
  };
}

/**
 * An artifact record as this build understands one, or `undefined` when it is not one.
 *
 * It goes through `toArtifactSummary` — the same parse the store uses on its own records — so that
 * "a readable artifact" means one thing in this codebase rather than two that drift. The payload
 * rides along untouched: whether it is a payload *this build* can use is the kind's question, asked
 * later, and answering it here would quarantine on the wrong grounds.
 */
function readExportedArtifact(value: unknown): ExportedArtifact | undefined {
  const summary = toArtifactSummary(value);
  if (summary === undefined) {
    return undefined;
  }
  const { byteSize: _byteSize, ...rest } = summary;
  return { ...rest, payload: (value as Record<string, unknown>).payload };
}

/** A record that is not an artifact, kept whole with whatever of its identity survived. */
function quarantineUnreadable(value: unknown): QuarantinedArtifact {
  const record = asRecord(value);
  const stringField = (key: string): string => {
    const held = record?.[key];
    return typeof held === 'string' ? held : '';
  };
  return {
    id: stringField('id'),
    projectId: stringField('projectId'),
    kind: stringField('kind'),
    name: stringField('name'),
    raw: value,
    reason: 'invalid-payload',
    message: 'this record is not an artifact this build can read',
  };
}

function readArtifactList(value: unknown, quarantined: QuarantinedArtifact[]): ExportedArtifact[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const artifacts: ExportedArtifact[] = [];
  for (const entry of value) {
    const artifact = readExportedArtifact(entry);
    if (artifact === undefined) {
      quarantined.push(quarantineUnreadable(entry));
      continue;
    }
    artifacts.push(artifact);
  }
  return artifacts;
}

function readWorkspaceList(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((entry) => toProjectWorkspace(entry))
    .filter((workspace) => workspace !== undefined);
}

function readVaultBody(
  body: Record<string, unknown>,
  quarantined: QuarantinedArtifact[],
): VaultBody {
  const projects = Array.isArray(body.projects)
    ? body.projects.map((entry) => toProject(entry)).filter((project) => project !== undefined)
    : [];
  return {
    projects,
    artifacts: readArtifactList(body.artifacts, quarantined),
    workspaces: readWorkspaceList(body.workspaces),
  };
}

function readProjectBody(
  body: Record<string, unknown>,
  quarantined: QuarantinedArtifact[],
): ProjectBody | undefined {
  const project = toProject(body.project);
  if (project === undefined) {
    return undefined;
  }
  const result: ProjectBody = {
    project,
    artifacts: readArtifactList(body.artifacts, quarantined),
  };
  // A bench that cannot be read is dropped rather than reported: it is not work, and a project
  // arriving without its panel arrangement costs the user a click.
  const workspace = toProjectWorkspace(body.workspace);
  if (workspace !== undefined) {
    result.workspace = workspace;
  }
  return result;
}

/**
 * A single-artifact file with an unreadable artifact is refused outright rather than imported as
 * nothing plus a quarantine note. There is no rest of the file for quarantine to protect here, and
 * "nothing was imported, here is why" is the clearer sentence.
 */
function readArtifactBody(body: Record<string, unknown>): ArtifactBody | undefined {
  const artifact = readExportedArtifact(body.artifact);
  return artifact === undefined ? undefined : { artifact };
}
