import type Ability from "$lib/abilities/ability";
import type AgeCategory from "$lib/age/age_category.js";
import type Gender from "$lib/gender/gender.js";
import type PhysicalTraitGeneratorConfig from "$lib/physical_traits/physical_trait_generator_config.js";
import type { SizeMatrix } from "$lib/size/size_matrix";

export default interface Species {
  name: string;
  pluralName: string;
  adjective: string;
  breedType: string;
  environments: string[];
  creatureTypes: string[];
  physicalTraitGeneratorConfigs: PhysicalTraitGeneratorConfig[];
  ageCategories: AgeCategory[];
  sizeGeneratorConfigMatrix: SizeMatrix;
  abilities: Ability[];
  baseThreatLevel: number;
  genders: Gender[];
  commonality: number;
  tags: string[];
}
