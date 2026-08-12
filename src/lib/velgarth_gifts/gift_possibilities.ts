import type GiftPossibility from './gift_possibility';

import { GIFT_POSSIBILITIES } from './gift_possibility_data';

/**
 * Every gift a character may be born with. The returned array is shared and must not be mutated.
 */
export function all(): GiftPossibility[] {
  return GIFT_POSSIBILITIES;
}
