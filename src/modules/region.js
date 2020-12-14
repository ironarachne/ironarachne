import * as iarnd from "./random.js";
import * as Biome from "./biome.js";
import * as Nation from "./nation.js";
import * as Organization from "./organizations/organizations.js";
import * as Town from "./towns/towns.js";
import * as CommonNames from "./names/common.js";
import * as Words from "./words.js";
const random = require("random");

export function generate() {
  let biome = randomBiome();
  let towns = randomTowns();
  let organizations = randomOrganizations();
  let nation = randomNation();

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
  let nation = Nation.generate();

  let conflictChance = random.int(0, 100);

  if (conflictChance > 70) {
    let secondNation = Nation.generate();

    let nationDescription =
      Words.capitalize(nation.name) +
      " and " +
      secondNation.name +
      " both claim this region, ";

    let nextPart = iarnd.item([
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
  let orgs = [];
  let numberOfOrganizations = random.int(1, 3);

  for (let i = 0; i < numberOfOrganizations; i++) {
    orgs.push(Organization.generate());
  }

  return orgs;
}

function randomTowns() {
  let names = CommonNames.towns();
  let capital = Town.generate("large", names);
  let numberOfMediumTowns = random.int(1, 3);
  let numberOfSmallTowns = random.int(3, 5);
  let towns = [];

  capital.description += " This is the capital of the region.";
  towns.push(capital);

  for (let i = 0; i < numberOfMediumTowns; i++) {
    towns.push(Town.generate("medium", names));
  }

  for (let i = 0; i < numberOfSmallTowns; i++) {
    towns.push(Town.generate("small", names));
  }

  return towns;
}
