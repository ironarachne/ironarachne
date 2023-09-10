import * as RND from "@ironarachne/rng";
import random from "random";
import type PersonalityGeneratorConfig from "./personality_generator_config";
import type PersonalityTrait from "./personality_trait";

export function generate(config: PersonalityGeneratorConfig): PersonalityTrait[] {
  let traits = [];

  RND.shuffle(config.traits);

  for (let i = 0; i < config.numberOfPositiveTraits; i++) {
    let trait = config.traits.pop();
    if (trait === undefined) {
      throw new Error("Personality trait is undefined.");
    }
    trait.score = random.int(1, 50);
    trait.descriptor = trait.positiveDescriptor;
    traits.push(trait);
  }

  for (let i = 0; i < config.numberOfNegativeTraits; i++) {
    let trait = config.traits.pop();
    if (trait === undefined) {
      throw new Error("Personality trait is undefined.");
    }
    trait.score = random.int(-50, -1);
    trait.descriptor = trait.negativeDescriptor;
    traits.push(trait);
  }

  return traits;
}
