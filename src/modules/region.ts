"use strict";

import * as RND from "./random";
import * as Biome from "./biome";
import * as Nation from "./nation";
import * as Organization from "./organizations/fantasy";
import * as Town from "./towns/towns";
import * as TownNames from "./names/towns";
import * as Words from "./words";

const random = require("random");

export function generate() {
  const biome = randomBiome();
  const towns = randomTowns();
  const organizations = randomOrganizations();
  const nation = randomNation();

  let description = biome.description;

  description += " " + nation;

  return {
    description: description,
    towns: towns,
    organizations: organizations,
  };
}

function randomBiome() {
  return Biome.generate();
}

function randomNation() {
  const nation = Nation.generate();

  const conflictChance = random.int(0, 100);

  if (conflictChance > 70) {
    const secondNation = Nation.generate();

    let nationDescription =
      Words.capitalize(nation.name) +
      " and " +
      secondNation.name +
      " both claim this region, ";

    const nextPart = RND.item([
      "and it's the subject of an active war.",
      "though both have bigger problems right now than to argue over it.",
      "and a war may be coming soon over it.",
    ]);

    nationDescription += nextPart;

    return nationDescription;
  } else {
    return (
      Words.capitalize(nation.name) + " claims this as part of its domain."
    );
  }
}

function randomOrganizations() {
  const orgs = [];
  const numberOfOrganizations = random.int(1, 3);

  for (let i = 0; i < numberOfOrganizations; i++) {
    orgs.push(Organization.generate());
  }

  return orgs;
}

function randomTowns() {
  let names = TownNames.randomSet(100);
  const capital = Town.generate("large", names);

  names = Words.removeEntry(capital.name, names);

  const numberOfMediumTowns = random.int(1, 3);
  const numberOfSmallTowns = random.int(3, 5);
  const towns = [];

  capital.description += " This is the capital of the region.";
  towns.push(capital);

  for (let i = 0; i < numberOfMediumTowns; i++) {
    const town = Town.generate("medium", names);
    towns.push(town);
    names = Words.removeEntry(town.name, names);
  }

  for (let i = 0; i < numberOfSmallTowns; i++) {
    const town = Town.generate("small", names);
    towns.push(town);
    names = Words.removeEntry(town.name, names);
  }

  return towns;
}
