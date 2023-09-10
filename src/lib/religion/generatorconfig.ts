import Human from "$lib/species/sentient/human.js";
import type Species from "$lib/species/species.js";
import * as MUN from "@ironarachne/made-up-names";
import * as Categories from "./categories/categories.js";
import type ReligionCategory from "./categories/category.js";

export default class ReligionGeneratorConfig {
  categories: ReligionCategory[];
  deitySpeciesOptions: Species[];
  nameGenerator: MUN.Generator;
  femaleNameGenerator: MUN.Generator;
  maleNameGenerator: MUN.Generator;

  constructor() {
    this.categories = Categories.all();
    this.deitySpeciesOptions = [Human];

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
