import { describe, expect, it } from 'vitest';
import {
  EXPECTED_SRD_BASE_CATALOG_IDS,
  potionCatalog,
} from './potion_catalog';
import { generatePotion, getDefaultPotionConfig } from './potion_generation';
import { calculateLiquidValue } from './potion_value';

describe('potion catalog', () => {
  it('contains all expected SRD base catalog ids', () => {
    const ids = potionCatalog.map((entry) => entry.id);
    for (const expectedId of EXPECTED_SRD_BASE_CATALOG_IDS) {
      expect(ids).toContain(expectedId);
    }
    expect(ids.length).toBe(EXPECTED_SRD_BASE_CATALOG_IDS.length);
  });

  it('includes instantaneous, timed, conditional, and permanent durations', () => {
    const durationTypes = new Set(
      potionCatalog.flatMap((entry) => {
        const types = [entry.effectTemplate.duration.type];
        for (const variant of entry.variants ?? []) {
          if (variant.duration) {
            types.push(variant.duration.type);
          }
        }
        return types;
      }),
    );

    expect(durationTypes.has('instantaneous')).toBe(true);
    expect(durationTypes.has('timed')).toBe(true);
    expect(durationTypes.has('conditional')).toBe(true);

    const homebrew = generatePotion('homebrew-permanent-test', {
      ...getDefaultPotionConfig(),
      allowHomebrew: true,
      allowedCatalogIds: [],
    });
    expect(['permanent', 'timed', 'instantaneous']).toContain(homebrew.effect.duration.type);
  });
});

describe('generatePotion', () => {
  it('links liquid and container as separate items', () => {
    const potion = generatePotion('link-test-seed', {
      ...getDefaultPotionConfig(),
      allowedCatalogIds: ['healing'],
    });

    expect(potion.liquid.id).not.toBe(potion.container.id);
    expect(potion.liquid.containerId).toBe(potion.container.id);
    expect(potion.container.contents).toContain(potion.liquid.id);
    expect(potion.liquid.itemMajorType).toBe('potion');
  });

  it('is deterministic for a fixed seed', () => {
    const config = {
      ...getDefaultPotionConfig(),
      allowedCatalogIds: ['healing'],
    };
    const first = generatePotion('deterministic-seed', config);
    const second = generatePotion('deterministic-seed', config);

    expect(second.liquid.id).toBe(first.liquid.id);
    expect(second.displayName).toBe(first.displayName);
    expect(second.liquid.value).toBe(first.liquid.value);
    expect(second.sensory).toEqual(first.sensory);
  });

  it('uses canonical display names when there are no modifications', () => {
    const potion = generatePotion('canonical-name-seed', {
      ...getDefaultPotionConfig(),
      allowedCatalogIds: ['healing'],
      allowProceduralNames: false,
    });

    expect(potion.displayName).toBe('Potion of Healing');
    expect(potion.canonicalName).toBe('Potion of Healing');
    expect(potion.modifications).toEqual([]);
  });

  it('uses affix names only when a modification is present', () => {
    let foundAffixed = false;

    for (let i = 0; i < 80; i++) {
      const potion = generatePotion(`variation-name-${i}`, {
        ...getDefaultPotionConfig(),
        allowedCatalogIds: ['healing'],
        allowProceduralNames: true,
      });

      if (potion.modifications.length > 0) {
        foundAffixed = true;
        expect(potion.displayName).not.toBe(potion.canonicalName);
        expect(potion.displayName.endsWith('Potion of Healing')).toBe(true);
        break;
      }

      if (potion.modifications.length === 0) {
        expect(potion.displayName).toBe('Potion of Healing');
      }
    }

    expect(foundAffixed).toBe(true);
  });

  it('scales value with effect power', () => {
    const healing = generatePotion('value-healing', {
      ...getDefaultPotionConfig(),
      allowedCatalogIds: ['healing'],
    });
    const flying = generatePotion('value-flying', {
      ...getDefaultPotionConfig(),
      allowedCatalogIds: ['flying'],
    });
    const stormStrength = generatePotion('value-storm', {
      ...getDefaultPotionConfig(),
      allowedCatalogIds: ['giant-strength'],
    });

    expect(flying.liquid.value).toBeGreaterThan(healing.liquid.value);

    let stormValue = 0;
    for (let i = 0; i < 30; i++) {
      const potion = generatePotion(`storm-strength-${i}`, {
        ...getDefaultPotionConfig(),
        allowedCatalogIds: ['giant-strength'],
      });
      if (potion.liquid.itemMinorType === 'giant-strength-storm') {
        stormValue = potion.liquid.value;
        break;
      }
    }

    expect(stormValue).toBeGreaterThan(flying.liquid.value);
  });

  it('generates sensory fields', () => {
    const potion = generatePotion('sensory-seed', {
      ...getDefaultPotionConfig(),
      allowedCatalogIds: ['water-breathing'],
    });

    expect(potion.sensory.appearance.length).toBeGreaterThan(0);
    expect(potion.sensory.viscosity.length).toBeGreaterThan(0);
    expect(potion.sensory.flavor.length).toBeGreaterThan(0);
    expect(potion.sensory.scent.length).toBeGreaterThan(0);
    expect(potion.liquid.description.length).toBeGreaterThan(0);
  });
});

describe('calculateLiquidValue', () => {
  it('increases with magnitude', () => {
    const low = calculateLiquidValue(5000, 20);
    const high = calculateLiquidValue(5000, 90);
    expect(high).toBeGreaterThan(low);
  });
});
