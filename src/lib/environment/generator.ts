"use strict";

import * as RND from "@ironarachne/rng";
import BiomeGenerator from "./biomes/generator.js";
import BiomeGeneratorConfig from "./biomes/generatorconfig.js";
import * as Climates from "./climates/climates.js";
import Environment from "./environment.js";

export default class EnvironmentGenerator {
  generate(): Environment {
    let climate = Climates.random();
    climate.description = Climates.describe(climate);
    const biomeGeneratorConfig = new BiomeGeneratorConfig(climate);
    const biomeGen = new BiomeGenerator(biomeGeneratorConfig);
    const biome = biomeGen.generate();

    let environment = new Environment(biome, climate);

    environment.description = `${RND.item(biome.descriptions)} ${RND.item(biome.features)}`;
    environment.description += " " + environment.climate.description;

    return environment;
  }
}
