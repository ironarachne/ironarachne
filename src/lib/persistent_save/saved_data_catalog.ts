import { loadSavedCultureSnapshots } from '$lib/culture/culture_saved_state';
import type { CultureSnapshot } from '$lib/culture/culture_snapshot';
import { loadSavedHeraldrySnapshots } from '$lib/heraldry/heraldry_saved_state';
import type { HeraldrySnapshot } from '$lib/heraldry/heraldry_snapshot';
import { loadSavedReligionSnapshots } from '$lib/religion/religion_saved_state';
import type { ReligionSnapshot } from '$lib/religion/religion_snapshot';

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
