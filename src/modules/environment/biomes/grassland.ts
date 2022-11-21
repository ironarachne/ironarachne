'use strict';

import type Biome from './biome';

export default class Grassland implements Biome {
  name: string;
  temperature: number;
  altitude: number;
  humidity: number;
  isAquatic: boolean;
  descriptions: string[];
  features: string[];

  constructor() {
    this.name = 'grassland';
    this.temperature = 6;
    this.altitude = 2;
    this.humidity = 4;
    this.isAquatic = false;
    this.descriptions = [
      "This area's broad open spaces are covered in tall grasses.",
      'Low rolling hills make up this region.',
      'The occasional hill breaks up what is otherwise a vast expanse of flat grassland.',
    ];
    this.features = [
      'The tall grasses here resemble ocean waves in the breeze.',
      'Wild horses are common here.',
      'The sun rising over the grassy plains causes some awe-inspiring sunrises here.',
      'Birds of every description make their home here.',
      'Though the terrain is mostly low rolling hills, there are one or two rocky cliffs jutting out of the landscape.',
      'The grass here is uncommonly tall, coming up to chest height.',
    ];
  }
}
