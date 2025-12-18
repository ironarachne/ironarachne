import Human from "$lib/species/sentient/human.js";
import type Species from "$lib/species/species.js";
import * as MUN from "@ironarachne/made-up-names";
import * as RNG from "@ironarachne/rng";
import * as Categories from "./categories";
import { getFantasyNameGeneratorSet } from "$lib/names/index.js";

export default class ReligionGeneratorConfig {
  categories: Categories.ReligionCategory[];
  deitySpeciesOptions: Species[];
  nameGenerator: MUN.NameGenerator;
  femaleNameGenerator: MUN.NameGenerator;
  maleNameGenerator: MUN.NameGenerator;

  constructor() {
    this.categories = Categories.all();
    this.deitySpeciesOptions = [Human];

    let genSet = getFantasyNameGeneratorSet("human", new RNG.RNG(Date.now()));

    this.nameGenerator = genSet.family;
    this.femaleNameGenerator = genSet.female;
    this.maleNameGenerator = genSet.male;
  }
}
