import type CharacterGeneratorConfig from "$lib/characters/character_generator_config";
import type OrganizationType from "./organization_type";

export default interface OrganizationGeneratorConfig {
  organizationTypes: OrganizationType[];
  characterConfig: CharacterGeneratorConfig;
}
