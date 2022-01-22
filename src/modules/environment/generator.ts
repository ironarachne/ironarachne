"use strict";

import BiomeGenerator from "./biomes/generator";
import BiomeGeneratorConfig from "./biomes/generatorconfig";
import * as Climates from "./climates/climates";
import * as RND from "../random";
import Environment from "./environment";

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
