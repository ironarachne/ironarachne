import { asRecord } from '$lib/artifact_kinds';
import {
  ADOPTION_PROJECT_DESCRIPTION,
  ADOPTION_PROJECT_NAME,
  LEGACY_SAVE_SCOPES,
  legacyScopeContents,
} from '$lib/legacy_adoption';

import { EXPORT_FORMAT_MARKER, EXPORT_FORMAT_VERSION } from './vault_file_types';

/**
 * The marker on a file written by `save_file_export.ts` — the exporter that shipped before the
 * workshop had projects. It exports storage scopes rather than projects and artifacts, and it
 * checks its own `formatVersion` with `===`.
 */
const LEGACY_EXPORT_MARKER = 'ironarachneExport';

/**
 * Whether this is one of the old save files.
 *
 * Deliberately does not check `formatVersion`. The strict-equality check in `save_file_export.ts`
 * is the specific mistake this format exists not to repeat, and applying it here would reject the
 * very files vault import is required to accept — a backup a user made in 2026 has to restore in
 * 2028, which is the whole reason there is a version field at all.
 */
export function looksLikeLegacySaveFile(value: unknown): boolean {
  const record = asRecord(value);
  return record?.[LEGACY_EXPORT_MARKER] === true && asRecord(record.scopes) !== null;
}

/**
 * A legacy save file, rewritten as a project-scope envelope this build's parser already reads.
 *
 * Translation rather than a second import path, and that is the point: once it is an envelope, the
 * legacy file goes through the same staging, the same per-kind payload migration, the same
 * quarantine, and the same all-or-nothing commit as anything else. A separate adoption route for
 * these files would be a second place for every one of those to be got wrong, for data that is by
 * definition the oldest and least replaceable in the vault.
 *
 * The scopes become artifacts of the kinds `$lib/legacy_adoption` already maps them to — the same
 * table `#34` adopts `localStorage` with — so a culture restored from a file and a culture adopted
 * from storage arrive as the same artifact.
 *
 * Ids are synthetic and positional. The legacy format has none, import remints every id it is given
 * anyway, and inventing stable-looking ones would suggest an identity these items never had.
 */
export function legacySaveFileToEnvelope(value: unknown): Record<string, unknown> | undefined {
  const record = asRecord(value);
  const scopes = record === null ? null : asRecord(record.scopes);
  if (record === null || scopes === null) {
    return undefined;
  }

  const exportedAt = typeof record.exportedAt === 'string' ? record.exportedAt : '';
  const at = Date.parse(exportedAt);
  const timestamp = Number.isNaN(at) ? 0 : at;

  const artifacts: unknown[] = [];
  for (const scope of LEGACY_SAVE_SCOPES) {
    const contents = legacyScopeContents(scope, scopes[scope.scopeId] ?? null);
    for (const [index, item] of contents.items.entries()) {
      artifacts.push({
        id: `legacy-${scope.scopeId}-${index}`,
        projectId: 'legacy',
        kind: scope.kind,
        // No name: a blank one falls through to the kind's own `nameOf`, which is the same
        // function that names a freshly generated artifact. Lifting a name out of the snapshot
        // here would be a second, drifting copy of that rule.
        name: '',
        tags: [],
        references: [],
        // Read as stored and not repaired. The kind registry decides what this version means,
        // including refusing it — which quarantines that one item and nothing else.
        payloadVersion: contents.payloadVersion,
        createdAt: timestamp,
        updatedAt: timestamp,
        payload: item,
      });
    }
  }

  return {
    format: EXPORT_FORMAT_MARKER,
    formatVersion: EXPORT_FORMAT_VERSION,
    scope: 'project',
    exportedAt,
    // Unknown, and left unknown. The legacy file records no build, and `appVersion` is diagnostics
    // that must never be invented.
    appVersion: '',
    vaultId: '',
    checksum: '',
    body: {
      project: {
        id: 'legacy',
        name: ADOPTION_PROJECT_NAME,
        description: ADOPTION_PROJECT_DESCRIPTION,
        tags: [],
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      artifacts,
    },
  };
}
