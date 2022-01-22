"use strict";

import Biome from "./biome";

export default class ConiferousForest implements Biome {
  name: string;
  temperature: number;
  altitude: number;
  humidity: number;
  isAquatic: boolean;
  descriptions: string[];
  features: string[];

  constructor() {
    this.name = "coniferous forest";
    this.temperature = 4;
    this.altitude = 3;
    this.humidity = 5;
    this.isAquatic = false;
    this.descriptions = [
      "This is an old forest region. Some of the trees here are bigger around than ten men linking arms could wrap around.",
      "Coniferous trees cover this area. Thick canopies give way to the occasional meadow.",
      "This forest is filled with conifers and light underbrush.",
    ];
    this.features = [
      "The pine trees here grow tall.",
      "Vast areas of forest are broken occasionally by short, rocky cliffs.",
      "Dense areas of forest nearby hide rare animals.",
      "The occasional logging camp can be found on the outskirts of the forest here.",
      "Pine and spruce trees grow in multitudes here.",
      "The forest here is home to many beasts and other creatures.",
    ];
  }
}
