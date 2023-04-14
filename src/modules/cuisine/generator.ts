'use strict';

import Cuisine from './cuisine';
import CuisineGeneratorConfig from './generatorconfig';

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
