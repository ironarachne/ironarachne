'use strict';

import Climate from './climate';

import * as PrecipitationTypes from '../precipitationtypes';
import Season from '../seasons/season';

export default class ContinentalClimate implements Climate {
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
    this.name = 'continental';
    this.cloudCover = 5;
    this.windStrength = 3;
    this.windDirection = 4;
    this.temperatureMax = 9;
    this.temperatureMin = 2;
    this.precipitationAmount = 5;
    this.precipitationFrequency = 5;
    this.seasons = [
      new Season('spring', PrecipitationTypes.byName('rain'), 6),
      new Season('summer', PrecipitationTypes.byName('rain'), 4),
      new Season('autumn', PrecipitationTypes.byName('rain'), 4),
      new Season('winter', PrecipitationTypes.byName('snow'), 4),
    ];
  }
}
