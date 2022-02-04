'use strict';

import BiomeGeneratorConfig from './generatorconfig';
import * as RND from '../../random';
import Biome from './biome';

export default class BiomeGenerator {
  config: BiomeGeneratorConfig;

  constructor(config: BiomeGeneratorConfig) {
    this.config = config;
  }

  generate(): Biome {
    let options = [];

    for (let i = 0; i < this.config.availableBiomes.length; i++) {
      let biome = this.config.availableBiomes[i];
      let humidityMin = this.config.climate.precipitationAmount - 2;
      let humidityMax = this.config.climate.precipitationAmount + 2;
      let tempMin = this.config.climate.temperatureMin;
      let tempMax = this.config.climate.temperatureMax;
      if (
        biome.humidity <= humidityMax &&
        biome.humidity >= humidityMin &&
        biome.temperature <= tempMax &&
        biome.temperature >= tempMin
      ) {
        options.push(biome);
      }
    }

    let biome = RND.item(options);

    return biome;
  }
}
