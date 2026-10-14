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
  sizeGeneratorConfigMatrix: Sizes.getHumanVariant(0.0005, 0.05),
} satisfies Species;
