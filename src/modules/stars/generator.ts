'use strict';

import StarGeneratorConfig from "./generatorconfig";
import * as RND from '../random';
import * as StarNames from '../names/stars';
import * as Words from '../words';

import random from 'random';
import Star from "./star";

export default class StarGenerator {
  config: StarGeneratorConfig;

  constructor(config: StarGeneratorConfig) {
    this.config = config;
  }

  generate() {
    const classification = RND.weighted(this.config.possibleClassifications);

    const star = new Star();

    star.classification = classification.name;
    star.radius = random.float(classification.radius_min, classification.radius_max) * 695508;
    star.mass = random.float(classification.mass_min, classification.mass_max) * 1.989;
    star.temperature = random.int(classification.temperature_min, classification.temperature_max);
    star.luminosity =
      random.float(classification.luminosity_min, classification.luminosity_max) * 3.828;
    star.color = star.getColorFromTemperature();

    const article = Words.article(star.color);
    star.description = `This is ${article} ${star.color} ${star.classification} star.`;
    star.name = StarNames.generate();

    return star;
  }
}
