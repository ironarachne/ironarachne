import * as AgeCategories from "$lib/age/age_categories.js";
import * as Sizes from "$lib/size/sizes.js";
import type Species from "../species.js";

export default <Species> {
  name: "firbolg",
  pluralName: "firbolgs",
  adjective: "firbolg",
  breedType: "giant",
  environments: ["forest", "grassland", "hill", "mountain"],
  creatureTypes: ["humanoid", "giant"],
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
  ],
  ageCategories: AgeCategories.getHumanVariant(5),
  baseThreatLevel: 2,
  abilities: [
    {
      name: "minor invisibility",
      description: "can turn invisible when not attacking",
      category: "invisibility",
      threatLevel: 2,
    },
  ],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } },
  ],
  sizeGeneratorConfigMatrix: Sizes.getHumanVariant(1.9, 1.8),
  tags: ["firbolg", "giant", "human", "martial", "magic", "sentient"],
};
