'use strict';

import PlanetClassification from "./classification";
import * as Classifications from "./classifications";

export default class PlanetGeneratorConfig {
  possibleClassifications: PlanetClassification[];

  constructor() {
    this.possibleClassifications = Classifications.all();
  }
}
