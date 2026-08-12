import type { DCCOccupation } from './dcc_types';
import { HALFLING_OCCUPATIONS } from './halfling_occupation_data';

/**
 * The halfling occupation table. The returned array is shared and must not be mutated; callers
 * copy the row they select. See `HALFLING_OCCUPATIONS`.
 */
export function all(): DCCOccupation[] {
  return HALFLING_OCCUPATIONS;
}
