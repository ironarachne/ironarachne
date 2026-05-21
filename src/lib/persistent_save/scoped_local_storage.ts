/** Prefix for all scoped save entries (single segment avoids collisions inside scope ids). */
export const SAVE_STORAGE_PREFIX = 'ironarachne.save.v1.' as const;

function scopedStorageKey(scopeId: string): string {
  return `${SAVE_STORAGE_PREFIX}${scopeId}`;
}

export function readScopedJson(scopeId: string): unknown | null {
  if (typeof localStorage === 'undefined') {
    return null;
  }
  const raw = localStorage.getItem(scopedStorageKey(scopeId));
  if (raw === null || raw === '') {
    return null;
  }
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

export function writeScopedJson(scopeId: string, value: unknown): void {
  if (typeof localStorage === 'undefined') {
    return;
  }
  localStorage.setItem(scopedStorageKey(scopeId), JSON.stringify(value));
}

export function removeScopedJson(scopeId: string): void {
  if (typeof localStorage === 'undefined') {
    return;
  }
  localStorage.removeItem(scopedStorageKey(scopeId));
}

/** Every stored scope id under this app's prefix and its parsed JSON value (invalid JSON omitted). */
export function listScopedEntries(): { scopeId: string; value: unknown }[] {
  if (typeof localStorage === 'undefined') {
    return [];
  }
  const prefix = SAVE_STORAGE_PREFIX;
  const out: { scopeId: string; value: unknown }[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key === null || !key.startsWith(prefix)) {
      continue;
    }
    const scopeId = key.slice(prefix.length);
    if (scopeId === '') {
      continue;
    }
    const raw = localStorage.getItem(key);
    if (raw === null || raw === '') {
      continue;
    }
    try {
      out.push({ scopeId, value: JSON.parse(raw) as unknown });
    } catch {
      continue;
    }
  }
  return out.sort((a, b) => a.scopeId.localeCompare(b.scopeId));
}

export function clearAllScopedStorageKeys(): void {
  if (typeof localStorage === 'undefined') {
    return;
  }
  const prefix = SAVE_STORAGE_PREFIX;
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key !== null && key.startsWith(prefix)) {
      keysToRemove.push(key);
    }
  }
  for (const key of keysToRemove) {
    localStorage.removeItem(key);
  }
}
