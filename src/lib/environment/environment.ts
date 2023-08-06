"use strict";

import type Biome from "./biomes/biome.js";
import type Climate from "./climates/climate.js";

export default class Environment {
  biome: Biome;
  climate: Climate;
  description: string;

  constructor(biome: Biome, climate: Climate) {
    this.biome = biome;
    this.climate = climate;
  }
}
