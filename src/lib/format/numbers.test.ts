import { expect, describe, it } from 'vitest';
import { formatNumber } from './numbers';

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
