"use strict";

import * as MUN from "@ironarachne/made-up-names";
import Gender from "../../gender.js";
import type Species from "../../species/species.js";

export default class FamilyGeneratorConfig {
  species: Species;
  iterations: number;
  rootFamilyNameGenerator: MUN.Generator;
  rootFemaleNameGenerator: MUN.Generator;
  rootMaleNameGenerator: MUN.Generator;
  dominantFamilyNameGender: Gender;

  constructor(
    species: Species,
    iterations: number,
    nameGenFamily: MUN.Generator,
    nameGenFemale: MUN.Generator,
    nameGenMale: MUN.Generator,
    dominantFamilyNameGender: Gender,
  ) {
    this.species = species;
    this.iterations = iterations;
    this.rootFamilyNameGenerator = nameGenFamily;
    this.rootFemaleNameGenerator = nameGenFemale;
    this.rootMaleNameGenerator = nameGenMale;
    this.dominantFamilyNameGender = dominantFamilyNameGender;
  }
}
