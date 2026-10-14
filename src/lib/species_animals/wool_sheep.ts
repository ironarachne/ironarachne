import type { Species } from '$lib/species';
import { Sizes } from '$lib/size';
import base from './goat';

/** Ordinary reviewed producer; products use the explicit raw-source catalog. */
export default {
  ...base,
  name: 'wool sheep',
  pluralName: 'wool sheep',
  adjective: 'wool sheep',
  breedType: 'wool sheep',
  environments: ['grassland'],
  baseThreatLevel: 0,
  commonality: 5,
  tags: ['wool-bearing', 'sheep', 'reviewed-source-only'],
  carcassBodyPlan: 'furred',
  sizeGeneratorConfigMatrix: Sizes.getHumanVariant(0.5, 0.7),
} satisfies Species;
