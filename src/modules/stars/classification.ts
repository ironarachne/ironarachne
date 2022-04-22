'use strict';

export default class StarClassification {
  name: string;
  radius_min: number; // relative to the sun
  radius_max: number; // relative to the sun
  mass_min: number; // relative to the sun
  mass_max: number; // relative to the sun
  temperature_min: number; // in K
  temperature_max: number; // in K
  luminosity_min: number; // relative to the sun
  luminosity_max: number; // relative to the sun
  commonality: number; // commonality in the universe

  constructor(
    name: string,
    radius_min: number,
    radius_max: number,
    mass_min: number,
    mass_max: number,
    temperature_min: number,
    temperature_max: number,
    luminosity_min: number,
    luminosity_max: number,
    commonality: number,
  ) {
    this.name = name;
    this.radius_min = radius_min;
    this.radius_max = radius_max;
    this.mass_min = mass_min;
    this.mass_max = mass_max;
    this.temperature_min = temperature_min;
    this.temperature_max = temperature_max;
    this.luminosity_min = luminosity_min;
    this.luminosity_max = luminosity_max;
    this.commonality = commonality;
  }
}
