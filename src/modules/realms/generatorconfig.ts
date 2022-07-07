'use strict';

import FantasySet from '../names/cultures/fantasy';
import GeneratorSet from '../names/generatorset';
import * as RealmTypes from './realmtypes';
import RealmType from './realmtype';

export default class RealmGeneratorConfig {
  nameGeneratorSet: GeneratorSet;
  realmTypes: RealmType[];
  mapTiles: number[][];
  mapWidth: number;
  mapHeight: number;

  constructor() {
    this.nameGeneratorSet = new FantasySet();
    this.realmTypes = RealmTypes.all();
    this.mapWidth = 40;
    this.mapHeight = 30;
    this.mapTiles = [];
  }
}
