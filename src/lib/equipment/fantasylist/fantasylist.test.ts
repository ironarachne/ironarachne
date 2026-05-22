import { describe, expect, it } from 'vitest';
import { all } from './index.js';

describe('fantasylist', () => {
  it('returns all equipment categories with valid items', () => {
    const lists = all();

    expect(lists.length).toBe(23);

    const seen = new Set<string>();
    let totalItems = 0;

    for (const list of lists) {
      expect(list.title.length).toBeGreaterThan(0);
      expect(list.items.length).toBeGreaterThan(0);

      for (const item of list.items) {
        expect(item.name.length).toBeGreaterThan(0);
        expect(item.cost).toBeGreaterThanOrEqual(0);
        const key = `${list.title}::${item.name}`;
        expect(seen.has(key)).toBe(false);
        seen.add(key);
        totalItems++;
      }
    }

    expect(totalItems).toBeGreaterThan(400);
  });
});
