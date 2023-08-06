"use strict";

import * as MUN from "@ironarachne/made-up-names";
import * as RND from "@ironarachne/rng";
import random from "random";
import Environment from "../environment/environment.js";
import EnvironmentGenerator from "../environment/generator.js";
import * as Organizations from "../organizations/fantasy.js";
import Organization from "../organizations/organization.js";
import RealmGenerator from "../realms/generator.js";
import RealmGeneratorConfig from "../realms/generatorconfig.js";
import SettlementGenerator from "../settlements/generator.js";
import SettlementGeneratorConfig from "../settlements/generatorconfig.js";
import RegionGeneratorConfig from "./generatorconfig.js";
import Region from "./region.js";

export default class RegionGenerator {
  config: RegionGeneratorConfig;

  constructor(config: RegionGeneratorConfig) {
    this.config = config;
  }

  generate(): Region {
    let region = new Region();

    const envGen = new EnvironmentGenerator();

    let nameGenSet;

    if (this.config.dominantCulture != null) {
      region.dominantCulture = this.config.dominantCulture;
      nameGenSet = region.dominantCulture.generatorSet;
    } else {
      nameGenSet = this.config.nameGeneratorSet;
    }

    region.environment = envGen.generate();
    region.settlements = randomSettlements(region.environment, nameGenSet);
    region.organizations = randomOrganizations();
    region.description = region.environment.description;

    let realmGenConfig = new RealmGeneratorConfig();
    realmGenConfig.nameGeneratorSet = nameGenSet;
    const realmGen = new RealmGenerator(realmGenConfig);

    let mainRealm = realmGen.generate();
    region.realms.push(mainRealm);
    region.mainRealm = 0;

    if (!mainRealm.realmType.isStandalone) {
      let parentRealmConfig = new RealmGeneratorConfig();
      parentRealmConfig.nameGeneratorSet = realmGenConfig.nameGeneratorSet;
      if (mainRealm.realmType.parentType == null) {
        throw new Error("Realm type has no parent type.");
      }
      parentRealmConfig.realmTypes = [mainRealm.realmType.parentType];

      let parentRealmGen = new RealmGenerator(parentRealmConfig);
      let parentRealm = parentRealmGen.generate();

      region.realms.push(parentRealm);
      mainRealm.parent = 1;
    }

    let numberOfNeighbors = random.int(this.config.minRealms, this.config.maxRealms);
    for (let i = 0; i < numberOfNeighbors; i++) {
      realmGen.config.nameGeneratorSet = new MUN.FantasySet();
      if (RND.simple(100) > 70) {
        let neighborNameGenSet = RND.item(MUN.cultureSets());
        realmGen.config.nameGeneratorSet = neighborNameGenSet;
      }
      let neighbor = realmGen.generate();
      if (!neighbor.realmType.isStandalone) {
        if (RND.simple(100) > 50) {
          neighbor.parent = mainRealm.parent;
        } else {
          let parentRealmConfig = new RealmGeneratorConfig();
          if (neighbor.realmType.parentType == null) {
            throw new Error("Realm type has no parent type.");
          }
          parentRealmConfig.realmTypes = [neighbor.realmType.parentType];
          parentRealmConfig.nameGeneratorSet = realmGen.config.nameGeneratorSet;

          let parentRealmGen = new RealmGenerator(parentRealmConfig);
          let parentRealm = parentRealmGen.generate();
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
}

function randomOrganizations() {
  const orgs: Organization[] = [];
  const numberOfOrganizations = random.int(1, 3);

  for (let i = 0; i < numberOfOrganizations; i++) {
    orgs.push(Organizations.generate());
  }

  return orgs;
}

function randomSettlements(environment: Environment, nameGeneratorSet: MUN.GeneratorSet) {
  let settlementGenConfig = new SettlementGeneratorConfig();
  settlementGenConfig.nameGenerator = nameGeneratorSet.town;
  settlementGenConfig.size = "large";
  settlementGenConfig.environment = environment;
  let settlementGen = new SettlementGenerator(settlementGenConfig);
  const capital = settlementGen.generate();

  const numberOfMediumTowns = random.int(1, 3);
  const numberOfSmallTowns = random.int(3, 5);
  const towns = [];

  capital.description += " This is the capital of the region.";
  towns.push(capital);

  for (let i = 0; i < numberOfMediumTowns; i++) {
    settlementGen.config.size = "medium";
    const town = settlementGen.generate();
    towns.push(town);
  }

  for (let i = 0; i < numberOfSmallTowns; i++) {
    settlementGen.config.size = "small";
    const town = settlementGen.generate();
    towns.push(town);
  }

  return towns;
}
