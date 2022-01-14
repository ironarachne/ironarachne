"use strict";

import CharacterGeneratorConfig from "./generatorconfig";
import GenericFantasyFamilyGenerator from "../names/generators/genericfantasyfamily";
import GenericFantasyFemaleGenerator from "../names/generators/genericfantasyfemale";
import GenericFantasyMaleGenerator from "../names/generators/genericfantasymale";
import * as FantasySpecies from "../species/fantasy";
import * as AgeCategories from "../age/agecategories";

export function getFantasy(): CharacterGeneratorConfig {
  const speciesOptions = FantasySpecies.all();
  const ageCats = AgeCategories.getCategoryList();
  const config = new CharacterGeneratorConfig(speciesOptions, ageCats, new GenericFantasyMaleGenerator(), new GenericFantasyFemaleGenerator(), new GenericFantasyFamilyGenerator());
  config.useAdaptiveNames = true;

  return config;
}
