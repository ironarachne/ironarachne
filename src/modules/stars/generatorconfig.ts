'use strict';

import * as Classifications from "./classifications";
import StarClassification from "./classification";

export default class StarGeneratorConfig {
  possibleClassifications: StarClassification[];

  constructor() {
    this.possibleClassifications = Classifications.all();
  }
}
