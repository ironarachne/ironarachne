"use strict";

import PrecipitationType from "../precipitationtype";

export default class Season {
  name: string;
  precipitationType: PrecipitationType;
  precipitationAmount: number;

  constructor(name: string, precipitationType: PrecipitationType, precipitationAmount: number) {
    this.name = name;
    this.precipitationType = precipitationType;
    this.precipitationAmount = precipitationAmount;
  }
}
