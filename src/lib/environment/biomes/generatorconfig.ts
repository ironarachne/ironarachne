"use strict";

import type Climate from "../climates/climate.js";
import type Biome from "./biome.js";
import * as Biomes from "./biomes.js";

export default class BiomeGeneratorConfig {
  availableBiomes: Biome[];
  climate: Climate;

  constructor(climate: Climate) {
    this.availableBiomes = Biomes.all();
    this.climate = climate;
  }
}
