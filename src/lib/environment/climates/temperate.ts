import * as PrecipitationTypes from "../precipitationtypes.js";

export default {
  name: "temperate",
  description: "",
  cloudCover: 5,
  windStrength: 3,
  windDirection: 4,
  temperatureMin: 3,
  temperatureMax: 7,
  precipitationAmount: 5,
  precipitationFrequency: 5,
  seasons: [
    { name: "spring", precipitationType: PrecipitationTypes.byName("rain"), precipitationAmount: 5 },
    { name: "summer", precipitationType: PrecipitationTypes.byName("rain"), precipitationAmount: 3 },
    { name: "autumn", precipitationType: PrecipitationTypes.byName("rain"), precipitationAmount: 3 },
    { name: "winter", precipitationType: PrecipitationTypes.byName("snow"), precipitationAmount: 5 },
  ],
};
