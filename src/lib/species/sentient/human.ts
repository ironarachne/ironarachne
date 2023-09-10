import * as AgeCategories from "$lib/age/age_categories.js";
import * as Sizes from "$lib/size/sizes.js";
import type Species from "../species.js";

export default <Species> {
  name: "human",
  pluralName: "humans",
  adjective: "human",
  breedType: "human",
  environments: ["arctic", "coastal", "desert", "forest", "grassland", "hill", "mountain", "urban", "underdark"],
  creatureTypes: ["humanoid"],
  physicalTraitGeneratorConfigs: [
    {
      name: "hair",
      category: "hair",
      options: ["black", "blonde", "brown", "dark", "light", "red", "russet"],
      tags: ["hair"],
    },
    {
      name: "skin",
      category: "skin",
      options: ["black", "bronzed", "ebony", "light", "pale", "tan", "white"],
      tags: ["skin"],
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["amber", "blue", "brown", "dark", "green"],
      tags: ["eyes"],
    },
  ],
  ageCategories: AgeCategories.humanStandard(),
  baseThreatLevel: 1,
  abilities: [],
  commonality: 200,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } },
  ],
  sizeGeneratorConfigMatrix: Sizes.humanStandard(),
  tags: ["corruptible", "human", "martial", "magic", "sentient"],
};
