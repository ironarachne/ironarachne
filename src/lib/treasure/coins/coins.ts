import type { CoinSystem, CoinType } from './coin_types';

/**
 * Get appropriate coin types for a given value.
 *
 * @param value The value to find appropriate coin types for
 * @param coinSystem The coin system to use
 * @returns An array of appropriate coin types
 */
export function getAppropriateCoinTypes(value: number, coinSystem: CoinSystem): CoinType[] {
  // Filter out coins that are too valuable for the target value
  const possibleCoins = coinSystem.denominations.filter((d) => d.value <= value);

  if (possibleCoins.length === 0) {
    return [];
  }

  // If the value is very small, we should prefer smaller denominations
  // If the value is large, we should prefer larger denominations, but still respect rarity

  // Let's define "appropriate" as:
  // 1. The coin value is not greater than the total value.
  // 2. The coin value is not "too small" for the total value (e.g. 10000 copper pieces is annoying).
  //    Let's say we don't want more than 5000 coins in a pile usually?
  //    So coin.value >= value / 5000.

  const reasonableCoins = possibleCoins.filter((d) => d.value >= value / 5000);

  // If we filtered everything out (e.g. value is huge but we only have small coins?), fallback to possibleCoins
  const candidates = reasonableCoins.length > 0 ? reasonableCoins : possibleCoins;

  // Now sort by rarity (descending)
  return candidates.sort((a, b) => (b.rarity || 0) - (a.rarity || 0));
}

/**
 * Get the default coin system.
 *
 * @returns The default coin system
 */
export function getDefaultCoinSystem(): CoinSystem {
  return {
    denominations: [
      { name: 'copper', value: 1, weightPerUnit: 0.001, rarity: 20 },
      { name: 'silver', value: 10, weightPerUnit: 0.001, rarity: 10 },
      { name: 'electrum', value: 50, weightPerUnit: 0.001, rarity: 1 },
      { name: 'gold', value: 100, weightPerUnit: 0.001, rarity: 15 },
      { name: 'platinum', value: 1000, weightPerUnit: 0.001, rarity: 5 },
    ],
  };
}

/**
 * Get all coin types that have a value greater than the specified value.
 *
 * @param value The value to compare against
 * @param coinSystem The coin system to use
 * @returns An array of coin types with value greater than the specified value
 */
export function getCoinTypesAboveValue(value: number, coinSystem: CoinSystem): CoinType[] {
  return coinSystem.denominations.filter((denomination) => denomination.value > value);
}

/**
 * Get all coin types that have a value less than the specified value.
 *
 * @param value The value to compare against
 * @param coinSystem The coin system to use
 * @returns An array of coin types with value less than the specified value
 */
export function getCoinTypesBelowValue(value: number, coinSystem: CoinSystem): CoinType[] {
  return coinSystem.denominations.filter((denomination) => denomination.value < value);
}

/**
 * Get the index of a coin type in the coin system's denominations list.
 *
 * @param denominationName The name of the denomination to find
 * @param coinSystem The coin system to use
 * @returns The index of the coin type, or -1 if not found
 */
export function getIndexOfCoinType(denominationName: string, coinSystem: CoinSystem): number {
  return coinSystem.denominations.findIndex(
    (denomination) => denomination.name === denominationName,
  );
}

/**
 * Get the highest value coin type that is less than or equal to the specified value.
 *
 * @param value The value to match
 * @param coinSystem The coin system to use
 * @returns The highest value coin type that fits within the value
 */
export function getMaxCoinTypeForValue(value: number, coinSystem: CoinSystem): CoinType {
  const sortedDenominations = coinSystem.denominations.slice().sort((a, b) => b.value - a.value);
  for (const denomination of sortedDenominations) {
    if (value >= denomination.value) {
      return denomination;
    }
  }
  return sortedDenominations[sortedDenominations.length - 1];
}
