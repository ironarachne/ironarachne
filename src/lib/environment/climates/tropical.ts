"use strict";

import * as PrecipitationTypes from "../precipitationtypes.js";
import Season from "../seasons/season.js";
import type Climate from "./climate.js";

export default class TropicalClimate implements Climate {
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
    this.name = "tropical";
    this.cloudCover = 8;
    this.windStrength = 3;
    this.windDirection = 4;
    this.temperatureMin = 7;
    this.temperatureMax = 10;
    this.precipitationAmount = 10;
    this.precipitationFrequency = 8;
    this.seasons = [
      new Season("dry", PrecipitationTypes.byName("rain"), 5),
      new Season("wet", PrecipitationTypes.byName("rain"), 9),
    ];
  }
}
