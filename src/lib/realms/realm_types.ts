import type RealmType from './realm_type.js';

import { REALM_TYPES } from './realm_type_data.js';

/**
 * Every realm type. The returned array is shared and must not be mutated. See `REALM_TYPES`.
 */
export function all(): RealmType[] {
  return REALM_TYPES;
}

/**
 * One realm type by name, or `undefined` when this build no longer has it.
 *
 * Added for the region payload, which stores a realm's type by name rather than embedding a copy
 * of the table row — the treatment the readiness pass gives species and archetypes, for the same
 * reason: an embedded copy goes stale the day the type grows a field, and every stored region
 * would carry the old shape forever.
 */
export function getByName(name: string): RealmType | undefined {
  return REALM_TYPES.find((type) => type.name === name);
}
