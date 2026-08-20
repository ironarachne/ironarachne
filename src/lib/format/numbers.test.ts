import { expect, describe, it } from 'vitest';
import { formatBytes, formatNumber } from './numbers';

describe('formatNumber', () => {
  it('defaults to two fraction digits', () => {
    expect(formatNumber(1.5)).toBe('1.50');
  });

  it('pads whole numbers to the default precision', () => {
    expect(formatNumber(3)).toBe('3.00');
  });

  it('groups thousands with separators', () => {
    expect(formatNumber(1234567.891)).toBe('1,234,567.89');
  });

  it('honours an explicit precision', () => {
    expect(formatNumber(1.23456, 3)).toBe('1.235');
  });

  it('rounds away fraction digits when precision is zero', () => {
    expect(formatNumber(1.6, 0)).toBe('2');
  });

  it('formats negative numbers', () => {
    expect(formatNumber(-1234.5)).toBe('-1,234.50');
  });

  it('formats zero', () => {
    expect(formatNumber(0)).toBe('0.00');
  });
});

describe('formatBytes', () => {
  it('shows whole bytes below a kilobyte', () => {
    expect(formatBytes(812)).toBe('812 B');
  });

  it('steps up through the binary units', () => {
    expect(formatBytes(1024)).toBe('1.0 KB');
    expect(formatBytes(1024 * 1024)).toBe('1.0 MB');
    expect(formatBytes(1024 * 1024 * 1024)).toBe('1.0 GB');
  });

  it('keeps one decimal place above a kilobyte', () => {
    expect(formatBytes(4300)).toBe('4.2 KB');
  });

  it('stops at gigabytes rather than inventing a larger unit', () => {
    // A browser origin quota is measured in tens or hundreds of megabytes, so anything past GB is
    // a number that cannot occur; capping keeps the unit list short rather than aspirational.
    expect(formatBytes(5 * 1024 ** 4)).toBe('5120.0 GB');
  });

  it('reports an empty project as zero rather than as nothing', () => {
    // The projects page lists a project with no artifacts, and a blank cell there reads as a
    // failure to load rather than as an empty project.
    expect(formatBytes(0)).toBe('0 B');
  });

  it('treats nonsense as zero', () => {
    expect(formatBytes(-1)).toBe('0 B');
    expect(formatBytes(Number.NaN)).toBe('0 B');
  });
});
