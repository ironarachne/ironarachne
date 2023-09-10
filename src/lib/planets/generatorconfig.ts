import PlanetClassification from "./classification.js";
import * as Classifications from "./classifications.js";

export default class PlanetGeneratorConfig {
  possibleClassifications: PlanetClassification[];

  constructor() {
    this.possibleClassifications = Classifications.all();
  }
}
