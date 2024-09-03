import all from "$lib/species/all.js";
import * as CommonSpecies from "$lib/species/common.js";
import type CharacterGeneratorConfig from "./character_generator_config.js";
import * as Characters from "./characters.js";

export function getFantasy(): CharacterGeneratorConfig {
  const config: CharacterGeneratorConfig = Characters.getDefaultCharacterGeneratorConfig();

  config.speciesOptions = CommonSpecies.byTag("sentient", all);
  config.useAdaptiveNames = true;

  return config;
}
