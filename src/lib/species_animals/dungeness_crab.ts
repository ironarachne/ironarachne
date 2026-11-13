import type { Species } from '$lib/species';
import { Sizes } from '$lib/size';
import base from './crab';

/** Ordinary reviewed producer; products use the explicit raw-source catalog. */
export default {
  ...base,
  name: 'Dungeness crab',
  pluralName: 'Dungeness crabs',
  adjective: 'Dungeness crab',
  breedType: 'Dungeness crab',
  environments: ['coastal'],
  baseThreatLevel: 0,
  commonality: 5,
  tags: ['crustacean', 'marine', 'reviewed-source-only'],
  carcassBodyPlan: 'chitinous',
  sizeGeneratorConfigMatrix: Sizes.bodySizeMatrix(base.ageCategories, base.genders, {
    height: [0, 0],
    length: [13, 22],
    mass: [0.35, 1.4],
  }),
} satisfies Species;
