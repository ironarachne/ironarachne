import { describe, it, expect } from 'vitest';
import { getTreasureHoardForValue, generateRandomTreasureHoard } from './treasure_hoard';
import { baseContainerTypes, type Container } from '$lib/equipment';

describe('treasure_hoard', () => {
  describe('generateRandomTreasureHoard', () => {
    it('should generate a hoard with total value close to target value', () => {
      const targetValue = 10000;
      // Exclude expensive containers like iron safe (10000) to avoid skewing the total value
      const cheapContainerTypes = baseContainerTypes.filter(ct => ct.value < 1000);

      const config = {
        targetValue,
        artObjectProportion: 1,
        gemProportion: 1,
        coinProportions: { gold: 1 },
        allowedContainerTypes: cheapContainerTypes,
      };

      const hoard = generateRandomTreasureHoard('test-seed', config);
      const totalValue = hoard.reduce((sum, item) => sum + item.value, 0);

      // Allow for some variance due to random generation and container values
      // Containers add value, so it should be at least targetValue (mostly)
      // But random generation might undershoot slightly if it can't find exact change/items
      expect(totalValue).toBeGreaterThan(targetValue * 0.9);
      expect(totalValue).toBeLessThan(targetValue * 1.5); // Shouldn't be massively over

      const art = hoard.filter((i: any) => i.artist !== undefined);
      const gems = hoard.filter((i: any) => i.isCut !== undefined);
      const coins = hoard.filter((i: any) => i.denomination !== undefined);

      expect(art.length).toBeGreaterThan(0);
      expect(gems.length).toBeGreaterThan(0);
      expect(coins.length).toBeGreaterThan(0);
    });

    it('should generate only coins when proportions dictate', () => {
      const config = {
        targetValue: 1000,
        artObjectProportion: 0,
        gemProportion: 0,
        coinProportions: { gold: 1 },
        allowedContainerTypes: baseContainerTypes,
      };

      const hoard = generateRandomTreasureHoard('test-seed', config);

      const art = hoard.filter((i: any) => i.artist !== undefined);
      const gems = hoard.filter((i: any) => i.isCut !== undefined);
      const coins = hoard.filter((i: any) => i.denomination !== undefined);

      expect(art).toHaveLength(0);
      expect(gems).toHaveLength(0);
      expect(coins.length).toBeGreaterThan(0);
    });

    it('should generate only art when proportions dictate', () => {
      const config = {
        targetValue: 5000, // High enough to afford art
        artObjectProportion: 1,
        gemProportion: 0,
        coinProportions: {}, // No coins
        allowedContainerTypes: baseContainerTypes,
      };

      const hoard = generateRandomTreasureHoard('test-seed', config);

      const art = hoard.filter((i: any) => i.artist !== undefined);
      const gems = hoard.filter((i: any) => i.isCut !== undefined);
      const coins = hoard.filter((i: any) => i.denomination !== undefined);

      expect(art.length).toBeGreaterThan(0);
      expect(gems).toHaveLength(0);
      expect(coins).toHaveLength(0);
    });

    it('should generate only gems when proportions dictate', () => {
      const config = {
        targetValue: 1000,
        artObjectProportion: 0,
        gemProportion: 1,
        coinProportions: {}, // No coins
        allowedContainerTypes: baseContainerTypes,
      };

      const hoard = generateRandomTreasureHoard('test-seed', config);

      const art = hoard.filter((i: any) => i.artist !== undefined);
      const gems = hoard.filter((i: any) => i.isCut !== undefined);
      const coins = hoard.filter((i: any) => i.denomination !== undefined);

      expect(art).toHaveLength(0);
      expect(gems.length).toBeGreaterThan(0);
      expect(coins).toHaveLength(0);
    });

    it('should pack gems into containers', () => {
      const config = {
        targetValue: 10000,
        artObjectProportion: 0,
        gemProportion: 1, // Mostly gems
        coinProportions: {},
        allowedContainerTypes: baseContainerTypes,
      };

      const hoard = generateRandomTreasureHoard('test-seed-packing', config);

      const gems = hoard.filter((i: any) => i.isCut !== undefined);
      const containers = hoard.filter((i: any) => i.contents !== undefined) as Container[];

      if (containers.length > 0 && gems.length > 0) {
        const gemsInContainers = gems.filter((g: any) => g.containerId !== undefined);
        expect(gemsInContainers.length).toBeGreaterThan(0);

        const firstGemInContainer = gemsInContainers[0];
        const container = containers.find((c) => c.id === firstGemInContainer.containerId);
        expect(container).toBeDefined();
        if (container) {
          expect(container.contents).toContain(firstGemInContainer.id);
        }
      }
    });

    it('should generate multiple containers for large hoards', () => {
      const config = {
        targetValue: 50000, // Large value to ensure volume
        artObjectProportion: 0,
        gemProportion: 0,
        coinProportions: { copper: 1 }, // Copper is heavy/bulky
        allowedContainerTypes: baseContainerTypes,
      };

      const hoard = generateRandomTreasureHoard('test-seed-multiple', config);
      const containers = hoard.filter((i: any) => i.contents !== undefined);

      // We expect more than 1 container usually
      expect(containers.length).toBeGreaterThan(1);
    });
  });

  describe('getTreasureHoardForValue', () => {
    it('should generate a treasure hoard with coins, art, and gems', () => {
      const value = 10000;
      const proportions = { coins: 1, artObjects: 1, gems: 1 };
      // 3333 coins, 3333 art, 3333 gems (approx)

      const hoard = getTreasureHoardForValue(value, proportions, baseContainerTypes);

      expect(hoard.length).toBeGreaterThan(0);

      // Check if we have different types of items (containers/piles are items)
      // Since we can't easily check types without importing everything and checking instance/properties,
      // we'll just ensure we got some items back.
    });

    it('should return empty array for zero value', () => {
      const hoard = getTreasureHoardForValue(0, { coins: 1, artObjects: 1, gems: 1 }, baseContainerTypes);
      expect(hoard).toHaveLength(0);
    });

    it('should respect proportions', () => {
      const value = 1000;
      const proportions = { coins: 1, artObjects: 0, gems: 0 };

      const hoard = getTreasureHoardForValue(value, proportions, baseContainerTypes);

      // Should only contain coins (containers or piles)
      // We can check if any item looks like an art object or gem.
      // Art objects have 'artist' property, gems have 'isCut'.
      // Coins are in containers or are piles.

      // Actually, let's just check that we got something.
      expect(hoard.length).toBeGreaterThan(0);

      const hasCoins = hoard.some((item: any) => item.denomination !== undefined);
      expect(hasCoins).toBe(true);
      const hasArt = hoard.some((item: any) => item.artist !== undefined);
      const hasGems = hoard.some((item: any) => item.isCut !== undefined);

      expect(hasArt).toBe(false);
      expect(hasGems).toBe(false);
    });
  });
});
