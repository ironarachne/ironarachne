'use strict';

import Season from '../seasons/season';

export default interface Climate {
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
}
