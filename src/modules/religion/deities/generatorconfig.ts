'use strict';

import CharacterGenerator from '../../characters/generator';
import Realm from '../realms/realm';
import * as PremadeConfigs from '../../characters/premadeconfigs';
import DomainSet from '../domains/domainset';
import NameGenerator from '../../names/generator';
import HumanSet from '../../names/races/human';

export default class DeityGeneratorConfig {
  domainSet: DomainSet;
  realms: Realm[];
  characterGenerator: CharacterGenerator;
  femaleNameGenerator: NameGenerator;
  maleNameGenerator: NameGenerator;

  constructor() {
    let charGenConfig = PremadeConfigs.getFantasy();

    this.realms = [];
    this.characterGenerator = new CharacterGenerator(charGenConfig);

    let genSet = new HumanSet();

    this.femaleNameGenerator = genSet.female;
    this.maleNameGenerator = genSet.male;
  }
}
