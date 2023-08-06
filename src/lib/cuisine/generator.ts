"use strict";

import Cuisine from "./cuisine.js";
import CuisineGeneratorConfig from "./generatorconfig.js";

export default class CuisineGenerator {
  config: CuisineGeneratorConfig;

  constructor(config: CuisineGeneratorConfig) {
    this.config = config;
  }

  generate(): Cuisine {
    let cuisine = new Cuisine();

    // TODO: Generate cuisine

    return cuisine;
  }
}
