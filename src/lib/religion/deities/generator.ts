"use strict";

import * as RND from "@ironarachne/rng";
import * as Words from "@ironarachne/words";
import random from "random";
import Deity from "./deity.js";
import DeityGeneratorConfig from "./generatorconfig.js";

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

    let deity = new Deity(
      deityName,
      characterDetails.species,
      characterDetails.gender,
      characterDetails.ageCategory,
      RND.item(this.config.realms),
      this.config.domainSet,
    );

    possibleHolyItems = this.config.domainSet.primary.holyItems;
    possibleHolySymbols = this.config.domainSet.primary.holySymbols;

    deity.holyItem = RND.item(possibleHolyItems);
    deity.holySymbol = RND.item(possibleHolySymbols);

    const chanceOfRealmTrait = random.int(1, 100);

    const physicalTraits = characterDetails.physicalTraits;
    let appearanceTraits = [];

    for (let i = 0; i < physicalTraits.length; i++) {
      appearanceTraits.push(physicalTraits[i].description);
    }

    if (chanceOfRealmTrait > 80) {
      appearanceTraits.push(RND.item(deity.realm.appearanceTraits).phrase);
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
