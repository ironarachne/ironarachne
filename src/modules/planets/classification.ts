'use strict';

export default class PlanetClassification {
  name: string;
  diameter_min: number; // in km
  diameter_max: number; // in km
  mass_min: number; // in 10^24 kg
  mass_max: number; // in 10^24 kg
  orbital_period_min: number; // in Earth days
  orbital_period_max: number; // in Earth days
  distance_from_sun_min: number; // in AU
  distance_from_sun_max: number; // in AU
  is_inhabitable: boolean;
  has_clouds: boolean;
  has_atmosphere: boolean;

  constructor(
    name: string,
    diameter_min: number,
    diameter_max: number,
    mass_min: number,
    mass_max: number,
    orbital_period_min: number,
    orbital_period_max: number,
    distance_from_sun_min: number,
    distance_from_sun_max: number,
    is_inhabitable: boolean,
    has_clouds: boolean,
    has_atmosphere: boolean,
  ) {
    this.name = name;
    this.diameter_min = diameter_min;
    this.diameter_max = diameter_max;
    this.mass_min = mass_min;
    this.mass_max = mass_max;
    this.orbital_period_min = orbital_period_min;
    this.orbital_period_max = orbital_period_max;
    this.distance_from_sun_min = distance_from_sun_min;
    this.distance_from_sun_max = distance_from_sun_max;
    this.is_inhabitable = is_inhabitable;
    this.has_clouds = has_clouds;
    this.has_atmosphere = has_atmosphere;
  }
}
