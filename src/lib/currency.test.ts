import { test, expect, describe } from 'vitest';
import { convertCopper, convertFarthings } from './currency';

describe('convertCopper', () => {
  test('converts copper to gold, silver, copper (no electrum/platinum)', () => {
    expect(convertCopper(123, false, false)).toBe('1 gp 2 sp 3 cp');
    expect(convertCopper(99, false, false)).toBe('9 sp 9 cp');
    expect(convertCopper(10, false, false)).toBe('1 sp');
    expect(convertCopper(1, false, false)).toBe('1 cp');
  });

  test('includes electrum when enabled', () => {
    expect(convertCopper(153, true, false)).toBe('1 gp 1 ep 3 cp');
    expect(convertCopper(50, true, false)).toBe('1 ep');
  });

  test('includes platinum when enabled', () => {
    expect(convertCopper(2000, false, true)).toBe('2 pp');
    expect(convertCopper(1050, true, true)).toBe('1 pp 1 ep');
  });

  test('returns only highest denomination if enableExact is false', () => {
    expect(convertCopper(123, false, false, false)).toBe('1 gp');
    expect(convertCopper(1050, true, true, false)).toBe('1 pp');
    expect(convertCopper(50, true, false, false)).toBe('1 ep');
    expect(convertCopper(9, false, false, false)).toBe('9 cp');
  });
});

describe('convertFarthings', () => {
  test('converts farthings to pounds, crowns, shillings, pence, farthings', () => {
    expect(convertFarthings(1000)).toBe('£1 10 d');
    expect(convertFarthings(240)).toBe('1 c');
    expect(convertFarthings(48)).toBe('1 s');
    expect(convertFarthings(4)).toBe('1 d');
    expect(convertFarthings(1)).toBe('1 f');
    expect(convertFarthings(0)).toBe('');
  });

  test('handles mixed denominations', () => {
    expect(convertFarthings(1257)).toBe('£1 1 c 1 s 2 d 1 f');
    expect(convertFarthings(53)).toBe('1 s 1 d 1 f');
  });
});
