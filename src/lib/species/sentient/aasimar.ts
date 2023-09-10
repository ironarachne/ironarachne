import * as AgeCategories from "$lib/age/age_categories.js";
import * as Sizes from "$lib/size/sizes.js";
import type Species from "../species.js";

export default <Species> {
  name: "aasimar",
  pluralName: "aasimar",
  adjective: "aasimar",
  breedType: "human",
  environments: [
    "arctic",
    "coastal",
    "desert",
    "forest",
    "grassland",
    "hill",
    "mountain",
    "urban",
    "underdark",
  ],
  creatureTypes: ["humanoid"],
  physicalTraitGeneratorConfigs: [
    {
      name: "hair",
      category: "hair",
      options: ["black", "blonde", "brown", "dark", "light", "red", "russet", "white"],
      tags: ["hair"],
    },
    {
      name: "skin",
      category: "skin",
      options: ["bronzed", "light", "pale", "tan", "white", "black", "brown"],
      tags: ["skin"],
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["amber", "blue", "brown", "dark", "green", "gold", "silver"],
      tags: ["eyes"],
    },
  ],
  ageCategories: AgeCategories.getHumanVariant(1.6),
  baseThreatLevel: 1,
  abilities: [
    {
      name: "healing touch",
      description: "can heal with a touch",
      category: "spell",
      threatLevel: 1,
    },
    {
      name: "summon light",
      description: "can summon light",
      category: "spell",
      threatLevel: 1,
    },
  ],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } },
  ],
  sizeGeneratorConfigMatrix: Sizes.getHumanVariant(0.9, 0.95),
  tags: ["aasimar", "celestial", "human", "martial", "magic", "sentient"],
};
