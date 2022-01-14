"use strict";

import * as AppearanceTraits from "./appearancetraits";
import * as Character from "../characters/common";
import Deity from "./deity";
import * as Domains from "./domains";
import Domain from "./domain";
import CharacterGenerator from "../characters/generator";
import * as PremadeConfigs from "../characters/premadeconfigs";
import * as RND from "../random";
import Pantheon from "./pantheon";
import * as Classifications from "./classifications";
import Realm from "./realm";
import * as RealmConcepts from "./realmconcepts";
import * as Relationship from "../characters/relationship";
import Religion from "./religion";
import * as Words from "../words";

import random from "random";

export function generate(): Religion {
  const realms = randomRealms();

  const classification = Classifications.random();

  const numberOfDeities = random.int(classification.minSize, classification.maxSize);

  let pantheonDescription = "This pantheon is " + Words.article(classification.name) + ` ${classification.name}`;

  if (numberOfDeities > 1) {
    pantheonDescription += ` with ${numberOfDeities} gods.`;
  } else {
    pantheonDescription += ` with a single all-powerful god.`;
  }

  const domainSets = randomDomainSets(numberOfDeities);

  const religion = new Religion("");
  religion.realms = realms;
  religion.pantheon = new Pantheon("", pantheonDescription, classification);
  religion.pantheon.deities = randomDeities(domainSets, realms);

  if (classification.hasLeader) {
    let leaderOptions = [];
    if (classification.leaderGender === "any") {
      leaderOptions = religion.pantheon.deities;
    } else {
      for (let i = 0; i < religion.pantheon.deities.length; i++) {
        if (religion.pantheon.deities[i].gender.name === classification.leaderGender) {
          leaderOptions.push(religion.pantheon.deities[i]);
        }
      }
    }
    const leader = RND.item(leaderOptions);

    for (let i = 0; i < religion.pantheon.deities.length; i++) {
      if (leader.name === religion.pantheon.deities[i].name) {
        let leaderTitle = "Queen of the Gods";
        if (leader.gender.name === "male") {
          leaderTitle = "King of the Gods";
        }

        religion.pantheon.deities[i].titles.push(leaderTitle);
        religion.pantheon.description += ` ${leader.name} is the ${leaderTitle}.`;
      }
    }
  }

  religion.description = randomGatheringTimes() + " For these gatherings, " + randomGatheringPlace() + ".";

  return religion;
}

function randomDeities(domainSets: Domain[][], realms: Realm[]): Deity[] {
  const deities = [];

  for (let i = 0; i < domainSets.length; i++) {
    console.debug('adding a new deity for domain set...');
    let possibleHolyItems: string[] = [];
    let possibleHolySymbols: string[] = [];

    console.debug('generating character details for deity...');
    let charGenConfig = PremadeConfigs.getFantasy();

    const charGen = new CharacterGenerator(charGenConfig);
    const characterDetails = charGen.generate();

    console.debug('creating deity object...');
    let deity = new Deity(characterDetails.firstName, characterDetails.species, characterDetails.gender, characterDetails.ageCategory, RND.item(realms), domainSets[i]);

    console.debug(`deity ${deity.name} generated, now adding holy item and holy symbol...`);

    for (let j = 0; j < domainSets[i].length; j++) {
      possibleHolyItems = possibleHolyItems.concat(domainSets[i][j].holyItems);
      possibleHolySymbols = possibleHolySymbols.concat(domainSets[i][j].holySymbols);
    }

    deity.holyItem = RND.item(possibleHolyItems);
    deity.holySymbol = RND.item(possibleHolySymbols);

    const chanceOfRealmTrait = random.int(1, 100);

    const appearanceTraits = characterDetails.traits;

    if (chanceOfRealmTrait > 80) {
      appearanceTraits.push(RND.item(deity.realm.appearanceTraits).phrase);
    }

    deity.personality = Character.getRandomPersonality(deity.gender);
    deity.appearance = Words.arrayToPhrase(appearanceTraits);
    deity.description = deity.describe();

    deities.push(deity);
  }

  for (let j = 0; j < 3; j++) {
    for (let i = 0; i < deities.length; i++) {
      const strength = random.int(0, 3);
      const target = RND.item(deities).name;
      if (target != deities[i].name) {
        let alreadyExists = false;
        for (let k = 0; k < deities[i].relationships.length; k++) {
          if (deities[i].relationships[k].target == target) {
            alreadyExists = true;
          }
        }
        if (!alreadyExists) {
          deities[i].relationships.push(new Relationship.Relationship(strength, target));
        }
      }
    }
  }

  if (deities.length > 1) {
    for (let i = 0; i < deities.length; i++) {
      const relationships = [];
      for (let j = 0; j < deities[i].relationships.length; j++) {
        relationships.push(Relationship.getRandomVerbForStrength(deities[i].relationships[j].strength) + " " + deities[i].relationships[j].target);
      }
      const relationshipDescription = " " + deities[i].name + " " + Words.arrayToPhrase(relationships) + ".";

      deities[i].description += relationshipDescription;
    }
  }

  return deities;
}

function randomDomainSets(numberOfSets: number): Domain[][] {
  const sets = [];

  const domains = RND.shuffle(Domains.all());

  for (let i = 0; i < numberOfSets; i++) {
    let numberOfDomainsInSet = 1;
    const setDomains = [];

    const chanceOfMore = random.int(1, 100);
    if (chanceOfMore > 80) {
      numberOfDomainsInSet += random.int(1, 2);
    }

    for (let j = 0; j < numberOfDomainsInSet; j++) {
      const d = domains.pop();
      setDomains.push(d);
    }

    sets.push(setDomains);
  }

  return sets;
}

function randomGatheringPlace(): string {
  let description = RND.item([
    "{follower} gather in {place} for {service}",
    "{follower} congregate in {place} to be led in {service} by a {leader}",
  ]);

  const follower = RND.item([
    "adherents",
    "followers",
    "the faithful",
  ]);

  const place = RND.item([
    "temples",
    "churches",
    "open spaces",
    "lodges",
  ]);

  const service = RND.item([
    "silent meditation",
    "ritual dance",
    "solemn service",
    "wild service",
    "ritual music",
    "structured recitation",
    "ritual chanting",
  ]);

  const leader = RND.item([
    "priest",
    "priestess",
    "shaman",
    "community leader",
    "hereditary priest",
    "hereditary priestess",
    "member of the nobility",
  ]);

  description = description.replace("{follower}", follower).replace("{place}", place).replace("{service}", service).replace("{leader}", leader);

  return description;
}

function randomGatheringTimes(): string {
  return RND.item([
    "Regular gatherings happen once a week.",
    "Regular gatherings happen daily.",
    "Regular gatherings happen once a month.",
  ]);
}

function randomRealms(): Realm[] {
  const realms = [];

  const numberOfRealms = random.int(1, 3);

  let allConcepts = RealmConcepts.all();
  allConcepts = RND.shuffle(allConcepts);

  for (let i = 0; i < numberOfRealms; i++) {
    const concept = allConcepts.pop();

    if (typeof concept == 'object') {
      const realmName = RND.item(concept.nameOptions);

      const appearanceTraits = AppearanceTraits.getAllAppearanceTraitsForRealmConcept(concept);

      let description = RND.item(concept.descriptionOptions).replace("{name}", Words.uncapitalize(realmName));
      description = Words.capitalize(description);

      const realm = new Realm(realmName, description, [], appearanceTraits);

      realms.push(realm);
    }
  }

  return realms;
}
