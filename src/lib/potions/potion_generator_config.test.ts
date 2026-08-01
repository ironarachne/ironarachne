import { describe, expect, it } from 'vitest';
import { potionCatalog } from './potion_catalog';
import { filterCatalogEntries, getDefaultPotionConfig } from './potion_generator_config';

describe('getDefaultPotionConfig', () => {
  it('starts closed to homebrew and procedural names, and open to unlocked liquid containers', () => {
    const config = getDefaultPotionConfig();
    expect(config.allowHomebrew).toBe(false);
    expect(config.allowProceduralNames).toBe(false);
    expect(config.containerConfig).toEqual({
      allowLockedContainers: false,
      allowUnlockedContainers: true,
      onlyLiquidContainers: true,
    });
  });

  it('leaves the catalog filters unset, so nothing is excluded by default', () => {
    const config = getDefaultPotionConfig();
    expect(filterCatalogEntries(potionCatalog, config)).toEqual(potionCatalog);
  });
});

describe('filterCatalogEntries', () => {
  const base = getDefaultPotionConfig();

  it('keeps only the requested ids', () => {
    const filtered = filterCatalogEntries(potionCatalog, {
      ...base,
      allowedCatalogIds: ['healing', 'flying'],
    });
    expect(filtered.map((e) => e.id).sort()).toEqual(['flying', 'healing']);
  });

  it('keeps only the requested rarities', () => {
    const filtered = filterCatalogEntries(potionCatalog, { ...base, allowedRarities: ['common'] });
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every((e) => e.rarity === 'common')).toBe(true);
  });

  it('keeps only the requested forms', () => {
    const filtered = filterCatalogEntries(potionCatalog, { ...base, allowedForms: ['oil'] });
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every((e) => e.form === 'oil')).toBe(true);
  });

  it('applies every filter at once', () => {
    const oils = filterCatalogEntries(potionCatalog, { ...base, allowedForms: ['oil'] });
    const target = oils[0];
    const filtered = filterCatalogEntries(potionCatalog, {
      ...base,
      allowedCatalogIds: [target.id],
      allowedRarities: [target.rarity],
      allowedForms: ['oil'],
    });
    expect(filtered).toEqual([target]);
  });

  it('returns nothing when the filters cannot all be satisfied', () => {
    const filtered = filterCatalogEntries(potionCatalog, {
      ...base,
      allowedCatalogIds: ['healing'],
      allowedForms: ['oil'],
    });
    expect(filtered).toEqual([]);
  });

  it('treats an empty filter list as no filter rather than as excluding everything', () => {
    const filtered = filterCatalogEntries(potionCatalog, {
      ...base,
      allowedCatalogIds: [],
      allowedRarities: [],
      allowedForms: [],
    });
    expect(filtered).toEqual(potionCatalog);
  });
});
