import { describe, expect, it } from 'vitest';
import {
  compareByOrder,
  isValidIdToOrder,
  maxByOrder,
  minByOrder,
  sortIdsByOrder,
  validateIdToOrder,
} from './ordered_levels';

describe('ordered_levels', () => {
  const map = new Map<string, number>([
    ['low', 0],
    ['mid', 1],
    ['high', 2],
  ]);

  it('compareByOrder follows numeric order; larger = higher', () => {
    expect(compareByOrder(map, 'low', 'high')).toBe(-1);
    expect(compareByOrder(map, 'high', 'low')).toBe(1);
    expect(compareByOrder(map, 'mid', 'mid')).toBe(0);
  });

  it('compareByOrder returns null if an id is missing', () => {
    expect(compareByOrder(map, 'low', 'unknown')).toBeNull();
  });

  it('sortIdsByOrder sorts by ascending number; unknown ids at end', () => {
    expect(sortIdsByOrder(['mid', 'low', 'high'], map)).toEqual(['low', 'mid', 'high']);
    expect(sortIdsByOrder(['nope', 'low', 'nada'], map)).toEqual(['low', 'nope', 'nada']);
  });

  it('minByOrder and maxByOrder pick extremes among ids in the map', () => {
    expect(minByOrder(map, ['mid', 'high', 'nope'])).toBe('mid');
    expect(maxByOrder(map, ['mid', 'low'])).toBe('mid');
  });

  it('minByOrder and maxByOrder return null when no id is in the map', () => {
    expect(minByOrder(map, ['nope', 'nada'])).toBeNull();
    expect(maxByOrder(map, [])).toBeNull();
  });

  it('validateIdToOrder allows ties when requireUniqueOrder is false', () => {
    const m = new Map<string, number>([
      ['a', 1],
      ['b', 1],
    ]);
    expect(validateIdToOrder(m, { requireUniqueOrder: false })).toEqual([]);
    expect(isValidIdToOrder(m, { requireUniqueOrder: false })).toBe(true);
  });

  it('validateIdToOrder reports duplicate_order when requireUniqueOrder is true', () => {
    const m = new Map<string, number>([
      ['a', 1],
      ['b', 1],
    ]);
    const err = validateIdToOrder(m, { requireUniqueOrder: true });
    expect(err).toHaveLength(1);
    expect(err[0]).toEqual({
      kind: 'duplicate_order',
      order: 1,
      firstId: 'a',
      secondId: 'b',
    });
    expect(isValidIdToOrder(m, { requireUniqueOrder: true })).toBe(false);
  });
});
