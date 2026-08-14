// Deep on purpose, and measured: the culture, heraldry, and religion entry points each reach a
// generator and from there the whole species table. This module only reads what is already in
// local storage, and `/saved-data` is the page that pays for it — 19 MB through the entry points
// against 140 KB through these. The type imports are free; they erase.
import { loadSavedCultureSnapshots } from '$lib/culture/culture_saved_state';
import type { CultureSnapshot } from '$lib/culture';
import { loadSavedHeraldrySnapshots } from '$lib/heraldry/heraldry_saved_state';
import type { HeraldrySnapshot } from '$lib/heraldry';
import { loadSavedReligionSnapshots } from '$lib/religion/religion_saved_state';
import type { ReligionSnapshot } from '$lib/religion';

export type SavedDataEntry =
  | { kind: 'heraldry'; snapshot: HeraldrySnapshot }
  | { kind: 'culture'; snapshot: CultureSnapshot }
  | { kind: 'religion'; snapshot: ReligionSnapshot };

export function listAllSavedDataEntries(): SavedDataEntry[] {
  const entries: SavedDataEntry[] = [];

  for (const snapshot of loadSavedHeraldrySnapshots()) {
    entries.push({ kind: 'heraldry', snapshot });
  }
  for (const snapshot of loadSavedCultureSnapshots()) {
    entries.push({ kind: 'culture', snapshot });
  }
  for (const snapshot of loadSavedReligionSnapshots()) {
    entries.push({ kind: 'religion', snapshot });
  }

  return entries;
}

export function listSavedHeraldryEntries(): SavedDataEntry[] {
  return loadSavedHeraldrySnapshots().map((snapshot) => ({ kind: 'heraldry', snapshot }));
}

export function listSavedCultureEntries(): SavedDataEntry[] {
  return loadSavedCultureSnapshots().map((snapshot) => ({ kind: 'culture', snapshot }));
}

export function listSavedReligionEntries(): SavedDataEntry[] {
  return loadSavedReligionSnapshots().map((snapshot) => ({ kind: 'religion', snapshot }));
}
