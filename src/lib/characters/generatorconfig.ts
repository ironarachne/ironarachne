"use strict";

import * as AgeCategories from "$lib/age/agecategories.js";
import type PhysicalTrait from "$lib/physicaltraits/physicaltrait.js";
import * as MUN from "@ironarachne/made-up-names";
import type Species from "../species/species.js";

export default class CharacterGeneratorConfig {
  ageCategories: string[];
  familyNameGenerator: MUN.Generator;
  femaleNameGenerator: MUN.Generator;
  maleNameGenerator: MUN.Generator;
  speciesOptions: Species[];
  physicalTraitOverrides: PhysicalTrait[];
  useAdaptiveNames: boolean;
  genderNameOptions: string[];

  constructor() {
    this.ageCategories = AgeCategories.getCategoryList();
    let genSet = new MUN.HumanSet();
    if (genSet.family === null) {
      throw new Error("Family name generator not found");
    }
    if (genSet.female === null) {
      throw new Error("Female name generator not found");
    }
    if (genSet.male === null) {
      throw new Error("Male name generator not found");
    }
    this.familyNameGenerator = genSet.family;
    this.femaleNameGenerator = genSet.female;
    this.maleNameGenerator = genSet.male;
    this.speciesOptions = [];

    this.genderNameOptions = ["male", "female"];
    this.useAdaptiveNames = false;
    this.physicalTraitOverrides = [];
  }
}
