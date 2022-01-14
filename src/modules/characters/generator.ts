"use strict";

import * as RND from "../random";
import Character from "./character";
import * as Common from "./common";
import * as Names from "../names/names";
import CharacterGeneratorConfig from "./generatorconfig";

export default class CharacterGenerator {
  config: CharacterGeneratorConfig;

  constructor(config: CharacterGeneratorConfig) {
    this.config = config;
  }

  generate(): Character {
    const species = RND.weighted(this.config.speciesOptions);
    const ageGroupName = RND.item(this.config.ageCategories);
    const gender = RND.item(species.genders);

    let familyNameGenerator = this.config.familyNameGenerator;
    let femaleNameGenerator = this.config.femaleNameGenerator;
    let maleNameGenerator = this.config.maleNameGenerator;

    if (this.config.useAdaptiveNames) {
      familyNameGenerator = Names.getGeneratorByType(`${species.name} family`);
      femaleNameGenerator = Names.getGeneratorByType(`${species.name} female`);
      maleNameGenerator = Names.getGeneratorByType(`${species.name} male`);
    }

    let firstNames = [];
    const lastNames = familyNameGenerator.generate(30);

    if (gender.name === "female") {
      firstNames = femaleNameGenerator.generate(30);
    } else {
      firstNames = maleNameGenerator.generate(30);
    }

    return Common.generate(species, ageGroupName, gender, firstNames, lastNames);
  }
}
