import type PrecipitationType from "../precipitationtype.js";

export default interface Season {
  name: string;
  precipitationType: PrecipitationType;
  precipitationAmount: number;
}
