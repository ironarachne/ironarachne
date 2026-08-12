import { describe, expect, it } from 'vitest';
import type ADNDArmor from './adndarmor.js';

describe('ADNDArmor', () => {
  it('stores name, ac, weight, and cost', () => {
    const armor: ADNDArmor = {
      name: 'leather armor',
      ac: 2,
      weight: 15,
      cost: 5 * 100,
    };
    expect(armor.name).toBe('leather armor');
    expect(armor.ac).toBe(2);
    expect(armor.weight).toBe(15);
    expect(armor.cost).toBe(500);
  });
});
