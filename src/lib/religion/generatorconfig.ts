"use strict";

import * as MUN from "@ironarachne/made-up-names";
import * as Categories from "./categories/categories.js";
import ReligionCategory from "./categories/category.js";

export default class ReligionGeneratorConfig {
  categories: ReligionCategory[];
  nameGenerator: MUN.Generator;
  femaleNameGenerator: MUN.Generator;
  maleNameGenerator: MUN.Generator;

  constructor() {
    this.categories = Categories.all();

    let genSet = new MUN.HumanSet();

    if (genSet.family === null) {
      throw new Error("No family name generator found.");
    } else if (genSet.female === null) {
      throw new Error("No female name generator found");
    } else if (genSet.male === null) {
      throw new Error("No male name generator found");
    }

    this.nameGenerator = genSet.family;
    this.femaleNameGenerator = genSet.female;
    this.maleNameGenerator = genSet.male;
  }
}
