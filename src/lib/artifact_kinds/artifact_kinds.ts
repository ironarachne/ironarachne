import type {
  AnyArtifactKindEntry,
  ArtifactKindEntry,
  PayloadResult,
  QuarantineReason,
} from './artifact_kind_types';

/** A payload this build understands, ready to be stored or rehydrated. */
export function acceptedPayload<T>(value: T): PayloadResult<T> {
  return { ok: true, value };
}

/** A payload this build cannot use, with the reason quarantine has to report. */
export function rejectedPayload<T>(reason: QuarantineReason, message: string): PayloadResult<T> {
  return { ok: false, reason, message };
}

/**
 * Builds a kind entry, checking the parts of the contract a type cannot state. Mirrors
 * `defineTool` in `$lib/tools`: the definition site is where a mistake is cheap to find, and a
 * kind with no id or a nonsense version would otherwise fail much later, in someone's storage.
 */
export function defineArtifactKind<TValue, TSnapshot>(
  entry: ArtifactKindEntry<TValue, TSnapshot>,
): ArtifactKindEntry<TValue, TSnapshot> {
  if (entry.kind.trim() === '') {
    throw new Error('an artifact kind needs a non-empty id');
  }
  if (entry.displayName.trim() === '') {
    throw new Error(`artifact kind "${entry.kind}" needs a non-empty display name`);
  }
  if (!Number.isInteger(entry.payloadVersion) || entry.payloadVersion < 1) {
    throw new Error(
      `artifact kind "${entry.kind}" needs an integer payloadVersion of at least 1, got ${entry.payloadVersion}`,
    );
  }
  return entry;
}

/**
 * Turns a stored payload of known version into a snapshot this build can use, migrating it first
 * when it is older.
 *
 * The version routing lives here rather than in each entry so that a kind implements only the
 * steps it actually has. Three cases never reach `migrate`:
 *
 * - **Current version** — validated as it stands.
 * - **Newer than us** — rejected. A file from a future build is not something to guess at, and
 *   quarantining it keeps the payload intact for a later version that does understand it.
 * - **Not a version** — rejected. A missing or fractional version is a corrupt record, not a
 *   migration.
 *
 * A migration's output is validated too. A migration that returns something malformed is a bug,
 * and finding it here — with the payload preserved — beats storing the damage.
 */
export function readArtifactPayload(
  entry: AnyArtifactKindEntry,
  payload: unknown,
  fromVersion: number,
): PayloadResult<unknown> {
  if (!Number.isInteger(fromVersion) || fromVersion < 1) {
    return rejectedPayload(
      'unsupported-version',
      `artifact kind "${entry.kind}" cannot read payload version ${fromVersion}`,
    );
  }
  if (fromVersion > entry.payloadVersion) {
    return rejectedPayload(
      'unsupported-version',
      `artifact kind "${entry.kind}" payload is version ${fromVersion}, but this build understands up to ${entry.payloadVersion}`,
    );
  }
  if (fromVersion === entry.payloadVersion) {
    return entry.validate(payload);
  }

  const migrated = entry.migrate(payload, fromVersion);
  if (!migrated.ok) {
    return migrated;
  }
  const validated = entry.validate(migrated.value);
  if (!validated.ok) {
    return rejectedPayload(
      'migration-failed',
      `artifact kind "${entry.kind}" migrated a version ${fromVersion} payload into something invalid: ${validated.message}`,
    );
  }
  return validated;
}
