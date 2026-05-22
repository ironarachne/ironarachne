/**
 * Derives a stable filename key from a badge display name.
 * "red dragon" -> "red_dragon", "yuan-ti pureblood" -> "yuan_ti_pureblood"
 */
export function archetypeNameToBadgeSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}
