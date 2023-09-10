import type PhysicalTrait from "$lib/physical_traits/physical_trait";
import type Species from "$lib/species/species";
import type * as MUN from "@ironarachne/made-up-names";

export default interface CharacterGeneratorConfig {
  ageCategoryNames: string[];
  familyNameGenerator: MUN.Generator;
  femaleNameGenerator: MUN.Generator;
  maleNameGenerator: MUN.Generator;
  speciesOptions: Species[];
  physicalTraitOverrides: PhysicalTrait[];
  useAdaptiveNames: boolean;
  genderNameOptions: string[];
}
