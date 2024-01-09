import type PlanetClassification from "./classification.js";
import * as Classifications from "./classifications.js";

export default class PlanetGeneratorConfig {
  inhabitedChance: number;
  possibleClassifications: PlanetClassification[];
  starportChance: number;

  constructor() {
    this.possibleClassifications = Classifications.all();
    this.starportChance = 85;
    this.inhabitedChance = 60;
  }
}
