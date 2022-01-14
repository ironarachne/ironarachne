"use strict";

import * as RND from "../random";
import Character from "./character";
import * as Common from "./common";
import CharacterGeneratorConfig from "./generatorconfig";

export function generate(config: CharacterGeneratorConfig): Character {
  const species = RND.weighted(config.speciesOptions);
  const ageGroupName = RND.item(config.ageCategories);
  const gender = RND.item(species.genders);

  let firstNames = [];
  const lastNames = config.familyNameGenerator.generate(100);

  if (gender.name === "female") {
    firstNames = config.femaleNameGenerator.generate(100);
  } else {
    firstNames = config.maleNameGenerator.generate(100);
  }

  return Common.generate(species, ageGroupName, gender, firstNames, lastNames);
}
