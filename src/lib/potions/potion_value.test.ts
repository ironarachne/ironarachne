import { describe, expect, it } from 'vitest';
import {
  calculateHomebrewLiquidValue,
  calculateLiquidValue,
  calculateTotalValue,
  getRarityBaseValue,
  resolveCatalogValue,
  resolveRarity,
} from './potion_value';
import { getPotionCatalogEntry, potionCatalog } from './potion_catalog';
import type { PotionCatalogVariant, PotionEffect } from './potion_types';

describe('getRarityBaseValue', () => {
  it('rises with rarity', () => {
    const order = ['common', 'uncommon', 'rare', 'epic', 'legendary'] as const;
    const values = order.map(getRarityBaseValue);
    for (let i = 1; i < values.length; i++) {
      expect(values[i]).toBeGreaterThan(values[i - 1]);
    }
  });
});

describe('calculateLiquidValue', () => {
  it('scales with magnitude around a baseline of 50', () => {
    expect(calculateLiquidValue(10000, 50)).toBe(10000);
    expect(calculateLiquidValue(10000, 100)).toBeGreaterThan(calculateLiquidValue(10000, 50));
    expect(calculateLiquidValue(10000, 25)).toBeLessThan(calculateLiquidValue(10000, 50));
  });

  it('applies a variant multiplier on top of the base value', () => {
    expect(calculateLiquidValue(10000, 50, 2)).toBeGreaterThan(calculateLiquidValue(10000, 50, 1));
  });

  it('never falls below one, however small the inputs', () => {
    expect(calculateLiquidValue(1, 1)).toBeGreaterThanOrEqual(1);
    expect(calculateLiquidValue(0, 0)).toBeGreaterThanOrEqual(1);
  });
});

describe('calculateHomebrewLiquidValue', () => {
  it('prices from the rarity band', () => {
    expect(calculateHomebrewLiquidValue('rare', 50)).toBe(
      calculateLiquidValue(getRarityBaseValue('rare'), 50),
    );
    expect(calculateHomebrewLiquidValue('legendary', 50)).toBeGreaterThan(
      calculateHomebrewLiquidValue('common', 50),
    );
  });
});

describe('calculateTotalValue', () => {
  it('adds the container to the liquid', () => {
    expect(calculateTotalValue(5000, 100)).toBe(5100);
  });

  it('handles a container worth nothing', () => {
    expect(calculateTotalValue(5000, 0)).toBe(5000);
  });
});

describe('resolveCatalogValue', () => {
  const entry = getPotionCatalogEntry('healing')!;

  function effect(magnitude: number): PotionEffect {
    return {
      id: 'healing',
      name: 'Potion of Healing',
      description: entry.effectTemplate.description,
      duration: entry.effectTemplate.duration,
      intent: entry.effectTemplate.intent,
      magnitude,
    };
  }

  it('prices a base entry from its own base value', () => {
    expect(resolveCatalogValue(entry, undefined, effect(entry.effectTemplate.magnitude))).toBe(
      calculateLiquidValue(entry.baseValue, entry.effectTemplate.magnitude),
    );
  });

  it('prices a variant from the variant’s value and magnitude ratio', () => {
    const parent = potionCatalog.find((e) => (e.variants?.length ?? 0) > 0);
    expect(parent).toBeDefined();
    const variant = parent!.variants![0];

    const priced = resolveCatalogValue(parent!, variant, {
      ...effect(variant.magnitude),
      id: parent!.id,
      name: parent!.canonicalName,
    });
    expect(priced).toBe(
      calculateLiquidValue(
        variant.baseValue,
        variant.magnitude,
        variant.magnitude / parent!.effectTemplate.magnitude,
      ),
    );
  });
});

describe('resolveRarity', () => {
  const entry = getPotionCatalogEntry('healing')!;

  it('uses the entry rarity when there is no variant', () => {
    expect(resolveRarity(entry, undefined)).toBe(entry.rarity);
  });

  it('lets a variant override the entry rarity', () => {
    const variant = { rarity: 'legendary' } as PotionCatalogVariant;
    expect(resolveRarity(entry, variant)).toBe('legendary');
  });
});
