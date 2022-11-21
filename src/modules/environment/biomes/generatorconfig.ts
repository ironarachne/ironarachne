'use strict';

import * as Biomes from './biomes';
import type Biome from './biome';
import type Climate from '../climates/climate';

export default class BiomeGeneratorConfig {
  availableBiomes: Biome[];
  climate: Climate;

  constructor(climate: Climate) {
    this.availableBiomes = Biomes.all();
    this.climate = climate;
  }
}
