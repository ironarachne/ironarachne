import type { PlanetClassification } from './planets';

import { PLANET_CLASSIFICATIONS } from './planet_classification_data';

// Re-exported so this module stays the library's entry point for classifications, even though the
// table and the feature-description helper now live in siblings.
export { getDescriptionFromFeatures, type PlanetFeatureSet } from './planet_feature_description';

export function getPlanetClassificationByName(name: string): PlanetClassification {
  const classifications = getPlanetClassifications();

  for (let i = 0; i < classifications.length; i++) {
    if (classifications[i].name === name) {
      return classifications[i];
    }
  }

  throw new Error(`Failed to find planet classification with name ${name}`);
}

/**
 * Sorted once at module load. `sortPlanetClassificationsByName` sorts in place, so it is given a
 * copy: `PLANET_CLASSIFICATIONS` keeps the order it was written in, and callers of this function
 * all share one sorted array.
 */
const SORTED_PLANET_CLASSIFICATIONS = sortPlanetClassificationsByName([...PLANET_CLASSIFICATIONS]);

/**
 * Every planet classification, by name. The returned array is shared and must not be mutated.
 */
export function getPlanetClassifications(): PlanetClassification[] {
  return SORTED_PLANET_CLASSIFICATIONS;
}

export function sortPlanetClassificationsByName(
  classifications: PlanetClassification[],
): PlanetClassification[] {
  return classifications.sort((a, b) => a.name.localeCompare(b.name));
}

export function searchPlanetClassificationByName(
  name: string,
  classifications: PlanetClassification[],
): PlanetClassification {
  let low = 0;
  let high = classifications.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const midName = classifications[mid].name;

    if (midName === name) {
      return classifications[mid];
    }

    if (midName < name) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  throw new Error(`Planet classification with name "${name}" not found.`);
}
