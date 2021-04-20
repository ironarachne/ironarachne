import * as iarnd from "../random.js";
import * as FantasySpecies from "../species/fantasy.js";
import * as Species from "../species/common.js";
import * as Character from "./common.js";
import * as CommonNames from "../names/common.js"; // TODO: support nonhuman names and cultural names

export function generate() {
  let character = {};

  let speciesOptions = FantasySpecies.all();

  let species = iarnd.weighted(speciesOptions);

  species = Species.calculateAgeCategories(species);

  let ageGroupName = iarnd.item(species.ageGroups);

  let gender = iarnd.item(["female", "male"]);

  let firstNames = [];
  let lastNames = CommonNames.lastNames();

  if (gender == "female") {
    firstNames = CommonNames.femaleFirstNames();
  } else {
    firstNames = CommonNames.maleFirstNames();
  }

  character = Character.generate(species, ageGroupName, gender, firstNames, lastNames);

  return character;
}

export function generateByAgeGroup(ageGroupName) {
  let character = {};

  let speciesOptions = FantasySpecies.all();

  let species = iarnd.weighted(speciesOptions);

  species = Species.calculateAgeCategories(species);

  let gender = iarnd.item(["female", "male"]);

  let firstNames = [];
  let lastNames = CommonNames.lastNames();

  if (gender == "female") {
    firstNames = CommonNames.femaleFirstNames();
  } else {
    firstNames = CommonNames.maleFirstNames();
  }

  character = Character.generate(species, ageGroupName, gender, firstNames, lastNames);

  return character;
}

