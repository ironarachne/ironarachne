import { generateDomainSet } from './domain_generation';
import type { Domain, DomainFilter } from './domain_types';
import { describe, it, expect } from 'vitest';

const mockDomains: Domain[] = [
  {
    name: 'Light',
    holyItems: ['Candle'],
    holySymbols: ['Sun'],
    enchantmentNames: [],
    mutators: [],
    tags: ['good', 'day'],
  },
  {
    name: 'Darkness',
    holyItems: [],
    holySymbols: ['Moon'],
    enchantmentNames: [],
    mutators: [],
    tags: ['evil', 'night'],
  },
  {
    name: 'Nature',
    holyItems: ['Leaf'],
    holySymbols: [],
    enchantmentNames: [],
    mutators: [],
    tags: ['neutral', 'life'],
  },
  {
    name: 'War',
    holyItems: ['Sword'],
    holySymbols: ['Shield'],
    enchantmentNames: [],
    mutators: [],
    tags: ['conflict', 'strength'],
  },
];

describe('generateDomainSet', () => {
  it('returns a single domain when minDomains and maxDomains are 1', () => {
    const filter: DomainFilter = {
      name: null,
      hasHolyItems: null,
      hasHolySymbols: null,
      hasEnchantments: null,
      requiredTags: [],
      excludedTags: [],
    };
    const result = generateDomainSet('seed1', mockDomains, filter, 1, 1);
    expect(result.primary).toBeDefined();
    expect(result.secondary).toBeNull();
    expect(result.tertiary).toBeNull();
  });

  it('returns two domains when minDomains and maxDomains are 2', () => {
    const filter: DomainFilter = {
      name: null,
      hasHolyItems: null,
      hasHolySymbols: null,
      hasEnchantments: null,
      requiredTags: [],
      excludedTags: [],
    };
    const result = generateDomainSet('seed2', mockDomains, filter, 2, 2);
    expect(result.primary).toBeDefined();
    expect(result.secondary).toBeDefined();
    expect(result.tertiary).toBeNull();
    expect(result.primary).not.toEqual(result.secondary);
  });

  it('returns three domains when minDomains and maxDomains are 3', () => {
    const filter: DomainFilter = {
      name: null,
      hasHolyItems: null,
      hasHolySymbols: null,
      hasEnchantments: null,
      requiredTags: [],
      excludedTags: [],
    };
    const result = generateDomainSet('seed3', mockDomains, filter, 3, 3);
    expect(result.primary).toBeDefined();
    expect(result.secondary).toBeDefined();
    expect(result.tertiary).toBeDefined();
    expect(result.primary).not.toEqual(result.secondary);
    expect(result.primary).not.toEqual(result.tertiary);
    expect(result.secondary).not.toEqual(result.tertiary);
  });

  it('filters domains by requiredTags', () => {
    const filter: DomainFilter = {
      name: null,
      hasHolyItems: null,
      hasHolySymbols: null,
      hasEnchantments: null,
      requiredTags: ['good'],
      excludedTags: [],
    };
    const result = generateDomainSet('seed4', mockDomains, filter, 1, 1);
    expect(result.primary?.tags).toContain('good');
  });

  it('filters domains by excludedTags', () => {
    const filter: DomainFilter = {
      name: null,
      hasHolyItems: null,
      hasHolySymbols: null,
      hasEnchantments: null,
      requiredTags: [],
      excludedTags: ['evil'],
    };
    const result = generateDomainSet('seed5', mockDomains, filter, 1, 1);
    expect(result.primary?.tags).not.toContain('evil');
  });

  it('falls back to unfiltered list if filter excludes all', () => {
    const filter: DomainFilter = {
      name: null,
      hasHolyItems: null,
      hasHolySymbols: null,
      hasEnchantments: null,
      requiredTags: ['nonexistent'],
      excludedTags: [],
    };
    const result = generateDomainSet('seed6', mockDomains, filter, 1, 1);
    expect(result.primary).toBeDefined();
  });

  it('filters by hasHolyItems', () => {
    const filter: DomainFilter = {
      name: null,
      hasHolyItems: false,
      hasHolySymbols: null,
      hasEnchantments: null,
      requiredTags: [],
      excludedTags: [],
    };
    const result = generateDomainSet('seed7', mockDomains, filter, 1, 1);
    expect(result.primary?.holyItems.length).toBeGreaterThan(0);
  });

  it('filters by hasHolySymbols', () => {
    const filter: DomainFilter = {
      name: null,
      hasHolyItems: null,
      hasHolySymbols: false,
      hasEnchantments: null,
      requiredTags: [],
      excludedTags: [],
    };
    const result = generateDomainSet('seed8', mockDomains, filter, 1, 1);
    expect(result.primary?.holySymbols.length).toBeGreaterThan(0);
  });
});
