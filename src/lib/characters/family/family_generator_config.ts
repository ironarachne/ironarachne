import type Gender from '$lib/gender/gender.js';
import type Species from '$lib/species/species.js';
import type * as MUN from '@ironarachne/made-up-names';
import type { RNG } from '@ironarachne/rng';

export default interface FamilyGeneratorConfig {
  species: Species;
  iterations: number;
  rootFamilyNameGenerator: MUN.NameGenerator;
  rootFemaleNameGenerator: MUN.NameGenerator;
  rootMaleNameGenerator: MUN.NameGenerator;
  dominantFamilyNameGender: Gender;
  rng: RNG;
}
