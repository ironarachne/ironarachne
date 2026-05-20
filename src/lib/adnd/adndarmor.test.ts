import { describe, expect, it } from 'vitest';
import ADNDArmor from './adndarmor.js';

describe('ADNDArmor', () => {
  it('stores name, ac, weight, and cost', () => {
    const armor = new ADNDArmor('leather armor', 2, 15, 5 * 100);
    expect(armor.name).toBe('leather armor');
    expect(armor.ac).toBe(2);
    expect(armor.weight).toBe(15);
    expect(armor.cost).toBe(500);
  });
});
