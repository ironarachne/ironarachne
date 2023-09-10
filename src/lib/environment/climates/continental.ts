import * as PrecipitationTypes from "../precipitationtypes.js";

export default {
  name: "continental",
  description: "",
  cloudCover: 5,
  windStrength: 3,
  windDirection: 4,
  temperatureMin: 2,
  temperatureMax: 9,
  precipitationAmount: 5,
  precipitationFrequency: 5,
  seasons: [
    { name: "spring", precipitationType: PrecipitationTypes.byName("rain"), precipitationAmount: 6 },
    { name: "summer", precipitationType: PrecipitationTypes.byName("rain"), precipitationAmount: 4 },
    { name: "autumn", precipitationType: PrecipitationTypes.byName("rain"), precipitationAmount: 4 },
    { name: "winter", precipitationType: PrecipitationTypes.byName("snow"), precipitationAmount: 4 },
  ],
};
