import type { Species } from '$lib/species';
import { Sizes } from '$lib/size';
import base from './crab';

/** Ordinary reviewed producer; products use the explicit raw-source catalog. */
export default {
  ...base,
  name: 'blue mussel',
  pluralName: 'blue mussels',
  adjective: 'blue mussel',
  breedType: 'blue mussel',
  environments: ['coastal'],
  physicalTraitGeneratorConfigs: [
    { name: 'shell', category: 'shell', options: ['brown', 'grey', 'dark'], tags: ['shell'] },
  ],
  baseThreatLevel: 0,
  commonality: 5,
  tags: ['bivalve', 'marine', 'reviewed-source-only'],
  carcassBodyPlan: 'chitinous',
  sizeGeneratorConfigMatrix: Sizes.bodySizeMatrix(base.ageCategories, base.genders, {
    height: [0, 0],
    length: [5, 10],
    mass: [0.01, 0.08],
  }),
} satisfies Species;
