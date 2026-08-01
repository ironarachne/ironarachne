import { describe, expect, it } from 'vitest';
import { getAllPotionCatalogIds, getPotionCatalogEntry, potionCatalog } from './potion_catalog';

describe('getPotionCatalogEntry', () => {
  it('finds a base entry by id', () => {
    const entry = getPotionCatalogEntry('healing');
    expect(entry?.id).toBe('healing');
    expect(entry?.canonicalName.length).toBeGreaterThan(0);
  });

  it('returns undefined for an id that is not in the catalog', () => {
    expect(getPotionCatalogEntry('elixir-of-nonsense')).toBeUndefined();
  });

  it('does not resolve variant ids, which are not top-level entries', () => {
    const variantId = potionCatalog.flatMap((e) => e.variants ?? []).at(0)?.id;
    expect(variantId).toBeDefined();
    expect(getPotionCatalogEntry(variantId!)).toBeUndefined();
  });
});

describe('getAllPotionCatalogIds', () => {
  it('lists every base entry', () => {
    const ids = getAllPotionCatalogIds();
    for (const entry of potionCatalog) {
      expect(ids).toContain(entry.id);
    }
  });

  it('lists variant ids alongside their base entry', () => {
    const ids = getAllPotionCatalogIds();
    const variantIds = potionCatalog.flatMap((entry) => (entry.variants ?? []).map((v) => v.id));

    expect(variantIds.length).toBeGreaterThan(0);
    for (const variantId of variantIds) {
      expect(ids).toContain(variantId);
    }
    expect(ids.length).toBe(potionCatalog.length + variantIds.length);
  });

  it('returns no duplicates, so an id always identifies one thing', () => {
    const ids = getAllPotionCatalogIds();
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('the catalog itself', () => {
  it('gives every entry a usable shape', () => {
    for (const entry of potionCatalog) {
      expect(entry.id.length).toBeGreaterThan(0);
      expect(entry.canonicalName.length).toBeGreaterThan(0);
      expect(entry.baseValue).toBeGreaterThan(0);
      expect(['drink', 'oil', 'ointment']).toContain(entry.form);
      expect(entry.tags.length).toBeGreaterThan(0);
      expect(entry.effectTemplate.description.length).toBeGreaterThan(0);
      expect(entry.effectTemplate.magnitude).toBeGreaterThan(0);
    }
  });

  it('gives every variant a value and magnitude to scale from', () => {
    for (const entry of potionCatalog) {
      for (const variant of entry.variants ?? []) {
        expect(variant.id.startsWith(entry.id)).toBe(true);
        expect(variant.baseValue).toBeGreaterThan(0);
        expect(variant.magnitude).toBeGreaterThan(0);
      }
    }
  });
});
