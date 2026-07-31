import { expect, describe, it } from 'vitest';
import { mostRecent } from './change_logs';
import changeLogEntries from './entries';
import type ChangeLog from './change_log';

const entries: ChangeLog[] = [
  { date: '2026-05-21', summary: 'newest', updates: ['a'] },
  { date: '2026-03-02', summary: 'middle', updates: ['b', 'c'] },
  { date: '2025-11-14', summary: 'oldest', updates: [] },
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

describe('changeLogEntries', () => {
  it('is a non-empty list', () => {
    expect(changeLogEntries.length).toBeGreaterThan(0);
  });

  it('gives every entry a year-month-day date and at least one update', () => {
    for (const entry of changeLogEntries) {
      expect(entry.date).toMatch(/^\d{4}-\d{1,2}-\d{1,2}$/);
      expect(entry.updates.length).toBeGreaterThan(0);
    }
  });

  it('gives every entry a string summary, which older entries leave empty', () => {
    for (const entry of changeLogEntries) {
      expect(typeof entry.summary).toBe('string');
    }

    expect(changeLogEntries.some((entry) => entry.summary !== '')).toBe(true);
  });

  it('never records an empty update line', () => {
    for (const entry of changeLogEntries) {
      for (const update of entry.updates) {
        expect(update.trim()).not.toBe('');
      }
    }
  });

  it('gives every entry a date the calendar recognises', () => {
    for (const entry of changeLogEntries) {
      const [year, month, day] = entry.date.split('-').map(Number);

      expect(month).toBeGreaterThanOrEqual(1);
      expect(month).toBeLessThanOrEqual(12);
      expect(day).toBeGreaterThanOrEqual(1);
      expect(new Date(year, month - 1, day).getDate()).toBe(day);
    }
  });

  it('is ordered newest first, which is what mostRecent assumes', () => {
    const timestamps = changeLogEntries.map((entry) => Date.parse(entry.date));

    expect(timestamps).toEqual([...timestamps].sort((a, b) => b - a));
  });

  it('has no duplicate dates', () => {
    const dates = changeLogEntries.map((entry) => entry.date);

    expect(new Set(dates).size).toBe(dates.length);
  });
});
