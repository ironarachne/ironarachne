"use strict";

import Environment from "../environment/environment";

export default class Town {
  name: string;
  description: string;
  environment: Environment;

  constructor(name: string, environment: Environment) {
    this.name = name;
    this.description = "";
    this.environment = environment;
  }
}
