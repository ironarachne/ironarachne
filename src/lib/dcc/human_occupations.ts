import type { DCCOccupation } from './dcc_types';
import { HUMAN_OCCUPATIONS } from './human_occupation_data';

/**
 * The human occupation table. The returned array is shared and must not be mutated; callers copy
 * the row they select. See `HUMAN_OCCUPATIONS`.
 */
export function all(): DCCOccupation[] {
  return HUMAN_OCCUPATIONS;
}
