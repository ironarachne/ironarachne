"use strict";

import type Character from "$lib/characters/character.js";
import CharacterGenerator from "$lib/characters/generator.js";
import * as PremadeConfigs from "$lib/characters/premadeconfigs.js";
import HeraldryGenerator from "$lib/heraldry/generator.js";
import type { GeneratorSet } from "@ironarachne/made-up-names";
import * as RND from "@ironarachne/rng";
import * as Words from "@ironarachne/words";
import type RealmGeneratorConfig from "./generatorconfig.js";
import Realm from "./realm.js";
import type RealmType from "./realmtype.js";

export default class RealmGenerator {
  config: RealmGeneratorConfig;

  constructor(config: RealmGeneratorConfig) {
    this.config = config;
  }

  generate(): Realm {
    let realm = new Realm();
    realm.realmType = RND.weighted(this.config.realmTypes);

    if (this.config.nameGeneratorSet.country === null) {
      throw new Error("RealmGenerator requires a country name generator set.");
    }

    let name = this.config.nameGeneratorSet.country.generate(1)[0];
    realm.name = `the ${Words.title(realm.realmType.name)} of ${name}`;
    let herGen = new HeraldryGenerator();
    realm.heraldry = herGen.generate();
    realm.authority = randomAuthority(realm.realmType, this.config.nameGeneratorSet);

    return realm;
  }
}

function randomAuthority(realmType: RealmType, nameGeneratorSet: GeneratorSet): Character {
  let charGenConfig = PremadeConfigs.getFantasy();
  charGenConfig.ageCategories = ["adult"];
  if (nameGeneratorSet.family === null) {
    throw new Error("RealmGenerator requires a family name generator set.");
  }
  if (nameGeneratorSet.female === null) {
    throw new Error("RealmGenerator requires a female name generator set.");
  }
  if (nameGeneratorSet.male === null) {
    throw new Error("RealmGenerator requires a male name generator set.");
  }
  charGenConfig.familyNameGenerator = nameGeneratorSet.family;
  charGenConfig.femaleNameGenerator = nameGeneratorSet.female;
  charGenConfig.maleNameGenerator = nameGeneratorSet.male;
  charGenConfig.useAdaptiveNames = false;

  const charGen = new CharacterGenerator(charGenConfig);

  let authority = charGen.generate();
  authority.titles.push(realmType.grantedTitle);
  let herGen = new HeraldryGenerator();
  authority.heraldry = herGen.generate();

  return authority;
}
