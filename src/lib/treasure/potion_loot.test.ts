import { describe, expect, it } from 'vitest';
import { baseContainerTypes, generateContainer } from '$lib/equipment';
import {
  flattenPotionsToItems,
  getPotionTotalValue,
  getRandomPotionsForValue,
  packPotionContainers,
} from './potion_loot';
import { generateRandomTreasureHoard } from './treasure_hoard';

describe('potion_loot', () => {
  it('generates potions up to a target value budget', () => {
    const potions = getRandomPotionsForValue('potion-loot-budget', 50000, {
      allowHomebrew: false,
      allowProceduralNames: false,
      allowedCatalogIds: ['healing', 'climbing'],
      containerConfig: {
        allowLockedContainers: false,
        allowUnlockedContainers: true,
        onlyLiquidContainers: true,
      },
    });

    expect(potions.length).toBeGreaterThan(0);

    const totalValue = potions.reduce((sum, potion) => sum + getPotionTotalValue(potion), 0);
    expect(totalValue).toBeGreaterThan(0);
    expect(totalValue).toBeLessThanOrEqual(55000);
  });

  it('returns separate container and liquid items', () => {
    const potions = getRandomPotionsForValue('potion-loot-items', 10000, {
      allowHomebrew: false,
      allowProceduralNames: false,
      allowedCatalogIds: ['healing'],
      containerConfig: {
        allowLockedContainers: false,
        allowUnlockedContainers: true,
        onlyLiquidContainers: true,
      },
    });

    const items = flattenPotionsToItems(potions);
    const liquids = items.filter((item) => item.itemMajorType === 'potion');
    const containers = items.filter((item) => item.itemMajorType === 'container');

    expect(liquids.length).toBe(potions.length);
    expect(containers.length).toBe(potions.length);

    for (const liquid of liquids) {
      expect(liquid.containerId).toBeDefined();
    }
  });

  it('packs potion vials into hoard containers when they fit', () => {
    const potions = getRandomPotionsForValue('potion-loot-pack', 10000, {
      allowHomebrew: false,
      allowProceduralNames: false,
      allowedCatalogIds: ['healing'],
      containerConfig: {
        allowLockedContainers: false,
        allowUnlockedContainers: true,
        onlyLiquidContainers: true,
      },
    });

    const chestType = baseContainerTypes.find((type) => type.name === 'wooden chest');
    expect(chestType).toBeDefined();
    const chest = generateContainer('chest-1', chestType!);

    packPotionContainers(
      potions.map((potion) => potion.container),
      [chest],
    );

    expect(potions.length).toBeGreaterThan(0);
    expect(chest.contents.length).toBeGreaterThan(0);
  });
});

describe('generateRandomTreasureHoard potions', () => {
  it('includes potions when potion proportion is set', () => {
    const hoard = generateRandomTreasureHoard('hoard-with-potions', {
      targetValue: 50000,
      artObjectProportion: 0,
      gemProportion: 0,
      coinProportions: 0,
      mundaneItemProportion: 0,
      magicItemProportion: 0,
      potionProportion: 1,
      allowedContainerTypes: baseContainerTypes.filter((type) => type.value < 1000),
    });

    const potions = hoard.filter((item) => item.itemMajorType === 'potion');
    expect(potions.length).toBeGreaterThan(0);
  });

  it('omits potions when potion proportion is zero', () => {
    const hoard = generateRandomTreasureHoard('hoard-without-potions', {
      targetValue: 50000,
      artObjectProportion: 0,
      gemProportion: 0,
      coinProportions: 0,
      mundaneItemProportion: 0,
      magicItemProportion: 0,
      potionProportion: 0,
      allowedContainerTypes: baseContainerTypes.filter((type) => type.value < 1000),
    });

    const potions = hoard.filter((item) => item.itemMajorType === 'potion');
    expect(potions).toHaveLength(0);
  });
});
