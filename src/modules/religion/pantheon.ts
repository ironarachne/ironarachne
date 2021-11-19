"use strict";

import Deity from "./deity";
import PantheonClassification from "./pantheonclassification";

export default class Pantheon {
  name: string;
  description: string;
  deities: Deity[];
  classification: PantheonClassification;

  constructor(name: string, description: string, classification: PantheonClassification) {
    this.name = name;
    this.description = description;
    this.deities = [];
    this.classification = classification;
  }
}
