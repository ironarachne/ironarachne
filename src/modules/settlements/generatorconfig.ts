'use strict';

import Environment from '../environment/environment';
import EnvironmentGenerator from '../environment/generator';
import FantasySet from '../names/cultures/fantasy';
import NameGenerator from '../names/generator';

export default class SettlementGeneratorConfig {
  environment: Environment;
  nameGenerator: NameGenerator;
  size: string;

  constructor() {
    let envGen = new EnvironmentGenerator();
    this.environment = envGen.generate();

    let genSet = new FantasySet();

    this.nameGenerator = genSet.town;
    this.size = 'any';
  }
}
