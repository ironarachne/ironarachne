import * as AgeCategories from "$lib/age/age_categories.js";
import * as Sizes from "$lib/size/sizes.js";
import type Species from "../species.js";

const wingLengths = ["short", "long"];
const wingTypes = ["black-tipped", "sleek", "knife-edged", "graceful", "full"];
let wingAppearances = [];
for (let j = 0; j < wingTypes.length; j++) {
  for (let i = 0; i < wingLengths.length; i++) {
    wingAppearances.push(`${wingLengths[i]} and ${wingTypes[j]}`);
  }
  wingAppearances.push(wingTypes[j]);
}

export default <Species> {
  name: "aarakocra",
  pluralName: "aarakocra",
  adjective: "aarakocra",
  breedType: "aarakocra",
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
  creatureTypes: ["humanoid"],
  physicalTraitGeneratorConfigs: [
    {
      name: "feathers",
      category: "feathers",
      options: ["white", "mottled", "brown", "russet", "black", "grey", "red", "orange"],
      tags: ["feathers"],
    },
    {
      name: "wings",
      category: "wings",
      options: wingAppearances,
      tags: ["wings"],
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["yellow", "red", "white", "silver", "gold", "blue", "green"],
      tags: ["eyes"],
    },
  ],
  ageCategories: AgeCategories.getHumanVariant(1.2),
  baseThreatLevel: 1,
  abilities: [
    {
      name: "flight",
      description: "can fly",
      category: "movement",
      threatLevel: 1,
    },
  ],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } },
  ],
  sizeGeneratorConfigMatrix: Sizes.getHumanVariant(0.7, 0.95),
  tags: ["corruptible", "aarakocra", "flying", "martial", "magic", "sentient"],
};
