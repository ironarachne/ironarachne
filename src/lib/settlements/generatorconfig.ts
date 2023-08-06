"use strict";

import * as MUN from "@ironarachne/made-up-names";
import Environment from "../environment/environment.js";
import EnvironmentGenerator from "../environment/generator.js";

export default class SettlementGeneratorConfig {
  environment: Environment;
  nameGenerator: MUN.Generator | null;
  size: string;

  constructor() {
    let envGen = new EnvironmentGenerator();
    this.environment = envGen.generate();

    let genSet = new MUN.FantasySet();

    this.nameGenerator = genSet.town;
    this.size = "any";
  }
}
