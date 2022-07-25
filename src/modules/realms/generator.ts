'use strict';

import RealmGeneratorConfig from './generatorconfig';
import Realm from './realm';
import * as RND from '../random';
import * as PremadeConfigs from '../characters/premadeconfigs';
import * as Words from '../words';
import Character from '../characters/character';
import CharacterGenerator from '../characters/generator';
import RealmType from './realmtype';
import HeraldryGenerator from '../heraldry/generator';
import GeneratorSet from '../names/generatorset';

export default class RealmGenerator {
  config: RealmGeneratorConfig;

  constructor(config: RealmGeneratorConfig) {
    this.config = config;
  }

  generate(): Realm {
    let realm = new Realm();
    realm.realmType = RND.weighted(this.config.realmTypes);

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
  charGenConfig.ageCategories = ['adult'];
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
