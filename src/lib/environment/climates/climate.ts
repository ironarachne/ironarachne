import type Season from "./season";

export default interface Climate {
  name: string;
  description: string;
  cloudCover: number; // 0-1, 0 being no clouds, 1 being completely overcast
  wind: number[]; // the wind direction and strength as a 3D vector; [0, 0, 0] is no wind
  temperature: number; // the average temperature in celsius
  temperatureMin: number; // the base temperature at night in celsius
  temperatureMax: number; // the base temperature at midday in celsius
  precipitationAmount: number; // 0-1, 0 being no precipitation, 1 being the maximum possible precipitation
  precipitationFrequency: number; // 0-1, 0 being no precipitation, 1 being constant precipitation
  humidity: number; // 0-1, 0 being no humidity, 1 being maximum humidity
  seasons: Season[];
}
