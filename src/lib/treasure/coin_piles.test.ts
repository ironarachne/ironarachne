import { describe, it, expect } from 'vitest';
import {
  generatePileOfCoins,
  decreaseValueOfPileOfCoins,
  getDenominationProportionsUpToDenomination,
  getMaxDenominationForValue,
  getSetOfCoinsForValue,
  getPileOfCoinsForValue,
  increaseValueOfPileOfCoins,
  splitPileOfCoins,
  CoinDenominations
} from './coin_piles';

describe('coin_piles', () => {
  describe('generatePileOfCoins', () => {
    it('should create a pile of coins', () => {
      const pile = generatePileOfCoins('test-id', 'gold', 10, 1000);
      expect(pile.id).toBe('test-id');
      expect(pile.denomination).toBe('gold');
      expect(pile.quantity).toBe(10);
      expect(pile.value).toBe(1000);
    });
  });

  describe('decreaseValueOfPileOfCoins', () => {
    it('should decrease the value and quantity of coins', () => {
      const pile = generatePileOfCoins('test-id', 'gold', 10, 1000);
      const newPile = decreaseValueOfPileOfCoins(pile, 200);

      expect(newPile.value).toBe(800);
      expect(newPile.quantity).toBe(8);
    });

    it('should handle reducing more than available value', () => {
      const pile = generatePileOfCoins('test-id', 'gold', 10, 1000);
      const newPile = decreaseValueOfPileOfCoins(pile, 1200);

      expect(newPile.value).toBe(0);
      expect(newPile.quantity).toBe(0);
    });
  });

  describe('getDenominationProportionsUpToDenomination', () => {
    it('should return correct proportions for gold', () => {
      const proportions = getDenominationProportionsUpToDenomination('gold');
      // Based on the deterministic logic implemented previously
      // gold index is 3. lowerDenominationCount = 3.
      // baseAmount = floor(10/3) = 3. remainder = 1.
      // copper (0): 3 + 1 = 4
      // silver (1): 3
      // electrum (2): 3
      // gold (3): 10
      // platinum (4): 0

      expect(proportions.gold).toBe(10);
      expect(proportions.platinum).toBe(0);
      expect(proportions.copper).toBe(4);
      expect(proportions.silver).toBe(3);
      expect(proportions.electrum).toBe(3);
    });

    it('should return correct proportions for copper', () => {
      const proportions = getDenominationProportionsUpToDenomination('copper');
      // copper index is 0. lowerDenominationCount = 0.
      // baseAmount = 0. remainder = 0.
      // copper (0): 10

      expect(proportions.copper).toBe(10);
      expect(proportions.silver).toBe(0);
    });
  });

  describe('getMaxDenominationForValue', () => {
    it('should return platinum for high value', () => {
      expect(getMaxDenominationForValue(2000)).toBe('platinum');
    });

    it('should return gold if platinum is disabled', () => {
      expect(getMaxDenominationForValue(2000, true, false)).toBe('gold');
    });

    it('should return copper for low value', () => {
      expect(getMaxDenominationForValue(5)).toBe('copper');
    });
  });

  describe('getSetOfCoinsForValue', () => {
    it('should distribute value according to proportions', () => {
      const proportions = {
        copper: 0,
        silver: 0,
        electrum: 0,
        gold: 1,
        platinum: 0
      };
      const result = getSetOfCoinsForValue(1000, proportions);

      // 1000 value in gold (100 each) -> 10 gold coins
      const goldPile = result.piles.find(p => p.denomination === 'gold');
      expect(goldPile).toBeDefined();
      expect(goldPile?.quantity).toBe(10);
    });
  });

  describe('getPileOfCoinsForValue', () => {
    it('should return a single pile for a value', () => {
      const pile = getPileOfCoinsForValue(100); // 1 gold
      expect(pile.denomination).toBe('gold');
      expect(pile.quantity).toBe(1);
    });

    it('should return copper for small value', () => {
      const pile = getPileOfCoinsForValue(5); // 5 copper
      expect(pile.denomination).toBe('copper');
      expect(pile.quantity).toBe(5);
    });
  });

  describe('increaseValueOfPileOfCoins', () => {
    it('should increase value and quantity', () => {
      const pile = generatePileOfCoins('test-id', 'gold', 10, 1000);
      const newPile = increaseValueOfPileOfCoins(pile, 200);

      expect(newPile.value).toBe(1200);
      expect(newPile.quantity).toBe(12);
    });
  });

  describe('splitPileOfCoins', () => {
    it('should split a pile into smaller piles', () => {
      const pile = generatePileOfCoins('test-id', 'gold', 10, 1000);
      const piles = splitPileOfCoins(pile, 3);

      // 10 coins split by 3 -> 3, 3, 3, 1
      expect(piles).toHaveLength(4);
      expect(piles[0].quantity).toBe(3);
      expect(piles[3].quantity).toBe(1);
    });

    it('should return original pile if split quantity is larger', () => {
      const pile = generatePileOfCoins('test-id', 'gold', 10, 1000);
      const piles = splitPileOfCoins(pile, 20);

      expect(piles).toHaveLength(1);
      expect(piles[0]).toBe(pile);
    });
  });
});
