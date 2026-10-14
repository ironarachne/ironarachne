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
  sizeGeneratorConfigMatrix: Sizes.getHumanVariant(1e-5, 0.01),
} satisfies Species;
