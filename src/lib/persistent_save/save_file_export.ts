import {
  clearAllScopedStorageKeys,
  listScopedEntries,
  readScopedJson,
  writeScopedJson,
} from './scoped_local_storage';

export const SAVE_EXPORT_FORMAT_VERSION = 1 as const;

export type IronArachneSaveExportPayload = {
  ironarachneExport: true;
  formatVersion: typeof SAVE_EXPORT_FORMAT_VERSION;
  exportedAt: string;
  scopes: Record<string, unknown>;
};

export type ApplyImportedScopesResult =
  | { ok: true; appliedScopes: string[] }
  | { ok: false; error: string };

export function buildExportPayload(scopeIds?: string[]): IronArachneSaveExportPayload {
  const scopes: Record<string, unknown> = {};
  if (scopeIds === undefined) {
    for (const { scopeId, value } of listScopedEntries()) {
      scopes[scopeId] = value;
    }
  } else {
    for (const id of scopeIds) {
      const value = readScopedJson(id);
      if (value !== null) {
        scopes[id] = value;
      }
    }
  }
  return {
    ironarachneExport: true,
    formatVersion: SAVE_EXPORT_FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    scopes,
  };
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Validates envelope shape; does not mutate storage. */
export function parseSaveExportPayload(data: unknown): IronArachneSaveExportPayload | null {
  if (!isPlainRecord(data)) {
    return null;
  }
  if (data.ironarachneExport !== true) {
    return null;
  }
  if (data.formatVersion !== SAVE_EXPORT_FORMAT_VERSION) {
    return null;
  }
  if (typeof data.exportedAt !== 'string') {
    return null;
  }
  if (!isPlainRecord(data.scopes)) {
    return null;
  }
  return data as IronArachneSaveExportPayload;
}

export function applyImportedScopes(
  parsed: unknown,
  mode: 'merge' | 'replaceAll',
): ApplyImportedScopesResult {
  const payload = parseSaveExportPayload(parsed);
  if (payload === null) {
    return {
      ok: false,
      error:
        'Invalid save file (missing ironarachneExport, wrong formatVersion, or malformed scopes).',
    };
  }
  if (mode === 'replaceAll') {
    clearAllScopedStorageKeys();
  }
  const appliedScopes: string[] = [];
  for (const [scopeId, value] of Object.entries(payload.scopes)) {
    if (typeof scopeId !== 'string' || scopeId === '') {
      continue;
    }
    writeScopedJson(scopeId, value);
    appliedScopes.push(scopeId);
  }
  appliedScopes.sort((a, b) => a.localeCompare(b));
  return { ok: true, appliedScopes };
}
