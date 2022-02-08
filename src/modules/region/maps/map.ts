'use strict';

import MapFeature from "./feature";

export default class RegionMap {
  elevation: number[][];
  humidity: number[][];
  temperature: number[][];
  features: MapFeature[];
  width: number;
  height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.elevation = [];
    this.features = [];
    this.humidity = [];
    this.temperature = [];

    for (let y=0;y<this.width;y++) {
      this.elevation[y] = [];
      this.humidity[y] = [];
      this.temperature[y] = [];
    }
  }
}
