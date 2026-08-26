import { describe, expect, it } from 'vitest';

import {
  describeRunSettings,
  runAccessibleName,
  runAge,
  runHeadline,
} from './session_log_presentation';
import type { SessionLogEntry } from './session_log_types';

const NOW = 1_700_000_000_000;
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function entry(overrides: Partial<SessionLogEntry> = {}): SessionLogEntry {
  return {
    id: 'run-1',
    toolPath: '/fantasy/settlement',
    summary: 'Ashvale',
    seed: 'abc123',
    config: { size: 'small' },
    at: NOW,
    ...overrides,
  };
}

describe('runAge', () => {
  it('reads anything under a minute as just now', () => {
    expect(runAge(NOW, NOW)).toBe('just now');
    expect(runAge(NOW - MINUTE + 1, NOW)).toBe('just now');
  });

  it('counts minutes up to an hour', () => {
    expect(runAge(NOW - MINUTE, NOW)).toBe('1 min ago');
    expect(runAge(NOW - 4 * MINUTE, NOW)).toBe('4 min ago');
    expect(runAge(NOW - HOUR + 1, NOW)).toBe('59 min ago');
  });

  it('counts hours up to a day', () => {
    expect(runAge(NOW - HOUR, NOW)).toBe('1 hr ago');
    expect(runAge(NOW - 2 * HOUR, NOW)).toBe('2 hr ago');
    expect(runAge(NOW - DAY + 1, NOW)).toBe('23 hr ago');
  });

  it('counts days past that, rather than reading as twenty-seven hours', () => {
    expect(runAge(NOW - DAY, NOW)).toBe('1 day ago');
    expect(runAge(NOW - 3 * DAY, NOW)).toBe('3 days ago');
  });

  it('reads a clock that went backwards as just now rather than explaining itself', () => {
    expect(runAge(NOW + HOUR, NOW)).toBe('just now');
  });
});

describe('describeRunSettings', () => {
  it('writes each setting as the tool named it', () => {
    expect(describeRunSettings({ size: 'small', includeTrade: true })).toBe(
      'size: small · includeTrade: true',
    );
  });

  it('joins a list', () => {
    expect(describeRunSettings({ categories: ['animism', 'polytheism'] })).toBe(
      'categories: animism, polytheism',
    );
  });

  it('says none for an empty list, rather than nothing at all', () => {
    expect(describeRunSettings({ categories: [] })).toBe('categories: none');
  });

  it('says none for a setting that is absent', () => {
    expect(describeRunSettings({ religion: null })).toBe('religion: none');
    expect(describeRunSettings({ religion: undefined })).toBe('religion: none');
  });

  it('writes a nested setting as its JSON rather than as [object Object]', () => {
    expect(describeRunSettings({ field: { tincture: 'Or' } })).toBe('field: {"tincture":"Or"}');
  });

  it('is empty for a tool with no settings, so the caller decides what silence looks like', () => {
    expect(describeRunSettings({})).toBe('');
  });
});

describe('runHeadline', () => {
  it('is what came out', () => {
    expect(runHeadline(entry())).toBe('Ashvale');
  });

  it('falls back to the seed when the tool had no name to give', () => {
    expect(runHeadline(entry({ summary: undefined }))).toBe('abc123');
  });

  it('falls back to the seed when the name is only whitespace', () => {
    expect(runHeadline(entry({ summary: '   ' }))).toBe('abc123');
  });
});

describe('runAccessibleName', () => {
  it('says what it was, what made it, and what pressing it will do', () => {
    expect(runAccessibleName(entry(), 'Settlement Generator', NOW)).toBe(
      'Roll Ashvale again — Settlement Generator, just now — seed abc123 — size: small',
    );
  });

  it('leaves the settings off entirely for a tool that has none', () => {
    expect(runAccessibleName(entry({ config: {} }), 'Heraldry Generator', NOW)).toBe(
      'Roll Ashvale again — Heraldry Generator, just now — seed abc123',
    );
  });
});
