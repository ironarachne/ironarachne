"use strict";

import PlanetClassification from "./classification.js";

export default class Planet {
  name: string;
  description: string;
  culture: string;
  government: string;
  population: number;
  populationFriendly: string;
  is_inhabited: boolean;
  classification: PlanetClassification;
  mass: number; // in 10^24 kg
  gravity: number; // in m/s^2
  diameter: number; // in km
  orbital_period: number; // in Earth days
  distance_from_sun: number; // in AU
  has_clouds: boolean;
  has_atmosphere: boolean;

  constructor() {
    this.name = "";
    this.description = "";
    this.classification = new PlanetClassification("", 0, 0, 0, 0, 0, 0, 0, 0, false, false, false);
    this.culture = "N/A";
    this.government = "N/A";
    this.population = 0;
    this.populationFriendly = "Uninhabited";
    this.is_inhabited = false;
    this.mass = 0;
    this.gravity = 0;
    this.diameter = 0;
    this.orbital_period = 0;
    this.distance_from_sun = 0;
    this.has_clouds = false;
    this.has_atmosphere = false;
  }
}
