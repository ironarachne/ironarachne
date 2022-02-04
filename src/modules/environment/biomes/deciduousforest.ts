'use strict';

import Biome from './biome';

export default class DeciduousForest implements Biome {
  name: string;
  temperature: number;
  altitude: number;
  humidity: number;
  isAquatic: boolean;
  descriptions: string[];
  features: string[];

  constructor() {
    this.name = 'deciduous forest';
    this.temperature = 5;
    this.altitude = 3;
    this.humidity = 5;
    this.isAquatic = false;
    this.descriptions = [
      'This is an old forest region. Some of the trees here are bigger around than ten men linking arms could wrap around.',
      'Deciduous trees cover this area. Thick canopies give way to the occasional meadow.',
      'This forest is filled with big oaks and ample wildlife.',
    ];
    this.features = [
      'There is a large meadow here within an otherwise endless expanse of trees.',
      'Large, ancient oaks grow around here.',
      'Ash and oak trees are common here.',
      'There are some truly ancient trees in the forest here.',
    ];
  }
}
