'use strict';

import Domain from '../domains/domain';
import Realm from '../realms/realm';
import * as Domains from '../domains/domains';
import NameGenerator from '../../names/generator';
import HumanSet from '../../names/races/human';

export default class PantheonGeneratorConfig {
  domains: Domain[];
  realms: Realm[];
  minDeities: number;
  maxDeities: number;
  femaleNameGenerator: NameGenerator;
  maleNameGenerator: NameGenerator;

  constructor() {
    this.domains = Domains.all();
    this.realms = [];
    this.minDeities = 1;
    this.maxDeities = 16;

    let genSet = new HumanSet();

    this.femaleNameGenerator = genSet.female;
    this.maleNameGenerator = genSet.male;
  }
}
