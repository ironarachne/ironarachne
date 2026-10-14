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
  sizeGeneratorConfigMatrix: Sizes.getHumanVariant(0.0001, 0.03),
} satisfies Species;
