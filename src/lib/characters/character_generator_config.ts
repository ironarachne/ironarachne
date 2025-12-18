import type PhysicalTrait from "$lib/physical_traits/physical_trait";
import type Species from "$lib/species/species";
import type * as MUN from "@ironarachne/made-up-names";
import type { RNG } from "@ironarachne/rng";

export default interface CharacterGeneratorConfig {
  ageCategoryNames: string[];
  familyNameGenerator: MUN.NameGenerator;
  femaleNameGenerator: MUN.NameGenerator;
  maleNameGenerator: MUN.NameGenerator;
  speciesOptions: Species[];
  physicalTraitOverrides: PhysicalTrait[];
  useAdaptiveNames: boolean;
  genderNameOptions: string[];
  rng: RNG;
}
