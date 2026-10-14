import type { Species } from '$lib/species';
import { Sizes } from '$lib/size';
import base from './crab';

/** Ordinary reviewed producer; products use the explicit raw-source catalog. */
export default {
  ...base,
  name: 'European flounder',
  pluralName: 'European flounders',
  adjective: 'European flounder',
  breedType: 'European flounder',
  environments: ['coastal'],
  physicalTraitGeneratorConfigs: [
    { name: 'scales', category: 'skin', options: ['silver', 'brown', 'olive'], tags: ['scales'] },
    { name: 'eyes', category: 'eyes', options: ['dark'], tags: ['eyes'] },
  ],
  baseThreatLevel: 0,
  commonality: 5,
  tags: ['fish', 'marine', 'reviewed-source-only'],
  carcassBodyPlan: 'scaled',
  sizeGeneratorConfigMatrix: Sizes.getHumanVariant(0.004, 0.2),
} satisfies Species;
