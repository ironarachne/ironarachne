import { expect, describe, it } from 'vitest';
import { mostRecent, sections, updateCount } from './release_notes';
import releaseNoteEntries from './entries';
import type ReleaseNote from './release_note';

const entries: ReleaseNote[] = [
  { date: '2026-05-21', summary: 'newest', features: ['a'] },
  { date: '2026-03-02', summary: 'middle', fixes: ['b', 'c'] },
  { date: '2025-11-14', summary: 'oldest', housekeeping: ['d'] },
];

describe('mostRecent', () => {
  it('returns the requested number of entries from the front of the list', () => {
    expect(mostRecent(2, entries).map((entry) => entry.summary)).toEqual(['newest', 'middle']);
  });

  it('returns one entry when asked for one', () => {
    expect(mostRecent(1, entries)).toEqual([entries[0]]);
  });

  it('returns an empty array when asked for none', () => {
    expect(mostRecent(0, entries)).toEqual([]);
  });

  it('returns an empty array for a negative count', () => {
    expect(mostRecent(-1, entries)).toEqual([]);
  });

  it('returns every entry when asked for more than exist, without padding', () => {
    const result = mostRecent(10, entries);

    expect(result).toEqual(entries);
    expect(result.every((entry) => entry !== undefined)).toBe(true);
  });

  it('returns an empty array when there are no entries', () => {
    expect(mostRecent(3, [])).toEqual([]);
  });

  it('does not mutate the entries it was given', () => {
    const source = [...entries];
    mostRecent(2, source);

    expect(source).toEqual(entries);
  });

  it('returns a new array rather than the source', () => {
    expect(mostRecent(entries.length, entries)).not.toBe(entries);
  });
});

describe('sections', () => {
  it('returns the categories in display order, whichever ones are present', () => {
    const note: ReleaseNote = {
      date: '2026-08-17',
      summary: 'everything',
      housekeeping: ['h'],
      fixes: ['x'],
      improvements: ['i'],
      features: ['f'],
    };

    expect(sections(note).map((section) => section.label)).toEqual([
      'New features',
      'Improvements',
      'Bug fixes',
      'Housekeeping',
    ]);
  });

  it('omits a category that is absent', () => {
    expect(sections(entries[1]).map((section) => section.label)).toEqual(['Bug fixes']);
  });

  it('omits a category that is present but empty', () => {
    const note: ReleaseNote = { date: '2026-08-17', summary: 's', features: [], fixes: ['x'] };

    expect(sections(note).map((section) => section.label)).toEqual(['Bug fixes']);
  });

  it('returns nothing for a note with no lines at all', () => {
    expect(sections({ date: '2026-08-17', summary: 's' })).toEqual([]);
  });

  it('carries the lines through unchanged and in order', () => {
    expect(sections(entries[1])[0].items).toEqual(['b', 'c']);
  });
});

describe('updateCount', () => {
  it('counts every line across all categories', () => {
    const note: ReleaseNote = {
      date: '2026-08-17',
      summary: 's',
      features: ['a', 'b'],
      improvements: ['c'],
      fixes: ['d'],
      housekeeping: ['e', 'f'],
    };

    expect(updateCount(note)).toBe(6);
  });

  it('is zero for a note with no lines', () => {
    expect(updateCount({ date: '2026-08-17', summary: 's' })).toBe(0);
  });
});

describe('releaseNoteEntries', () => {
  it('is a non-empty list', () => {
    expect(releaseNoteEntries.length).toBeGreaterThan(0);
  });

  it('gives every entry a year-month-day date and at least one update line', () => {
    for (const entry of releaseNoteEntries) {
      expect(entry.date).toMatch(/^\d{4}-\d{1,2}-\d{1,2}$/);
      expect(updateCount(entry)).toBeGreaterThan(0);
    }
  });

  it('gives every entry a summary', () => {
    for (const entry of releaseNoteEntries) {
      expect(entry.summary.trim()).not.toBe('');
    }
  });

  it('never records an empty update line', () => {
    for (const entry of releaseNoteEntries) {
      for (const section of sections(entry)) {
        for (const item of section.items) {
          expect(item.trim()).not.toBe('');
        }
      }
    }
  });

  it('gives every entry a date the calendar recognises', () => {
    for (const entry of releaseNoteEntries) {
      const [year, month, day] = entry.date.split('-').map(Number);

      expect(month).toBeGreaterThanOrEqual(1);
      expect(month).toBeLessThanOrEqual(12);
      expect(day).toBeGreaterThanOrEqual(1);
      expect(new Date(year, month - 1, day).getDate()).toBe(day);
    }
  });

  it('is ordered newest first, which is what mostRecent assumes', () => {
    const timestamps = releaseNoteEntries.map((entry) => Date.parse(entry.date));

    expect(timestamps).toEqual([...timestamps].sort((a, b) => b - a));
  });

  it('has no duplicate dates', () => {
    const dates = releaseNoteEntries.map((entry) => entry.date);

    expect(new Set(dates).size).toBe(dates.length);
  });

  /**
   * The refactor that split `updates` into four categories moved 270 lines by hand (#29). Asserting
   * the total is what proves none of them were dropped on the way, and it keeps a later
   * recategorisation honest: moving a line between buckets is fine, losing one is not.
   */
  it('still holds every one of the 270 lines the change log had', () => {
    const total = releaseNoteEntries.reduce((sum, entry) => sum + updateCount(entry), 0);

    expect(total).toBe(270);
  });

  it('gives a version only to entries that had a real release, in a SemVer shape', () => {
    const versioned = releaseNoteEntries.filter((entry) => entry.version !== undefined);

    expect(versioned.map((entry) => entry.date)).toEqual(['2026-08-17', '2026-08-13']);

    for (const entry of versioned) {
      expect(entry.version).toMatch(/^\d+\.\d+\.\d+$/);
    }
  });

  it('has no duplicate version numbers', () => {
    const versions = releaseNoteEntries
      .map((entry) => entry.version)
      .filter((version): version is string => version !== undefined);

    expect(new Set(versions).size).toBe(versions.length);
  });
});
