import type { Species } from '$lib/species';
import { Sizes } from '$lib/size';
import base from './crab';

/** Ordinary reviewed producer; products use the explicit raw-source catalog. */
export default {
  ...base,
  name: 'European perch',
  pluralName: 'European perch',
  adjective: 'European perch',
  breedType: 'European perch',
  environments: ['forest', 'grassland', 'swamp'],
  physicalTraitGeneratorConfigs: [
    { name: 'scales', category: 'skin', options: ['silver', 'brown', 'olive'], tags: ['scales'] },
    { name: 'eyes', category: 'eyes', options: ['dark'], tags: ['eyes'] },
  ],
  baseThreatLevel: 0,
  commonality: 5,
  tags: ['fish', 'freshwater', 'reviewed-source-only'],
  carcassBodyPlan: 'scaled',
  sizeGeneratorConfigMatrix: Sizes.getHumanVariant(0.003, 0.15),
} satisfies Species;
