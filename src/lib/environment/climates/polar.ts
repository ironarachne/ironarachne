import * as PrecipitationTypes from "../precipitationtypes.js";

export default {
  name: "polar",
  description: "",
  cloudCover: 3,
  windStrength: 3,
  windDirection: 6,
  temperatureMin: 1,
  temperatureMax: 3,
  precipitationAmount: 8,
  precipitationFrequency: 4,
  seasons: [
    { name: "wet", precipitationType: PrecipitationTypes.byName("snow"), precipitationAmount: 3 },
    { name: "dry", precipitationType: PrecipitationTypes.byName("snow"), precipitationAmount: 0 },
  ],
};
