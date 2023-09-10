import * as PrecipitationTypes from "../precipitationtypes.js";

export default {
  name: "dry",
  description: "",
  cloudCover: 1,
  windStrength: 6,
  windDirection: 4,
  temperatureMin: 6,
  temperatureMax: 10,
  precipitationAmount: 1,
  precipitationFrequency: 1,
  seasons: [
    { name: "dry", precipitationType: PrecipitationTypes.byName("rain"), precipitationAmount: 0 },
    { name: "wet", precipitationType: PrecipitationTypes.byName("rain"), precipitationAmount: 3 },
  ],
};
