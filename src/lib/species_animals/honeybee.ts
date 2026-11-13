import type { Species } from '$lib/species';
import { Sizes } from '$lib/size';
import base from './giant_bee';

/** Ordinary reviewed producer; products use the explicit raw-source catalog. */
export default {
  ...base,
  name: 'honeybee',
  pluralName: 'honeybees',
  adjective: 'honeybee',
  breedType: 'honeybee',
  environments: ['forest', 'grassland'],
  baseThreatLevel: 0,
  commonality: 5,
  tags: ['insect', 'pollinator', 'flying', 'reviewed-source-only'],
  carcassBodyPlan: 'chitinous',
  sizeGeneratorConfigMatrix: Sizes.bodySizeMatrix(base.ageCategories, base.genders, {
    height: [0, 0],
    length: [1, 2],
    mass: [0.00008, 0.00025],
  }),
} satisfies Species;
