import * as PrecipitationTypes from "../precipitationtypes.js";

export default {
  name: "tropical",
  description: "",
  cloudCover: 8,
  windStrength: 3,
  windDirection: 4,
  temperatureMin: 7,
  temperatureMax: 10,
  precipitationAmount: 10,
  precipitationFrequency: 8,
  seasons: [
    { name: "dry", precipitationType: PrecipitationTypes.byName("rain"), precipitationAmount: 5 },
    { name: "wet", precipitationType: PrecipitationTypes.byName("rain"), precipitationAmount: 9 },
  ],
};
