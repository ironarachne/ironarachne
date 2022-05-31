'use strict';

import CharacterGeneratorConfig from './generatorconfig';
import * as FantasySpecies from '../species/fantasy';

export function getFantasy(): CharacterGeneratorConfig {
  const speciesOptions = FantasySpecies.pc();
  let config = new CharacterGeneratorConfig();
  config.speciesOptions = speciesOptions;
  config.useAdaptiveNames = true;

  return config;
}
