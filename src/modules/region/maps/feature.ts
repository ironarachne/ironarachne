'use strict';

export default class MapFeature {
  name: string;
  featureType: string;
  x: number;
  y: number;

  constructor(name: string, featureType: string) {
    this.name = name;
    this.featureType = featureType;
    this.x = 0;
    this.y = 0;
  }
}
