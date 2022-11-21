'use strict';

import type Climate from './climate';

import * as PrecipitationTypes from '../precipitationtypes';
import Season from '../seasons/season';

export default class TemperateClimate implements Climate {
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
    this.name = 'temperate';
    this.cloudCover = 5;
    this.windStrength = 3;
    this.windDirection = 4;
    this.temperatureMin = 3;
    this.temperatureMax = 7;
    this.precipitationAmount = 5;
    this.precipitationFrequency = 5;
    this.seasons = [
      new Season('spring', PrecipitationTypes.byName('rain'), 5),
      new Season('summer', PrecipitationTypes.byName('rain'), 3),
      new Season('autumn', PrecipitationTypes.byName('rain'), 3),
      new Season('winter', PrecipitationTypes.byName('snow'), 5),
    ];
  }
}
