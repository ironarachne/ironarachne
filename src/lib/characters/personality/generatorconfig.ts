"use strict";

import * as PossibleTraits from "./alltraits.js";
import PersonalityTrait from "./personalitytrait.js";

export default class PersonalityGeneratorConfig {
  numberOfPositiveTraits: number;
  numberOfNegativeTraits: number;
  traits: PersonalityTrait[];

  constructor() {
    this.numberOfNegativeTraits = 1;
    this.numberOfPositiveTraits = 2;
    this.traits = PossibleTraits.all();
  }
}
