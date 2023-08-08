"use strict";

import * as FantasySpecies from "$lib/species/fantasy.js";
import CharacterGeneratorConfig from "./generatorconfig.js";

export function getFantasy(): CharacterGeneratorConfig {
  const speciesOptions = FantasySpecies.pc();
  let config = new CharacterGeneratorConfig();
  config.speciesOptions = speciesOptions;
  config.useAdaptiveNames = true;

  return config;
}
