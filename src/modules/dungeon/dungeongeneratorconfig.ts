'use strict';

import type Biome from '../environment/biomes/biome';
import BiomeGenerator from '../environment/biomes/generator';
import BiomeGeneratorConfig from '../environment/biomes/generatorconfig';
import * as Climates from '../environment/climates/climates';

export default class DungeonGeneratorConfig {
  possibleBiomes: Biome[];
  width: number; // cells
  height: number; // cells
  maxRoomWidth: number; // cells
  maxRoomHeight: number; // cells
  maxRooms: number;
  minRooms: number;

  constructor() {
    this.width = 40;
    this.height = 50;
    this.maxRoomHeight = 8;
    this.maxRoomWidth = 8;
    this.maxRooms = 30;
    this.minRooms = 20;

    let climate = Climates.random();
    let biomeGenConfig = new BiomeGeneratorConfig(climate);
    let biomeGen = new BiomeGenerator(biomeGenConfig);

    let biomes = [];
    for (let i = 0; i < 5; i++) {
      biomeGen.config.climate = Climates.random();
      biomes.push(biomeGen.generate());
    }
    this.possibleBiomes = biomes;
  }
}
