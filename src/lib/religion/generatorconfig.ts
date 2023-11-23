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

    let genSet = MUN.getSetByName("human", MUN.fantasyRaceSets());

    this.nameGenerator = genSet.family;
    this.femaleNameGenerator = genSet.female;
    this.maleNameGenerator = genSet.male;
  }
}
