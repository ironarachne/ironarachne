import type Season from "../seasons/season.js";

export default interface Climate {
  name: string;
  description: string;
  cloudCover: number; // 0-1, 0 being no clouds, 1 being completely overcast
  windStrength: number; // 0-1, 0 being no wind, 1 being very strong wind
  windDirection: number; // 0-360, 0 being north, 90 being east, 180 being south, 270 being west
  temperatureMin: number; // the base temperature at night in celsius
  temperatureMax: number; // the base temperature at midday in celsius
  precipitationAmount: number; // 0-1, 0 being no precipitation, 1 being the maximum possible precipitation
  precipitationFrequency: number; // 0-1, 0 being no precipitation, 1 being constant precipitation
  seasons: Season[];
}
