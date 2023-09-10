import * as Sizes from "$lib/size/sizes.js";
import type Species from "../species.js";

export default <Species> {
  name: "shadow",
  pluralName: "shadows",
  adjective: "shadow",
  breedType: "shadow",
  environments: ["forest", "grassland", "hill", "mountain", "swamp", "urban"],
  creatureTypes: ["undead"],
  physicalTraitGeneratorConfigs: [
    {
      name: "body",
      category: "body",
      options: ["black", "wispy", "ethereal", "dark"],
      tags: ["body"],
    },
  ],
  ageCategories: [
    {
      name: "infant",
      noun: "baby",
      minAge: 0,
      maxAge: 1,
      genderedNoun: ["baby girl", "baby boy", "baby"],
      commonality: 1,
    },
    { name: "child", noun: "child", minAge: 2, maxAge: 4, genderedNoun: ["girl", "boy", "child"], commonality: 2 },
    { name: "adult", noun: "adult", minAge: 5, maxAge: 30, genderedNoun: ["woman", "man", "adult"], commonality: 20 },
    {
      name: "elderly",
      noun: "elder",
      minAge: 31,
      maxAge: 45,
      genderedNoun: ["old woman", "old man", "elder"],
      commonality: 1,
    },
  ],
  abilities: [
    {
      name: "amorphous",
      description: "can squeeze through small spaces",
      category: "movement",
      threatLevel: 1,
    },
    {
      name: "immunity: necrotic magic",
      description: "immune to necrotic magic",
      category: "immunity",
      threatLevel: 1,
    },
    {
      name: "immunity: poison",
      description: "immune to poison",
      category: "immunity",
      threatLevel: 1,
    },
    {
      name: "darkvision",
      description: "can see in the dark",
      category: "senses",
      threatLevel: 1,
    },
    {
      name: "drain strength",
      description: "drains strength on melee attacks",
      category: "attack",
      threatLevel: 2,
    },
  ],
  baseThreatLevel: 4,
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } },
  ],
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ["shadow", "undead"],
};
