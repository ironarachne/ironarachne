import type { Species } from '$lib/species';
import { Sizes } from '$lib/size';
import base from './crayfish';

/** Ordinary reviewed producer; products use the explicit raw-source catalog. */
export default {
  ...base,
  name: 'noble crayfish',
  pluralName: 'noble crayfish',
  adjective: 'noble crayfish',
  breedType: 'noble crayfish',
  environments: ['forest', 'grassland', 'swamp'],
  baseThreatLevel: 0,
  commonality: 5,
  tags: ['crustacean', 'freshwater', 'reviewed-source-only'],
  carcassBodyPlan: 'chitinous',
  sizeGeneratorConfigMatrix: Sizes.bodySizeMatrix(base.ageCategories, base.genders, {
    height: [0, 0],
    length: [9, 17],
    mass: [0.025, 0.2],
  }),
} satisfies Species;
