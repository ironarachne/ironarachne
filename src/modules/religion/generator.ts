"use strict";

import * as Character from "../characters/common";
import * as Deity from "./deity";
import * as Domain from "./domain";
import * as FantasyCharacter from "../characters/fantasy";
import * as RND from "../random";
import * as Pantheon from "./pantheon";
import * as Realm from "./realm";
import * as Relationship from "../characters/relationship";
import * as Religion from "./religion";
import * as Words from "../words";
import {Concept} from "./realm";

const random = require("random");

export function generate() {
  let realms = randomRealms();

  let classification = Pantheon.randomClassification();

  let numberOfDeities = random.int(classification.minSize, classification.maxSize);

  let pantheonDescription = "This pantheon is " + Words.article(classification.name) + ` ${classification.name}`;

  if (numberOfDeities > 1) {
    pantheonDescription += ` with ${numberOfDeities} gods.`;
  } else {
    pantheonDescription += ` with a single all-powerful god.`;
  }

  let domainSets = randomDomainSets(numberOfDeities);

  let religion = new Religion.Religion("");
  religion.realms = realms;
  religion.pantheon = new Pantheon.Pantheon("", pantheonDescription, classification);
  religion.pantheon.deities = randomDeities(domainSets, realms);

  if (classification.hasLeader) {
    let leaderOptions = [];
    if (classification.leaderGender === "any") {
      leaderOptions = religion.pantheon.deities;
    } else {
      for (let i = 0; i < religion.pantheon.deities.length; i++) {
        if (religion.pantheon.deities[i].gender === classification.leaderGender) {
          leaderOptions.push(religion.pantheon.deities[i]);
        }
      }
    }
    let leader = RND.item(leaderOptions);

    for (let i = 0; i < religion.pantheon.deities.length; i++) {
      if (leader.name === religion.pantheon.deities[i].name) {
        let leaderTitle = "Queen of the Gods";
        if (leader.gender === "male") {
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

function randomDeities(domainSets: Domain.Domain[][], realms: Realm.Realm[]) {
  let deities = [];

  for (let i = 0; i < domainSets.length; i++) {
    let possibleHolyItems: string[] = [];
    let possibleHolySymbols: string[] = [];
    let characterDetails = FantasyCharacter.generate();
    let deity = new Deity.Deity(characterDetails.firstName, characterDetails.species, characterDetails.gender, RND.item(realms), domainSets[i]);

    for (let j = 0; j < domainSets[i].length; j++) {
      possibleHolyItems = possibleHolyItems.concat(domainSets[i][j].holyItems);
      possibleHolySymbols = possibleHolySymbols.concat(domainSets[i][j].holySymbols);
    }

    deity.holyItem = RND.item(possibleHolyItems);
    deity.holySymbol = RND.item(possibleHolySymbols);

    let chanceOfRealmTrait = random.int(1, 100);

    let appearanceTraits = characterDetails.traits;

    if (chanceOfRealmTrait > 80) {
      appearanceTraits.push(RND.item(deity.realm.appearanceTraits).phrase);
    }

    deity.personality = Character.getRandomPersonality(deity.gender);
    deity.appearance = Words.arrayToPhrase(appearanceTraits);
    deity.description = Deity.describe(deity);

    deities.push(deity);
  }

  for (let j = 0; j < 3; j++) {
    for (let i = 0; i < deities.length; i++) {
      let strength = random.int(0, 3);
      let target = RND.item(deities).name;
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
      let relationships = [];
      for (let j = 0; j < deities[i].relationships.length; j++) {
        relationships.push(Relationship.getRandomVerbForStrength(deities[i].relationships[j].strength) + " " + deities[i].relationships[j].target);
      }
      let relationshipDescription = " " + deities[i].name + " " + Words.arrayToPhrase(relationships) + ".";

      deities[i].description += relationshipDescription;
    }
  }

  return deities;
}

function randomDomainSets(numberOfSets: number) {
  let sets = [];

  let domains = RND.shuffle(Domain.all());

  for (let i = 0; i < numberOfSets; i++) {
    let numberOfDomainsInSet = 1;
    let setDomains = [];

    let chanceOfMore = random.int(1, 100);
    if (chanceOfMore > 80) {
      numberOfDomainsInSet += random.int(1, 2);
    }

    for (let j = 0; j < numberOfDomainsInSet; j++) {
      let d = domains.pop();
      setDomains.push(d);
    }

    sets.push(setDomains);
  }

  return sets;
}

function randomGatheringPlace() {
  let description = RND.item([
    "{follower} gather in {place} for {service}",
    "{follower} congregate in {place} to be led in {service} by a {leader}",
  ]);

  let follower = RND.item([
    "adherents",
    "followers",
    "the faithful",
  ]);

  let place = RND.item([
    "temples",
    "churches",
    "open spaces",
    "lodges",
  ]);

  let service = RND.item([
    "silent meditation",
    "ritual dance",
    "solemn service",
    "wild service",
    "ritual music",
    "structured recitation",
    "ritual chanting",
  ]);

  let leader = RND.item([
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

function randomGatheringTimes() {
  return RND.item([
    "Regular gatherings happen once a week.",
    "Regular gatherings happen daily.",
    "Regular gatherings happen once a month.",
  ]);
}

function randomRealms() {
  let realms = [];

  let numberOfRealms = random.int(1, 3);

  let allConcepts = Realm.allConcepts();
  allConcepts = RND.shuffle(allConcepts);

  for (let i = 0; i < numberOfRealms; i++) {
    let concept = allConcepts.pop();

    if (typeof concept == 'object') {
      let realmName = RND.item(concept.nameOptions);

      let appearanceTraits = Realm.getAllAppearanceTraitsForRealmConcept(concept);

      let description = RND.item(concept.descriptionOptions).replace("{name}", Words.uncapitalize(realmName));
      description = Words.capitalize(description);

      let realm = new Realm.Realm(realmName, description, [], appearanceTraits);

      realms.push(realm);
    }
  }

  return realms;
}
