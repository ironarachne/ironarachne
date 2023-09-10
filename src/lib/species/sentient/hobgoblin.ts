import * as AgeCategories from "$lib/age/age_categories.js";
import * as Sizes from "$lib/size/sizes.js";
import type Species from "../species.js";

export default <Species> {
  name: "hobgoblin",
  pluralName: "hobgoblins",
  adjective: "hobgoblin",
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
  creatureTypes: ["humanoid", "goblinoid"],
  physicalTraitGeneratorConfigs: [
    {
      name: "hair",
      category: "hair",
      options: ["black", "brown", "dark", "red", "russet"],
      tags: ["hair"],
    },
    {
      name: "skin",
      category: "skin",
      options: ["red", "dark grey", "grey", "russet", "bronze"],
      tags: ["skin"],
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["amber", "red", "brown", "dark", "yellow", "orange", "grey"],
      tags: ["eyes"],
    },
  ],
  ageCategories: AgeCategories.getHumanVariant(0.8),
  baseThreatLevel: 2,
  abilities: [
    {
      name: "darkvision",
      description: "can see in the dark",
      category: "senses",
      threatLevel: 1,
    },
  ],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } },
  ],
  sizeGeneratorConfigMatrix: Sizes.getHumanVariant(1.1, 1.15),
  tags: ["hobgoblin", "greenskin", "martial", "sentient"],
};
