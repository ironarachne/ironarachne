import type Species from "$lib/species/species";

export default interface CreatureGeneratorConfig {
  ageCategoryNames: string[];
  genderNames: string[];
  speciesOptions: Species[];
}
