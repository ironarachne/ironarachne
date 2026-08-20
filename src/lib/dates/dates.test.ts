import { test, expect, describe } from 'vitest';
import { getMonthAbbr, getMonthName, getNiceDate, getShortDate } from './dates';

describe('getMonthAbbr', () => {
  test('returns correct abbreviation for each month', () => {
    expect(getMonthAbbr(0)).toBe('Jan.');
    expect(getMonthAbbr(1)).toBe('Feb.');
    expect(getMonthAbbr(2)).toBe('Mar.');
    expect(getMonthAbbr(3)).toBe('Apr.');
    expect(getMonthAbbr(4)).toBe('May');
    expect(getMonthAbbr(5)).toBe('Jun.');
    expect(getMonthAbbr(6)).toBe('Jul.');
    expect(getMonthAbbr(7)).toBe('Aug.');
    expect(getMonthAbbr(8)).toBe('Sep.');
    expect(getMonthAbbr(9)).toBe('Oct.');
    expect(getMonthAbbr(10)).toBe('Nov.');
    expect(getMonthAbbr(11)).toBe('Dec.');
  });
});

describe('getMonthName', () => {
  test('returns correct name for each month', () => {
    expect(getMonthName(0)).toBe('January');
    expect(getMonthName(1)).toBe('February');
    expect(getMonthName(2)).toBe('March');
    expect(getMonthName(3)).toBe('April');
    expect(getMonthName(4)).toBe('May');
    expect(getMonthName(5)).toBe('June');
    expect(getMonthName(6)).toBe('July');
    expect(getMonthName(7)).toBe('August');
    expect(getMonthName(8)).toBe('September');
    expect(getMonthName(9)).toBe('October');
    expect(getMonthName(10)).toBe('November');
    expect(getMonthName(11)).toBe('December');
  });
});

describe('getNiceDate', () => {
  test('returns formatted date string with ordinal and month abbreviation', () => {
    expect(getNiceDate('2025-07-15')).toBe('Jul. 15<sup>th</sup>, 2025');
    expect(getNiceDate('2025-01-01')).toBe('Jan. 1<sup>st</sup>, 2025');
    expect(getNiceDate('2025-12-31')).toBe('Dec. 31<sup>st</sup>, 2025');
  });
});

describe('getShortDate', () => {
  test('returns day, abbreviated month and year', () => {
    expect(getShortDate(new Date(2026, 7, 20))).toBe('20 Aug. 2026');
    expect(getShortDate(new Date(2025, 0, 1))).toBe('1 Jan. 2025');
    expect(getShortDate(new Date(2025, 11, 31))).toBe('31 Dec. 2025');
  });

  test('carries no markup', () => {
    // The whole reason it exists next to getNiceDate: the top bar renders it as text, so a tag
    // creeping in here would show up literally rather than being escaped into a superscript.
    expect(getShortDate(new Date(2026, 4, 3))).not.toContain('<');
  });
});
