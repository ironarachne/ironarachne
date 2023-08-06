"use strict";

import * as MUN from "@ironarachne/made-up-names";
import type StarNationGovernment from "./government.js";
import * as Governments from "./governments.js";

export default class StarNationGeneratorConfig {
  minSystems: number;
  maxSystems: number;
  governmentOptions: StarNationGovernment[];
  nameGenerator: MUN.Generator;

  constructor() {
    this.minSystems = -1;
    this.maxSystems = -1;
    this.governmentOptions = Governments.all();
    this.nameGenerator = new MUN.StarNationNameGenerator();
  }
}
