import type { RNG } from '@ironarachne/rng';
import type Species from '$lib/species/species';

export default interface CreatureGeneratorConfig {
  ageCategoryNames: string[];
  genderNames: string[];
  speciesOptions: Species[];
  rng: RNG;
}
