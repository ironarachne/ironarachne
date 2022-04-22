'use strict';

import PlanetClassification from "./classification";

export default class Planet {
  name: string;
  description: string;
  culture: string;
  government: string;
  population: string;
  is_inhabited: boolean;
  classification: PlanetClassification;
  mass: number; // in 10^24 kg
  gravity: number; // in m/s^2
  diameter: number; // in km
  orbital_period: number; // in Earth days
  distance_from_sun: number; // in AU
  has_clouds: boolean;
  has_atmosphere: boolean;
  svg: string;

  constructor() {
    this.name = '';
    this.description = '';
    this.culture = 'N/A';
    this.government = 'N/A';
    this.population = 'Uninhabited';
    this.is_inhabited = false;
    this.mass = 0;
    this.gravity = 0;
    this.diameter = 0;
    this.orbital_period = 0;
    this.distance_from_sun = 0;
    this.has_clouds = false;
    this.has_atmosphere = false;
    this.svg = '';
  }
}
