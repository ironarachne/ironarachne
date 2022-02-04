'use strict';

import * as Biomes from './biomes';
import Biome from './biome';
import Climate from '../climates/climate';

export default class BiomeGeneratorConfig {
  availableBiomes: Biome[];
  climate: Climate;

  constructor(climate: Climate) {
    this.availableBiomes = Biomes.all();
    this.climate = climate;
  }
}
