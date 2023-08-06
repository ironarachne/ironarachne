"use strict";

import EncounterGeneratorConfig from "../encounters/generatorconfig.js";
import TreasureSpawn from "./treasurespawn.js";

export default class EncounterSpawn {
  minRoom: number;
  maxRoom: number;
  encounterConfig: EncounterGeneratorConfig;
  treasureSpawns: TreasureSpawn[];

  constructor() {
    this.minRoom = -1;
    this.maxRoom = -1;
    this.treasureSpawns = [];
  }
}
