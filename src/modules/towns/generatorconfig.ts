"use strict";

import Environment from "../environment/environment";
import EnvironmentGenerator from "../environment/generator";
import NameGenerator from "../names/generator";
import FantasyTownsGenerator from "../names/generators/fantasytowns";

export default class TownGeneratorConfig {
  environment: Environment;
  nameGenerator: NameGenerator;
  size: string;

  constructor() {
    let envGen = new EnvironmentGenerator();
    this.environment = envGen.generate();
    this.nameGenerator = new FantasyTownsGenerator();
    this.size = "any";
  }
}
