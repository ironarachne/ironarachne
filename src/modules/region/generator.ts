"use strict";

import * as RND from "../random";
import * as Biomes from "../environment/biomes";
import Nation from "../nations/nation";
import * as NationGenerator from "../nations/fantasy";
import * as Organizations from "../organizations/fantasy";
import Organization from "../organizations/organization";
import * as Towns from "../towns/towns";
import Region from "./region";
import * as TownNames from "../names/towns";
import * as Words from "../words";

import random from "random";

export function generate(): Region {
  const biome = Biomes.random();
  const towns = randomTowns();
  const organizations = randomOrganizations();

  const claimants = randomClaimants();

  let description = RND.item(biome.descriptions) + " " + RND.item(biome.features) + " " + RND.item(biome.weatherEvents);

  description += " " + describeClaimants(claimants);

  let sovereignTerritory = RND.item(claimants[0].subdivisions);

  let name = sovereignTerritory.longName;

  return new Region(name, description, towns, claimants, sovereignTerritory, organizations);
}

function randomClaimants(): Nation[] {
  let nations = [];

  const nation = NationGenerator.generate();

  nations.push(nation);

  const conflictChance = random.int(0, 100);

  if (conflictChance > 70) {
    const secondNation = NationGenerator.generate();

    nations.push(secondNation);
  }

  return nations;
}

function describeClaimants(claimants: Nation[]): string {
  let description = Words.capitalize(claimants[0].name) + " claims this as part of its domain."

  if (claimants.length > 1) {
    description = Words.capitalize(claimants[0].name) +
    " and " +
    claimants[1].name +
    " both claim this region, ";

    const nextPart = RND.item([
      "and it's the subject of an active war.",
      "though both have bigger problems right now than to argue over it.",
      "and a war may be coming soon over it.",
    ]);

    description += nextPart;
  }

  return description;
}

function randomOrganizations() {
  const orgs: Organization[] = [];
  const numberOfOrganizations = random.int(1, 3);

  for (let i = 0; i < numberOfOrganizations; i++) {
    orgs.push(Organizations.generate());
  }

  return orgs;
}

function randomTowns() {
  let names = TownNames.randomSet(100);
  const capital = Towns.generate("large", names);

  names = Words.removeEntry(capital.name, names);

  const numberOfMediumTowns = random.int(1, 3);
  const numberOfSmallTowns = random.int(3, 5);
  const towns = [];

  capital.description += " This is the capital of the region.";
  towns.push(capital);

  for (let i = 0; i < numberOfMediumTowns; i++) {
    const town = Towns.generate("medium", names);
    towns.push(town);
    names = Words.removeEntry(town.name, names);
  }

  for (let i = 0; i < numberOfSmallTowns; i++) {
    const town = Towns.generate("small", names);
    towns.push(town);
    names = Words.removeEntry(town.name, names);
  }

  return towns;
}
