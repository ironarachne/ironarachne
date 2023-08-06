"use strict";

import * as MUN from "@ironarachne/made-up-names";
import RealmType from "./realmtype.js";
import * as RealmTypes from "./realmtypes.js";

export default class RealmGeneratorConfig {
  nameGeneratorSet: MUN.GeneratorSet;
  realmTypes: RealmType[];
  mapTiles: number[][];
  mapWidth: number;
  mapHeight: number;

  constructor() {
    this.nameGeneratorSet = new MUN.FantasySet();
    this.realmTypes = RealmTypes.all();
    this.mapWidth = 40;
    this.mapHeight = 30;
    this.mapTiles = [];
  }
}
