import * as Sizes from "$lib/size/sizes.js";
import type Species from "../species.js";

export default <Species> {
  name: "cat",
  pluralName: "cats",
  adjective: "cat",
  breedType: "cat",
  environments: ["desert", "forest", "mountain"],
  creatureTypes: ["beast"],
  physicalTraitGeneratorConfigs: [
    {
      name: "fur",
      category: "fur",
      options: [
        "black",
        "brown",
        "tan",
        "grey",
        "white",
        "calico",
        "tortoiseshell",
        "ginger",
        "mottled",
        "striped",
        "spotted",
      ],
      tags: ["fur"],
    },
    {
      name: "skin",
      category: "skin",
      options: ["brown", "pink", "light", "tan"],
      tags: ["skin"],
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["amber", "brown", "dark", "green", "blue"],
      tags: ["eyes"],
    },
  ],
  ageCategories: [
    { name: "kitten", noun: "kitten", minAge: 0, maxAge: 1, genderedNoun: ["girl", "boy", "kitten"], commonality: 2 },
    { name: "adult", noun: "adult", minAge: 2, maxAge: 10, genderedNoun: ["woman", "man", "adult"], commonality: 20 },
    {
      name: "elderly",
      noun: "elder",
      minAge: 11,
      maxAge: 30,
      genderedNoun: ["old woman", "old man", "elder"],
      commonality: 3,
    },
  ],
  baseThreatLevel: 0,
  abilities: [],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } },
  ],
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ["cat"],
};
