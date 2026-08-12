import type RealmType from './realm_type.js';

import { REALM_TYPES } from './realm_type_data.js';

/**
 * Every realm type. The returned array is shared and must not be mutated. See `REALM_TYPES`.
 */
export function all(): RealmType[] {
  return REALM_TYPES;
}
