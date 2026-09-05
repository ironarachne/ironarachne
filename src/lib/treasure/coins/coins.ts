import { STANDARD_FANTASY } from '$lib/rulesets/ironarachne';
export {
  getAppropriateCoinTypes,
  getCoinTypesAboveValue,
  getCoinTypesBelowValue,
  getIndexOfCoinType,
  getMaxCoinTypeForValue,
} from '$lib/rulesets/ironarachne';

/**
 * Get the default coin system.
 *
 * @returns The default coin system
 */
export function getDefaultCoinSystem() {
  return STANDARD_FANTASY;
}
