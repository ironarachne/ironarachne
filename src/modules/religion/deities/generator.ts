'use strict';

import Deity from './deity';
import DeityGeneratorConfig from './generatorconfig';
import * as RND from '../../random';
import * as Words from '../../words';
import random from 'random';

export default class DeityGenerator {
  config: DeityGeneratorConfig;

  constructor(config: DeityGeneratorConfig) {
    this.config = config;
  }

  generate(): Deity {
    let possibleHolyItems: string[] = [];
    let possibleHolySymbols: string[] = [];

    const characterDetails = this.config.characterGenerator.generate();

    let deityName = this.config.femaleNameGenerator.generate(1)[0];
    if (characterDetails.gender.name == 'male') {
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

  return Words.capitalize(deity.gender.subjectivePronoun) + ' is ' + Words.arrayToPhrase(traits);
}
