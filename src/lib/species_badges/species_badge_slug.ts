/**
 * Derives a stable filename key from a species display name.
 * "red dragon" -> "red_dragon", "yuan-ti pureblood" -> "yuan_ti_pureblood"
 */
export function speciesNameToBadgeSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}
