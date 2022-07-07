'use strict';

import GeneratorSet from '../names/generatorset';
import FantasySet from '../names/cultures/fantasy';

export default class RegionGeneratorConfig {
  nameGeneratorSet: GeneratorSet;
  mapWidth: number;
  mapHeight: number;
  minRealms: number;
  maxRealms: number;

  constructor() {
    this.nameGeneratorSet = new FantasySet();
    this.mapWidth = 40;
    this.mapHeight = 30;
    this.minRealms = 2;
    this.maxRealms = 4;
  }
}
