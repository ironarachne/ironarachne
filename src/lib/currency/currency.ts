import type { CurrencySystem, CurrencyAmount, CurrencyDenomination } from './types';
import { STANDARD_FANTASY } from './systems';

/**
 * Converts a total value (in the base unit) to a formatted string representation
 * using the largest possible denominations.
 *
 * @param value The total value in the base unit.
 * @param system The currency system to use.
 * @param exact If true, returns all coins. If false, returns only the largest denomination.
 * @returns A formatted string (e.g., "10 gp 5 sp").
 */
export function valueToString(
  value: number,
  system: CurrencySystem = STANDARD_FANTASY,
  exact: boolean = true
): string {
  const amounts = valueToAmounts(value, system);
  const formatter = new Intl.NumberFormat();

  if (!exact && amounts.length > 0) {
    const largest = amounts[0];
    const denom = system.denominations.find((d) => d.name === largest.denomination);
    const symbol = denom?.symbol || denom?.name || '';
    return `${formatter.format(largest.amount)} ${symbol}`.trim();
  }

  return amounts
    .map((a) => {
      const denom = system.denominations.find((d) => d.name === a.denomination);
      const symbol = denom?.symbol || denom?.name || '';
      return `${formatter.format(a.amount)} ${symbol}`;
    })
    .join(' ')
    .trim();
}

/**
 * Breaks down a total value into a list of currency amounts using the largest possible denominations.
 *
 * @param value The total value in the base unit.
 * @param system The currency system to use.
 * @returns An array of CurrencyAmount objects.
 */
export function valueToAmounts(
  value: number,
  system: CurrencySystem = STANDARD_FANTASY
): CurrencyAmount[] {
  let remaining = value;
  const result: CurrencyAmount[] = [];

  // Sort denominations by value descending
  const sortedDenoms = [...system.denominations].sort((a, b) => b.value - a.value);

  for (const denom of sortedDenoms) {
    if (remaining >= denom.value) {
      const count = Math.floor(remaining / denom.value);
      if (count > 0) {
        result.push({ amount: count, denomination: denom.name });
        remaining -= count * denom.value;
      }
    }
  }

  // Handle any remaining fractional value if necessary, or just leave it?
  // For now, we assume integer values for base units, but if remaining > 0 and < smallest denom,
  // it might be lost or need a fractional representation.
  // If the smallest unit is 1, remaining should be 0.

  return result;
}

/**
 * Converts a list of currency amounts to the total value in the base unit.
 *
 * @param amounts The list of currency amounts.
 * @param system The currency system to use.
 * @returns The total value in the base unit.
 */
export function amountsToValue(
  amounts: CurrencyAmount[],
  system: CurrencySystem = STANDARD_FANTASY
): number {
  let total = 0;
  for (const amount of amounts) {
    const denom = system.denominations.find((d) => d.name === amount.denomination);
    if (denom) {
      total += amount.amount * denom.value;
    }
  }
  return total;
}

/**
 * Converts a value from one denomination to another.
 *
 * @param amount The amount to convert.
 * @param fromDenom The name of the source denomination.
 * @param toDenom The name of the target denomination.
 * @param system The currency system to use.
 * @returns The converted amount.
 */
export function convert(
  amount: number,
  fromDenom: string,
  toDenom: string,
  system: CurrencySystem = STANDARD_FANTASY
): number {
  const from = system.denominations.find((d) => d.name === fromDenom);
  const to = system.denominations.find((d) => d.name === toDenom);

  if (!from || !to) {
    throw new Error(`Invalid denomination: ${!from ? fromDenom : toDenom}`);
  }

  const baseValue = amount * from.value;
  return baseValue / to.value;
}

/**
 * Get all coin types that have a value greater than the specified value.
 *
 * @param value The value to compare against
 * @param coinSystem The coin system to use
 * @returns An array of coin types with value greater than the specified value
 */
export function getCoinTypesAboveValue(value: number, coinSystem: CurrencySystem): CurrencyDenomination[] {
  return coinSystem.denominations.filter((denomination) => denomination.value > value);
}

/**
 * Get all coin types that have a value less than the specified value.
 *
 * @param value The value to compare against
 * @param coinSystem The coin system to use
 * @returns An array of coin types with value less than the specified value
 */
export function getCoinTypesBelowValue(value: number, coinSystem: CurrencySystem): CurrencyDenomination[] {
  return coinSystem.denominations.filter((denomination) => denomination.value < value);
}

/**
 * Get the index of a coin type in the coin system's denominations list.
 *
 * @param denominationName The name of the denomination to find
 * @param coinSystem The coin system to use
 * @returns The index of the coin type, or -1 if not found
 */
export function getIndexOfCoinType(denominationName: string, coinSystem: CurrencySystem): number {
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
export function getMaxCoinTypeForValue(value: number, coinSystem: CurrencySystem): CurrencyDenomination {
  const sortedDenominations = coinSystem.denominations.slice().sort((a, b) => b.value - a.value);
  for (const denomination of sortedDenominations) {
    if (value >= denomination.value) {
      return denomination;
    }
  }
  return sortedDenominations[sortedDenominations.length - 1];
}

/**
 * Get appropriate coin types for a given value.
 *
 * @param value The value to find appropriate coin types for
 * @param coinSystem The coin system to use
 * @returns An array of appropriate coin types
 */
export function getAppropriateCoinTypes(value: number, coinSystem: CurrencySystem): CurrencyDenomination[] {
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
