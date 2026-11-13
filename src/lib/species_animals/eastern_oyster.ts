import type { Species } from '$lib/species';
import { Sizes } from '$lib/size';
import base from './crab';

/** Ordinary reviewed producer; products use the explicit raw-source catalog. */
export default {
  ...base,
  name: 'eastern oyster',
  pluralName: 'eastern oysters',
  adjective: 'eastern oyster',
  breedType: 'eastern oyster',
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
    length: [7.5, 13],
    mass: [0.05, 0.25],
  }),
} satisfies Species;
