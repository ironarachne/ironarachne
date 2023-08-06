"use strict";

import * as MUN from "@ironarachne/made-up-names";
import Culture from "../culture/culture.js";

export default class RegionGeneratorConfig {
  nameGeneratorSet: MUN.GeneratorSet;
  dominantCulture: Culture | null;
  mapWidth: number;
  mapHeight: number;
  minRealms: number;
  maxRealms: number;

  constructor() {
    this.nameGeneratorSet = new MUN.FantasySet();
    this.dominantCulture = null;
    this.mapWidth = 40;
    this.mapHeight = 30;
    this.minRealms = 2;
    this.maxRealms = 4;
  }
}
