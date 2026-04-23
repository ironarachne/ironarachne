/**
 * Central overrides for carcass product names keyed by `Species.breedType`.
 * Use when the common trade or culinary name is not the default
 * `"{adjective} meat"` / `"{adjective} hide"` pattern.
 *
 * Merging: values from `Species.resourceProductNames` (when present) override these entries.
 */
export type SpeciesProductOverride = {
  meat?: string;
  hide?: string;
  feathers?: string;
  scale?: string;
  chitin?: string;
  horn?: string;
};

export const SPECIES_PRODUCT_OVERRIDES: Record<string, SpeciesProductOverride> = {
  cow: { meat: 'beef' },
  goat: { meat: 'chevon' },
  elk: { meat: 'venison' },
  boar: { meat: 'pork' },
};
