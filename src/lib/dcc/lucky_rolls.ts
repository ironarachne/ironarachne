import type { DCCLuckyRoll } from './dcc_types';
import { LUCKY_ROLLS } from './lucky_roll_data';

/**
 * The lucky sign table, indexed by a 1d30 roll. The returned array is shared and must not be
 * mutated; callers copy the row they draw. See `LUCKY_ROLLS`.
 */
export function all(): DCCLuckyRoll[] {
  return LUCKY_ROLLS;
}
