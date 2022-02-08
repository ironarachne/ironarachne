'use strict';

import MapFeature from "./feature";

export default class RegionMapGeneratorConfig {
  width: number;
  height: number;
  tileSize: number;
  features: MapFeature[];
  elevationTransform: (number) => number;
  temperatureTransform: (number) => number;
  humidityTransform: (number) => number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.tileSize = 10;
    this.features = [];
    this.elevationTransform = (elevation: number) => { return elevation; };
    this.temperatureTransform = (temp: number) => { return temp; };
    this.humidityTransform = (humidity: number) => { return humidity; };
  }
}
