'use strict';

import type Biome from './biomes/biome';
import type Climate from './climates/climate';

export default class Environment {
  biome: Biome;
  climate: Climate;
  description: string;

  constructor(biome: Biome, climate: Climate) {
    this.biome = biome;
    this.climate = climate;
  }
}
