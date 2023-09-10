import * as MUN from "@ironarachne/made-up-names";
import * as RND from "@ironarachne/rng";
import * as Words from "@ironarachne/words";
import StarGeneratorConfig from "./generatorconfig.js";

import random from "random";
import Star from "./star.js";

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
    star.luminosity = random.float(classification.luminosity_min, classification.luminosity_max) * 3.828;
    star.color = star.getColorFromTemperature();

    const article = Words.article(star.color);
    star.description = `This is ${article} ${star.color} ${star.classification} star.`;
    star.name = MUN.star();

    return star;
  }
}
