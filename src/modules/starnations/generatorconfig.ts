'use strict';

import NameGenerator from '../names/generator';
import StarNationNameGenerator from '../names/scifi/nations';
import StarNationGovernment from './government';
import * as Governments from './governments';

export default class StarNationGeneratorConfig {
  minSystems: number;
  maxSystems: number;
  governmentOptions: StarNationGovernment[];
  nameGenerator: NameGenerator;

  constructor() {
    this.minSystems = -1;
    this.maxSystems = -1;
    this.governmentOptions = Governments.all();
    this.nameGenerator = new StarNationNameGenerator();
  }
}
