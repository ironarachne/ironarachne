import type Gender from "$lib/gender/gender.js";
import type Species from "$lib/species/species.js";
import type * as MUN from "@ironarachne/made-up-names";

export default interface FamilyGeneratorConfig {
  species: Species;
  iterations: number;
  rootFamilyNameGenerator: MUN.Generator;
  rootFemaleNameGenerator: MUN.Generator;
  rootMaleNameGenerator: MUN.Generator;
  dominantFamilyNameGender: Gender;
}
