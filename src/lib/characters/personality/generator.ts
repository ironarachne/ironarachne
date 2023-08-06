"use strict";

import * as RND from "@ironarachne/rng";
import PersonalityGeneratorConfig from "./generatorconfig.js";
import PersonalityTrait from "./personalitytrait.js";

import random from "random";

export default class PersonalityGenerator {
  config: PersonalityGeneratorConfig;

  constructor(config: PersonalityGeneratorConfig) {
    this.config = config;
  }

  generate(): PersonalityTrait[] {
    let traits = [];

    RND.shuffle(this.config.traits);

    for (let i = 0; i < this.config.numberOfPositiveTraits; i++) {
      let trait = this.config.traits.pop();
      if (trait === undefined) {
        throw new Error("Personality trait is undefined.");
      }
      trait.score = random.int(1, 50);
      trait.descriptor = trait.positiveDescriptor;
      traits.push(trait);
    }

    for (let i = 0; i < this.config.numberOfNegativeTraits; i++) {
      let trait = this.config.traits.pop();
      if (trait === undefined) {
        throw new Error("Personality trait is undefined.");
      }
      trait.score = random.int(-50, -1);
      trait.descriptor = trait.negativeDescriptor;
      traits.push(trait);
    }

    return traits;
  }
}
