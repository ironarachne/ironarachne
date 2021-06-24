"use strict";

import * as RND from "../random";
import * as FantasySpecies from "../species/fantasy";
import * as Species from "../species/common";
import * as Character from "./common";
import * as CommonNames from "../names/common"; // TODO: support nonhuman names and cultural names

export function generate() {
  let speciesOptions = FantasySpecies.all();
  let species = RND.weighted(speciesOptions);

  species = Species.calculateAgeCategories(species);

  let ageGroupName = RND.item(species.ageGroups).name;

  let gender = RND.item(["female", "male"]);

  let firstNames = [];
  let lastNames = CommonNames.lastNames();

  if (gender === "female") {
    firstNames = CommonNames.femaleFirstNames();
  } else {
    firstNames = CommonNames.maleFirstNames();
  }

  return Character.generate(species, ageGroupName, gender, firstNames, lastNames);
}

export function generateByAgeGroup(ageGroupName: string) {
  let speciesOptions = FantasySpecies.all();
  let species = RND.weighted(speciesOptions);

  species = Species.calculateAgeCategories(species);

  let gender = RND.item(["female", "male"]);

  let firstNames = [];
  let lastNames = CommonNames.lastNames();

  if (gender === "female") {
    firstNames = CommonNames.femaleFirstNames();
  } else {
    firstNames = CommonNames.maleFirstNames();
  }

  return Character.generate(species, ageGroupName, gender, firstNames, lastNames);
}

