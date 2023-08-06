"use strict";

import * as PrecipitationTypes from "../precipitationtypes.js";
import Season from "../seasons/season.js";
import type Climate from "./climate.js";

export default class DryClimate implements Climate {
  name: string;
  description: string;
  cloudCover: number;
  windStrength: number;
  windDirection: number;
  temperatureMin: number;
  temperatureMax: number;
  precipitationAmount: number;
  precipitationFrequency: number;
  seasons: Season[];

  constructor() {
    this.name = "dry";
    this.cloudCover = 1;
    this.windStrength = 6;
    this.windDirection = 4;
    this.temperatureMin = 6;
    this.temperatureMax = 10;
    this.precipitationAmount = 1;
    this.precipitationFrequency = 1;
    this.seasons = [
      new Season("dry", PrecipitationTypes.byName("rain"), 0),
      new Season("wet", PrecipitationTypes.byName("rain"), 3),
    ];
  }
}
