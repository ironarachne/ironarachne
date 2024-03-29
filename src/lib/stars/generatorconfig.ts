import type StarClassification from "./classification.js";
import * as Classifications from "./classifications.js";

export default class StarGeneratorConfig {
  possibleClassifications: StarClassification[];

  constructor() {
    this.possibleClassifications = Classifications.all();
  }
}
