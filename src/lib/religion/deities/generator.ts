"use strict";

import * as RND from "@ironarachne/rng";
import * as Words from "@ironarachne/words";
import * as Deities from "./deities.js";
import type Deity from "./deity.js";
import type DeityGeneratorConfig from "./generatorconfig.js";

export default class DeityGenerator {
  config: DeityGeneratorConfig;

  constructor(config: DeityGeneratorConfig) {
    this.config = config;
  }

  generate(): Deity {
    let possibleHolyItems: string[] = [];
    let possibleHolySymbols: string[] = [];

    const characterDetails = this.config.characterGenerator.generate();

    if (this.config.maleNameGenerator === null) {
      throw new Error("male name generator not set");
    } else if (this.config.femaleNameGenerator === null) {
      throw new Error("female name generator not set");
    }
    let deityName = this.config.femaleNameGenerator.generate(1)[0];
    if (characterDetails.gender.name == "male") {
      deityName = this.config.maleNameGenerator.generate(1)[0];
    }

    let realm = RND.item(this.config.realms);
    if (realm === undefined) {
      throw new Error("realm is undefined");
    }

    let deity = Deities.newDeity(
      deityName,
      characterDetails.species,
      characterDetails.gender,
      characterDetails.ageCategory,
      realm,
      this.config.domainSet,
    );

    possibleHolyItems = this.config.domainSet.primary.holyItems;
    possibleHolySymbols = this.config.domainSet.primary.holySymbols;

    deity.holyItem = RND.item(possibleHolyItems);
    deity.holySymbol = RND.item(possibleHolySymbols);

    const chanceOfRealmTrait = RND.simple(100);

    const physicalTraits = characterDetails.physicalTraits;
    let appearanceTraits = [];

    for (let i = 0; i < physicalTraits.length; i++) {
      appearanceTraits.push(physicalTraits[i].description);
    }

    if (chanceOfRealmTrait > 80) {
      let realmTrait = RND.item(deity.realm.appearanceTraits);
      if (realmTrait === undefined) {
        console.log(JSON.stringify(deity.realm));
        throw new Error("realm appearance trait is undefined");
      }
      appearanceTraits.push(realmTrait.phrase);
    }

    deity.personalityTraits = characterDetails.personalityTraits;
    deity.personality = describePersonality(deity);
    deity.appearance = Words.arrayToPhrase(appearanceTraits);
    deity.description = deity.describe();

    return deity;
  }
}

function describePersonality(deity: Deity): string {
  let traits = [];

  for (let i = 0; i < deity.personalityTraits.length; i++) {
    traits.push(deity.personalityTraits[i].descriptor);
  }

  return Words.capitalize(deity.gender.subjectivePronoun) + " is " + Words.arrayToPhrase(traits);
}
