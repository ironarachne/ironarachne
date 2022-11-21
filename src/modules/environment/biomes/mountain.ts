'use strict';

import type Biome from './biome';

export default class Mountain implements Biome {
  name: string;
  temperature: number;
  altitude: number;
  humidity: number;
  isAquatic: boolean;
  descriptions: string[];
  features: string[];

  constructor() {
    this.name = 'mountain';
    this.temperature = 3;
    this.altitude = 10;
    this.humidity = 2;
    this.isAquatic = false;
    this.descriptions = [
      'This is a craggy mountainous region, with few trees and a lot of shrubs.',
      'This mountain area is covered in coniferous trees.',
      'This region is high in the mountains.',
    ];
    this.features = [
      'Sheer cliffs are common here.',
      'An unusual number of trees grow here on the side of the mountain.',
      'This area is heavily forested, despite the extreme elevation.',
      'Low shrubs are particularly common.',
      'Wild goats thrive in the nearby cliffs.',
    ];
  }
}
