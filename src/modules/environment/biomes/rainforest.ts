'use strict';

import type Biome from './biome';

export default class Rainforest implements Biome {
  name: string;
  temperature: number;
  altitude: number;
  humidity: number;
  isAquatic: boolean;
  descriptions: string[];
  features: string[];

  constructor() {
    this.name = 'rainforest';
    this.temperature = 7;
    this.altitude = 3;
    this.humidity = 9;
    this.isAquatic = false;
    this.descriptions = [
      'This tropical rainforest is filled with lush vegetation.',
      'The heat of this rainforest is oppressive, but the thick canopy and frequent rains provide relief.',
      'Heavy rains, hot temperatures, and rampant predators make this jungle difficult to live in.',
    ];
    this.features = [
      'This area has beautiful waterfalls in between lush jungle foliage.',
      'A wide variety of colorful animals make their home here.',
      'Vicious jungle predators are unusually common here.',
      'The local flora provides many natural medicines unavailable elsewhere.',
      'Flowers of uncommon beauty draw many visitors to this area.',
    ];
  }
}
