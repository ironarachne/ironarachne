import * as AgeCategories from "$lib/age/age_categories.js";
import * as Sizes from "$lib/size/sizes.js";
import type Species from "../species.js";

export default <Species> {
  name: "centaur",
  pluralName: "centaurs",
  adjective: "centaur",
  breedType: "centaur",
  environments: [
    "arctic",
    "coastal",
    "desert",
    "forest",
    "grassland",
    "hill",
    "mountain",
    "urban",
  ],
  creatureTypes: ["fey", "tauroid"],
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
      options: ["bronzed", "light", "pale", "tan", "white"],
      tags: ["skin"],
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["amber", "blue", "brown", "dark", "green"],
      tags: ["eyes"],
    },
    {
      name: "horse-hide",
      category: "horse-hide",
      options: ["black", "brown", "dark", "light", "white"],
      tags: ["horse-hide"],
    },
    {
      name: "hooves",
      category: "hooves",
      options: ["heavy", "small", "sharp", "black", "white", "hairy"],
      tags: ["hooves"],
    },
  ],
  ageCategories: AgeCategories.getHumanVariant(1.85),
  baseThreatLevel: 2,
  abilities: [],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } },
  ],
  sizeGeneratorConfigMatrix: Sizes.getHumanVariant(1.45, 1.25),
  tags: ["centaur", "human", "martial", "magic", "sentient"],
};
