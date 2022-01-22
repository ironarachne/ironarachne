"use strict";

import Biome from "./biome";

export default class Desert implements Biome {
  name: string;
  temperature: number;
  altitude: number;
  humidity: number;
  isAquatic: boolean;
  descriptions: string[];
  features: string[];

  constructor() {
    this.name = "desert";
    this.temperature = 10;
    this.altitude = 1;
    this.humidity = 1;
    this.isAquatic = false;
    this.descriptions = [
      "The sun blasts this desert region.",
      "This area is a vast, hot desert.",
      "This desert is made up of rocky cliffs, dry riverbeds, and sand dunes.",
    ];
    this.features = [
      "A large oasis is the focus of this area.",
      "The sand dunes here resemble vast rolling seas.",
      "Rocky outcroppings give some blessed relief from the desert sun.",
      "Pillars of rock jut out of the sand in places here.",
      "The hot wind is constantly stirring up the dunes.",
    ];
  }
}
