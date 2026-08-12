import * as RNG from '@ironarachne/rng';

export type PlanetFeatureSet = {
  name: string;
  options: string[];
};

/**
 * Picks `featureCount` of the feature sets and joins one option from each into a description.
 *
 * Lives here rather than in `planet_classifications.ts` because the classification table calls it
 * and the table now lives in its own module: keeping it in either of those two would make them
 * import each other, and the sorted table is built at module load, where a cycle resolves to a
 * `ReferenceError` depending on which module is imported first.
 *
 * Note that `rng.shuffle` reorders its argument in place. Every caller builds the array it passes
 * fresh, so nothing shared is reordered — a caller handing over an array it intends to keep must
 * copy it first.
 */
export function getDescriptionFromFeatures(
  possibleFeatures: PlanetFeatureSet[],
  featureCount: number,
  rng: RNG.RNG,
): string {
  const features = rng.shuffle(possibleFeatures);
  const selectedFeatures = features.slice(0, featureCount);

  let description = '';

  for (let i = 0; i < selectedFeatures.length; i++) {
    const feature = selectedFeatures[i];
    const option = rng.item(feature.options);

    description += `${option} `;
  }

  return description;
}
