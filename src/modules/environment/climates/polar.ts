"use strict";

import Climate from "./climate";

import * as PrecipitationTypes from "../precipitationtypes";
import Season from "../seasons/season";

export default class PolarClimate implements Climate {
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
    this.name = "polar";
    this.cloudCover = 3;
    this.windStrength = 3;
    this.windDirection = 6;
    this.temperatureMin = 1;
    this.temperatureMax = 3;
    this.precipitationAmount = 8;
    this.precipitationFrequency = 4;
    this.seasons = [
      new Season(
        "wet", PrecipitationTypes.byName("snow"), 3
      ),
      new Season(
        "dry", PrecipitationTypes.byName("snow"), 0
      ),
    ];
  }
}
