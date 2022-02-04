'use strict';

import CharacterGeneratorConfig from './generatorconfig';
import * as FantasySpecies from '../species/fantasy';

export function getFantasy(): CharacterGeneratorConfig {
  const speciesOptions = FantasySpecies.all();
  let config = new CharacterGeneratorConfig();
  config.speciesOptions = speciesOptions;
  config.useAdaptiveNames = true;

  return config;
}
