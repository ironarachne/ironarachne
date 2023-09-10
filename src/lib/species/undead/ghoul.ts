import * as Sizes from "$lib/size/sizes.js";
import type Species from "../species.js";

export default <Species> {
  name: "ghoul",
  pluralName: "ghouls",
  adjective: "ghoul",
  breedType: "ghoul",
  environments: ["forest", "grassland", "hill", "mountain"],
  creatureTypes: ["undead"],
  physicalTraitGeneratorConfigs: [
    {
      name: "fangs",
      category: "fangs",
      options: ["hooked", "crooked", "large", "sharp"],
      tags: ["fangs"],
    },
    {
      name: "skin",
      category: "skin",
      options: ["pale", "pallid", "grey", "light grey"],
      tags: ["skin"],
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["brown", "red", "yellow", "grey"],
      tags: ["eyes"],
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
  baseThreatLevel: 4,
  abilities: [],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } },
  ],
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ["ghoul", "undead"],
};
