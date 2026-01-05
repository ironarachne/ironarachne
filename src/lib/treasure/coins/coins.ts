import { STANDARD_FANTASY } from '$lib/currency/systems';
export {
  getAppropriateCoinTypes,
  getCoinTypesAboveValue,
  getCoinTypesBelowValue,
  getIndexOfCoinType,
  getMaxCoinTypeForValue
} from '$lib/currency/currency';

/**
 * Get the default coin system.
 *
 * @returns The default coin system
 */
export function getDefaultCoinSystem() {
  return STANDARD_FANTASY;
}
