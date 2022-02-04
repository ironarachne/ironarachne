"use strict";

import Gender from "../../gender";
import NameGenerator from "../../names/generator";
import type Species from "../../species/species";

export default class FamilyGeneratorConfig {
  species: Species;
  iterations: number;
  rootFamilyNameGenerator: NameGenerator;
  rootFemaleNameGenerator: NameGenerator;
  rootMaleNameGenerator: NameGenerator;
  dominantFamilyNameGender: Gender;

  constructor(species: Species, iterations: number, nameGenFamily: NameGenerator, nameGenFemale: NameGenerator, nameGenMale: NameGenerator, dominantFamilyNameGender: Gender) {
    this.species = species;
    this.iterations = iterations;
    this.rootFamilyNameGenerator = nameGenFamily;
    this.rootFemaleNameGenerator = nameGenFemale;
    this.rootMaleNameGenerator = nameGenMale;
    this.dominantFamilyNameGender = dominantFamilyNameGender;
  }
}
