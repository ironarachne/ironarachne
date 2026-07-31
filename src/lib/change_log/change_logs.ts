import type ChangeLog from './change_log.js';

export function mostRecent(numberOfEntries: number, entries: ChangeLog[]): ChangeLog[] {
  if (numberOfEntries <= 0) {
    return [];
  }

  return entries.slice(0, numberOfEntries);
}
