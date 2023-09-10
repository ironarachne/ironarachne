import type ChangeLog from "./change_log.js";

export function mostRecent(numberOfEntries: number, entries: ChangeLog[]): ChangeLog[] {
  let result: ChangeLog[] = [];

  for (let i = 0; i < numberOfEntries; i++) {
    result.push(entries[i]);
  }

  return result;
}
