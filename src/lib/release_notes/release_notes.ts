import type ReleaseNote from './release_note.js';

export function mostRecent(numberOfEntries: number, entries: ReleaseNote[]): ReleaseNote[] {
  if (numberOfEntries <= 0) {
    return [];
  }

  return entries.slice(0, numberOfEntries);
}

export interface ReleaseNoteSection {
  label: string;
  items: string[];
}

/**
 * The four categories in the order they are shown, paired with the visitor-facing heading for each.
 *
 * Order is meaning, not decoration: what you can now do comes before what got better, which comes
 * before what stopped being broken, which comes before what you would never have noticed.
 */
const SECTION_ORDER: { key: keyof ReleaseNote; label: string }[] = [
  { key: 'features', label: 'New features' },
  { key: 'improvements', label: 'Improvements' },
  { key: 'fixes', label: 'Bug fixes' },
  { key: 'housekeeping', label: 'Housekeeping' },
];

/**
 * The note's non-empty categories, in display order.
 *
 * Lives here rather than in the component so that section order and headings are one testable
 * fact, and so a note can be rendered somewhere else without carrying that knowledge along.
 */
export function sections(note: ReleaseNote): ReleaseNoteSection[] {
  const result: ReleaseNoteSection[] = [];

  for (const { key, label } of SECTION_ORDER) {
    const items = note[key];

    if (Array.isArray(items) && items.length > 0) {
      result.push({ label, items });
    }
  }

  return result;
}

/** Every line in a note, across all four categories. */
export function updateCount(note: ReleaseNote): number {
  return sections(note).reduce((total, section) => total + section.items.length, 0);
}
