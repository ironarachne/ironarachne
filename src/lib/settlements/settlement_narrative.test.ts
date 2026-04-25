import { describe, expect, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import { pickCategoryPlausibleLine, socialToneFromFacets } from './settlement_narrative';
import type { Settlement } from './settlement_types';
import Metropolis from './categories/metropolis';

describe('pickCategoryPlausibleLine', () => {
  const thievesLine = Metropolis.possibleDescriptions.find((d) => d.includes('thieves'))!;

  it('excludes high-crime blurbs when law and order is high', () => {
    for (let i = 0; i < 80; i++) {
      const line = pickCategoryPlausibleLine(Metropolis, 8, new RNG(`narr-1-${i}`));
      expect(line).not.toBe(thievesLine);
      expect(line.toLowerCase()).not.toMatch(/thieves|assassin/);
    }
  });

  it('can return disorder blurbs for very low order', () => {
    const found = new Set<string>();
    for (let i = 0; i < 200; i++) {
      const line = pickCategoryPlausibleLine(Metropolis, 2, new RNG(`narr-2-${i}`));
      found.add(line);
    }
    expect(Array.from(found).some((d) => d.includes('thieves'))).toBe(true);
  });
});

describe('socialToneFromFacets', () => {
  it('avoids thieving rumors when law is high', () => {
    for (let i = 0; i < 20; i++) {
      const s = {
        lawAndOrder: 9,
        commerce: 5,
        foodSecurity: 5,
        publicHealth: 5,
        settlementTags: [],
        economicRole: 'mixed' as const,
        name: 'X',
        description: '',
        category: Metropolis,
        population: 1,
        prosperity: 6,
        environment: { biome: { features: [] } },
      } as unknown as Settlement;
      const t = socialToneFromFacets(s, new RNG(`st-${i}`));
      expect(t.toLowerCase()).not.toMatch(/thieves|stabb|shakedown|knife/);
    }
  });
});
