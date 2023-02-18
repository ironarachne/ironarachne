'use strict';

import type Biome from './biome';

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
      'The frozen tundra stretches out as far as the eye can see, a vast expanse of white snow and ice beneath an endless grey sky.',
      'The biting wind whips across the barren landscape, where the frozen ground and snow-covered hills make survival a constant struggle.',
      'In the midst of the cold and barren tundra, small patches of greenery and resilient wildlife give hope for survival and adaptation.',
      'The freezing wind howls through the tundra, carrying the sound of cracking ice and snow.',
    ];
    this.features = [
      'There are icy outcroppings of rock here.',
      'The wind howls along stretches of snow-covered ground, reminiscent of a snowy desert.',
      'A towering glacier gleams in the sunlight, casting an icy stillness over the barren tundra.',
      'A towering granite peak looms over the barren tundra landscape.',
      'Herds of caribou traverse the tundra, accompanied by wolves and arctic foxes adapted to the harsh conditions.',
      'Low-growing shrubs, grasses, and mosses cling to the rocky terrain, adapted to withstand the harsh conditions of the environment.',
    ];
  }
}
