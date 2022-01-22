"use strict";

import Biome from "./biomes/biome";
import Climate from "./climates/climate";

export default class Environment {
  biome: Biome;
  climate: Climate;
  description: string;

  constructor(biome: Biome, climate: Climate) {
    this.biome = biome;
    this.climate = climate;
  }
}
