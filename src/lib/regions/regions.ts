import type Character from "$lib/characters/character.js";
import type Culture from "$lib/culture/culture.js";
import type Environment from "$lib/environment/environment.js";
import * as Environments from "$lib/environment/environments.js";
import * as FantasyOrgs from "$lib/organizations/fantasy";
import type Organization from "$lib/organizations/organization.js";
import * as Organizations from "$lib/organizations/organizations.js";
import type Realm from "$lib/realms/realm.js";
import * as Realms from "$lib/realms/realms.js";
import type Settlement from "$lib/settlements/settlement.js";
import * as Settlements from "$lib/settlements/settlements.js";
import * as MUN from "@ironarachne/made-up-names";
import * as RND from "@ironarachne/rng";
import random from "random";
import type Region from "./region.js";
import type RegionGeneratorConfig from "./region_generator_config.js";

export function generate(config: RegionGeneratorConfig): Region {
  let region: Region = {
    name: "",
    environment: {} as Environment,
    description: "",
    dominantCulture: {} as Culture,
    settlements: [] as Settlement[],
    mainRealm: 0,
    realms: [] as Realm[],
    authority: {} as Character,
    organizations: [] as Organization[],
    settlementTiles: [] as number[][],
    terrainTiles: [] as number[][],
  };

  let nameGenSet;

  if (config.dominantCulture != null) {
    region.dominantCulture = config.dominantCulture;
    nameGenSet = region.dominantCulture.generatorSet;
  } else {
    nameGenSet = config.nameGeneratorSet;
  }

  region.environment = Environments.generate();
  region.settlements = randomSettlements(region.environment, nameGenSet);
  region.organizations = randomOrganizations();
  region.description = region.environment.description;

  let realmGenConfig = Realms.getDefaultConfig();
  realmGenConfig.nameGeneratorSet = nameGenSet;

  let mainRealm = Realms.generate(realmGenConfig);
  region.realms.push(mainRealm);
  region.mainRealm = 0;

  if (!mainRealm.realmType.isStandalone) {
    let parentRealmConfig = Realms.getDefaultConfig();
    parentRealmConfig.nameGeneratorSet = realmGenConfig.nameGeneratorSet;
    if (mainRealm.realmType.parentType == null) {
      throw new Error("Realm type has no parent type.");
    }
    parentRealmConfig.realmTypes = [mainRealm.realmType.parentType];

    let parentRealm = Realms.generate(parentRealmConfig);

    region.realms.push(parentRealm);
    mainRealm.parent = 1;
  }

  let numberOfNeighbors = random.int(config.minRealms, config.maxRealms);
  for (let i = 0; i < numberOfNeighbors; i++) {
    realmGenConfig.nameGeneratorSet = MUN.getSetByName("fantasy", MUN.allSets());
    if (RND.simple(100) > 70) {
      let neighborNameGenSet = RND.item(MUN.cultureSets());
      realmGenConfig.nameGeneratorSet = neighborNameGenSet;
    }
    let neighbor = Realms.generate(realmGenConfig);
    if (!neighbor.realmType.isStandalone) {
      if (RND.simple(100) > 50) {
        neighbor.parent = mainRealm.parent;
      } else {
        let parentRealmConfig = Realms.getDefaultConfig();
        if (neighbor.realmType.parentType == null) {
          throw new Error("Realm type has no parent type.");
        }
        parentRealmConfig.realmTypes = [neighbor.realmType.parentType];
        parentRealmConfig.nameGeneratorSet = realmGenConfig.nameGeneratorSet;

        let parentRealm = Realms.generate(parentRealmConfig);
        region.realms.push(parentRealm);
        neighbor.parent = region.realms.length - 1;
      }
    }
    region.realms.push(neighbor);
  }

  region.authority = mainRealm.authority;
  region.name = mainRealm.name;

  return region;
}

export function getDefaultConfig(): RegionGeneratorConfig {
  return {
    nameGeneratorSet: MUN.getSetByName("fantasy", MUN.cultureSets()),
    dominantCulture: null,
    mapWidth: 40,
    mapHeight: 30,
    minRealms: 2,
    maxRealms: 4,
  };
}

function randomOrganizations(): Organization[] {
  const config = FantasyOrgs.getDefaultConfig();
  const orgs: Organization[] = [];
  const numberOfOrganizations = random.int(1, 3);

  for (let i = 0; i < numberOfOrganizations; i++) {
    orgs.push(Organizations.generate(config));
  }

  return orgs;
}

function randomSettlements(environment: Environment, nameGeneratorSet: MUN.GeneratorSet): Settlement[] {
  let settlementGenConfig = Settlements.getDefaultConfig();
  settlementGenConfig.nameGenerator = nameGeneratorSet.town;
  settlementGenConfig.size = "large";
  settlementGenConfig.environment = environment;
  const capital = Settlements.generate(settlementGenConfig);

  const numberOfMediumTowns = random.int(1, 3);
  const numberOfSmallTowns = random.int(3, 5);
  const towns = [];

  capital.description += " This is the capital of the region.";
  towns.push(capital);

  for (let i = 0; i < numberOfMediumTowns; i++) {
    settlementGenConfig.size = "medium";
    const town = Settlements.generate(settlementGenConfig);
    towns.push(town);
  }

  for (let i = 0; i < numberOfSmallTowns; i++) {
    settlementGenConfig.size = "small";
    const town = Settlements.generate(settlementGenConfig);
    towns.push(town);
  }

  return towns;
}
