"use strict";

import NameGenerator from "../names/generator";
import Species from "../species/species";

export default class CharacterGeneratorConfig {
  ageCategories: string[];
  familyNameGenerator: NameGenerator;
  femaleNameGenerator: NameGenerator;
  maleNameGenerator: NameGenerator;
  speciesOptions: Species[];
  useAdaptiveNames: boolean;

  constructor(speciesOptions: Species[], ageCategories: string[], maleGen: NameGenerator, femaleGen: NameGenerator, familyGen: NameGenerator) {
    this.ageCategories = ageCategories;
    this.familyNameGenerator = familyGen;
    this.femaleNameGenerator = femaleGen;
    this.maleNameGenerator = maleGen;
    this.speciesOptions = speciesOptions;
    this.useAdaptiveNames = false;
  }
}
