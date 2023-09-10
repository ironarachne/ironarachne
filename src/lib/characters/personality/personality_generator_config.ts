import type PersonalityTrait from "./personality_trait";

export default interface PersonalityGeneratorConfig {
  numberOfPositiveTraits: number;
  numberOfNegativeTraits: number;
  traits: PersonalityTrait[];
}
