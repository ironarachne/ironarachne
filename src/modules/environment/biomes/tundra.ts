'use strict';

import Biome from './biome';

export default class Tundra implements Biome {
  name: string;
  temperature: number;
  altitude: number;
  humidity: number;
  isAquatic: boolean;
  descriptions: string[];
  features: string[];

  constructor() {
    this.name = 'tundra';
    this.temperature = 2;
    this.altitude = 2;
    this.humidity = 6;
    this.isAquatic = false;
    this.descriptions = [
      'The frozen ground is occasionally broken by tufts of hearty grass.',
      'Bitter cold is the norm here and the wildlife has thick fur and feathers.',
      'This is a brutally cold region with a sparse population of wildlife.',
    ];
    this.features = [
      'There are icy outcroppings of rock here.',
      'The wind howls along stretches of snow-covered ground, reminiscent of a snowy desert.',
    ];
  }
}
