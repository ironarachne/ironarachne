import { STANDARD_FANTASY } from '$lib/currency';
export {
  getAppropriateCoinTypes,
  getCoinTypesAboveValue,
  getCoinTypesBelowValue,
  getIndexOfCoinType,
  getMaxCoinTypeForValue,
} from '$lib/currency';

/**
 * Get the default coin system.
 *
 * @returns The default coin system
 */
export function getDefaultCoinSystem() {
  return STANDARD_FANTASY;
}
