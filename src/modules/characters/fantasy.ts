"use strict";

import * as RND from "../random";
import * as FantasySpecies from "../species/fantasy";
import * as Character from "./common";
import * as CommonNames from "../names/common"; // TODO: support nonhuman names and cultural names

export function generate() {
  const speciesOptions = FantasySpecies.all();
  let species = RND.weighted(speciesOptions);

  const ageGroupName = RND.item(species.genders[0].ageGroups).name;

  const gender = RND.item(species.genders);

  let firstNames = [];
  const lastNames = CommonNames.lastNames();

  if (gender.name === "female") {
    firstNames = CommonNames.femaleFirstNames();
  } else {
    firstNames = CommonNames.maleFirstNames();
  }

  return Character.generate(species, ageGroupName, gender, firstNames, lastNames);
}

export function generateByAgeGroup(ageGroupName: string) {
  const speciesOptions = FantasySpecies.all();
  let species = RND.weighted(speciesOptions);

  const gender = RND.item(species.genders);

  let firstNames = [];
  const lastNames = CommonNames.lastNames();

  if (gender.name === "female") {
    firstNames = CommonNames.femaleFirstNames();
  } else {
    firstNames = CommonNames.maleFirstNames();
  }

  return Character.generate(species, ageGroupName, gender, firstNames, lastNames);
}

