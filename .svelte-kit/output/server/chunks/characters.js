import { h as humanStandard, c as getHumanVariant, d as getHumanVariant$1, e as humanStandard$1, i as inchesToFeetExpression, f as cmToInches, k as kgToPounds, r as randomWeighted$1, g as getSizeConfig } from "./size_matrix.js";
import "./sentry-release-injection-file.js";
import * as RND from "@ironarachne/rng";
import * as MUN from "@ironarachne/made-up-names";
import * as Words from "@ironarachne/words";
import random from "random";
const blank = {
  name: "",
  abilities: [],
  tags: [],
  threatLevel: 0,
  itemGenerators: []
};
function byName(name, archetypes) {
  for (let i = 0; i < archetypes.length; i++) {
    if (archetypes[i].name == name) {
      return archetypes[i];
    }
  }
  throw new Error(`Failed to find archetype "${name}"`);
}
function generate$2(config) {
  let name = config.name;
  let category = config.category;
  let tags = config.tags;
  let description = RND.item(config.options) + " " + config.name;
  return {
    name,
    description,
    category,
    tags
  };
}
const ape = {
  name: "ape",
  pluralName: "apes",
  adjective: "ape",
  breedType: "ape",
  environments: ["forest", "mountain"],
  creatureTypes: ["beast"],
  physicalTraitGeneratorConfigs: [
    {
      name: "fur",
      category: "fur",
      options: ["silver", "brown", "grey", "olive"],
      tags: ["fur"]
    },
    {
      name: "skin",
      category: "skin",
      options: ["brown", "pink", "light", "tan"],
      tags: ["skin"]
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["amber", "brown", "dark", "green"],
      tags: ["eyes"]
    }
  ],
  ageCategories: [
    {
      name: "infant",
      noun: "baby",
      minAge: 0,
      maxAge: 1,
      genderedNoun: ["baby girl", "baby boy", "baby"],
      commonality: 1
    },
    { name: "child", noun: "child", minAge: 2, maxAge: 4, genderedNoun: ["girl", "boy", "child"], commonality: 2 },
    { name: "adult", noun: "adult", minAge: 5, maxAge: 30, genderedNoun: ["woman", "man", "adult"], commonality: 20 },
    {
      name: "elderly",
      noun: "elder",
      minAge: 31,
      maxAge: 45,
      genderedNoun: ["old woman", "old man", "elder"],
      commonality: 3
    }
  ],
  baseThreatLevel: 1,
  abilities: [],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: humanStandard(),
  // TODO: make real sizes
  tags: ["ape"]
};
const axe_beak = {
  name: "axe beak",
  pluralName: "axe beaks",
  adjective: "axe beak",
  breedType: "axe beak",
  environments: ["forest", "mountain"],
  creatureTypes: ["beast"],
  physicalTraitGeneratorConfigs: [
    {
      name: "feathers",
      category: "feathers",
      options: ["silver", "brown", "grey", "olive"],
      tags: ["feathers"]
    },
    {
      name: "beak",
      category: "beak",
      options: ["long", "hooked", "sharp", "crooked"],
      tags: ["beak"]
    },
    {
      name: "skin",
      category: "skin",
      options: ["brown", "pink", "light", "tan"],
      tags: ["skin"]
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["amber", "brown", "dark", "green"],
      tags: ["eyes"]
    }
  ],
  ageCategories: [
    {
      name: "hatchling",
      noun: "baby",
      minAge: 0,
      maxAge: 1,
      genderedNoun: ["baby girl", "baby boy", "baby"],
      commonality: 1
    },
    { name: "child", noun: "child", minAge: 2, maxAge: 4, genderedNoun: ["girl", "boy", "child"], commonality: 2 },
    { name: "adult", noun: "adult", minAge: 5, maxAge: 30, genderedNoun: ["woman", "man", "adult"], commonality: 20 },
    {
      name: "elderly",
      noun: "elder",
      minAge: 31,
      maxAge: 45,
      genderedNoun: ["old woman", "old man", "elder"],
      commonality: 3
    }
  ],
  baseThreatLevel: 1,
  abilities: [],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: humanStandard(),
  // TODO: make real sizes
  tags: ["axe beak"]
};
const baboon = {
  name: "baboon",
  pluralName: "baboons",
  adjective: "baboon",
  breedType: "baboon",
  environments: ["forest", "mountain"],
  creatureTypes: ["beast"],
  physicalTraitGeneratorConfigs: [
    {
      name: "fur",
      category: "fur",
      options: ["silver", "brown", "grey", "olive"],
      tags: ["fur"]
    },
    {
      name: "skin",
      category: "skin",
      options: ["brown", "pink", "light", "tan"],
      tags: ["skin"]
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["amber", "brown", "dark", "green"],
      tags: ["eyes"]
    }
  ],
  ageCategories: [
    {
      name: "infant",
      noun: "baby",
      minAge: 0,
      maxAge: 1,
      genderedNoun: ["baby girl", "baby boy", "baby"],
      commonality: 1
    },
    { name: "child", noun: "child", minAge: 2, maxAge: 4, genderedNoun: ["girl", "boy", "child"], commonality: 2 },
    { name: "adult", noun: "adult", minAge: 5, maxAge: 30, genderedNoun: ["woman", "man", "adult"], commonality: 20 },
    {
      name: "elderly",
      noun: "elder",
      minAge: 31,
      maxAge: 45,
      genderedNoun: ["old woman", "old man", "elder"],
      commonality: 3
    }
  ],
  baseThreatLevel: 0,
  abilities: [],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: humanStandard(),
  // TODO: make real sizes
  tags: ["ape", "baboon"]
};
const badger = {
  name: "badger",
  pluralName: "badgers",
  adjective: "badger",
  breedType: "badger",
  environments: ["forest", "mountain"],
  creatureTypes: ["beast"],
  physicalTraitGeneratorConfigs: [
    {
      name: "fur",
      category: "fur",
      options: ["silver", "brown", "grey", "olive", "black"],
      tags: ["fur"]
    },
    {
      name: "skin",
      category: "skin",
      options: ["brown", "pink", "light", "tan"],
      tags: ["skin"]
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["amber", "brown", "dark", "green"],
      tags: ["eyes"]
    }
  ],
  ageCategories: [
    {
      name: "infant",
      noun: "baby",
      minAge: 0,
      maxAge: 1,
      genderedNoun: ["baby girl", "baby boy", "baby"],
      commonality: 1
    },
    { name: "child", noun: "child", minAge: 2, maxAge: 4, genderedNoun: ["girl", "boy", "child"], commonality: 2 },
    { name: "adult", noun: "adult", minAge: 5, maxAge: 30, genderedNoun: ["woman", "man", "adult"], commonality: 20 },
    {
      name: "elderly",
      noun: "elder",
      minAge: 31,
      maxAge: 45,
      genderedNoun: ["old woman", "old man", "elder"],
      commonality: 3
    }
  ],
  baseThreatLevel: 1,
  abilities: [],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: humanStandard(),
  // TODO: make real sizes
  tags: ["badger"]
};
const bat = {
  name: "bat",
  pluralName: "bats",
  adjective: "bat",
  breedType: "bat",
  environments: ["forest", "mountain", "underdark"],
  creatureTypes: ["beast"],
  physicalTraitGeneratorConfigs: [
    {
      name: "fur",
      category: "fur",
      options: ["silver", "brown", "grey", "olive"],
      tags: ["fur"]
    },
    {
      name: "skin",
      category: "skin",
      options: ["brown", "pink", "light", "tan"],
      tags: ["skin"]
    },
    {
      name: "wings",
      category: "wings",
      options: ["big", "wide", "black", "brown", "tan"],
      tags: ["wings"]
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["amber", "brown", "dark", "green"],
      tags: ["eyes"]
    }
  ],
  ageCategories: [
    {
      name: "infant",
      noun: "baby",
      minAge: 0,
      maxAge: 1,
      genderedNoun: ["baby girl", "baby boy", "baby"],
      commonality: 1
    },
    { name: "child", noun: "child", minAge: 2, maxAge: 4, genderedNoun: ["girl", "boy", "child"], commonality: 2 },
    { name: "adult", noun: "adult", minAge: 5, maxAge: 30, genderedNoun: ["woman", "man", "adult"], commonality: 20 },
    {
      name: "elderly",
      noun: "elder",
      minAge: 31,
      maxAge: 45,
      genderedNoun: ["old woman", "old man", "elder"],
      commonality: 3
    }
  ],
  baseThreatLevel: 0,
  abilities: [
    {
      name: "flight",
      description: "can fly",
      category: "movement",
      threatLevel: 1
    }
  ],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: humanStandard(),
  // TODO: make real sizes
  tags: ["bat"]
};
const bear = {
  name: "bear",
  pluralName: "bears",
  adjective: "bear",
  breedType: "bear",
  environments: ["forest", "mountain"],
  creatureTypes: ["beast"],
  physicalTraitGeneratorConfigs: [
    {
      name: "fur",
      category: "fur",
      options: ["silver", "brown", "grey", "olive", "white", "tan"],
      tags: ["fur"]
    },
    {
      name: "skin",
      category: "skin",
      options: ["brown", "pink", "light", "tan"],
      tags: ["skin"]
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["amber", "brown", "dark", "green"],
      tags: ["eyes"]
    }
  ],
  ageCategories: [
    {
      name: "infant",
      noun: "baby",
      minAge: 0,
      maxAge: 1,
      genderedNoun: ["baby girl", "baby boy", "baby"],
      commonality: 1
    },
    { name: "child", noun: "child", minAge: 2, maxAge: 4, genderedNoun: ["girl", "boy", "child"], commonality: 2 },
    { name: "adult", noun: "adult", minAge: 5, maxAge: 30, genderedNoun: ["woman", "man", "adult"], commonality: 20 },
    {
      name: "elderly",
      noun: "elder",
      minAge: 31,
      maxAge: 45,
      genderedNoun: ["old woman", "old man", "elder"],
      commonality: 3
    }
  ],
  baseThreatLevel: 2,
  abilities: [],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: humanStandard(),
  // TODO: make real sizes
  tags: ["bear"]
};
const blink_dog = {
  name: "blink dog",
  pluralName: "blink dogs",
  adjective: "blink dog",
  breedType: "blink dog",
  environments: ["forest", "mountain", "underdark"],
  creatureTypes: ["beast"],
  physicalTraitGeneratorConfigs: [
    {
      name: "fur",
      category: "fur",
      options: ["black", "brown", "grey", "blue"],
      tags: ["fur"]
    },
    {
      name: "skin",
      category: "skin",
      options: ["brown", "pink", "light", "tan"],
      tags: ["skin"]
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["amber", "brown", "dark", "green"],
      tags: ["eyes"]
    }
  ],
  ageCategories: [
    {
      name: "infant",
      noun: "baby",
      minAge: 0,
      maxAge: 1,
      genderedNoun: ["baby girl", "baby boy", "baby"],
      commonality: 1
    },
    { name: "child", noun: "child", minAge: 2, maxAge: 4, genderedNoun: ["girl", "boy", "child"], commonality: 2 },
    { name: "adult", noun: "adult", minAge: 5, maxAge: 30, genderedNoun: ["woman", "man", "adult"], commonality: 20 },
    {
      name: "elderly",
      noun: "elder",
      minAge: 31,
      maxAge: 45,
      genderedNoun: ["old woman", "old man", "elder"],
      commonality: 3
    }
  ],
  baseThreatLevel: 1,
  abilities: [
    {
      name: "blink",
      description: "can teleport short distances",
      category: "movement",
      threatLevel: 2
    }
  ],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: humanStandard(),
  // TODO: make real sizes
  tags: ["blink dog"]
};
const boar = {
  name: "boar",
  pluralName: "boars",
  adjective: "boar",
  breedType: "boar",
  environments: ["forest", "mountain"],
  creatureTypes: ["beast"],
  physicalTraitGeneratorConfigs: [
    {
      name: "fur",
      category: "fur",
      options: ["black", "brown", "tan"],
      tags: ["fur"]
    },
    {
      name: "skin",
      category: "skin",
      options: ["brown", "pink", "light", "tan"],
      tags: ["skin"]
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["amber", "brown", "dark", "green"],
      tags: ["eyes"]
    }
  ],
  ageCategories: [
    {
      name: "infant",
      noun: "baby",
      minAge: 0,
      maxAge: 1,
      genderedNoun: ["baby girl", "baby boy", "baby"],
      commonality: 1
    },
    { name: "child", noun: "child", minAge: 2, maxAge: 4, genderedNoun: ["girl", "boy", "child"], commonality: 2 },
    { name: "adult", noun: "adult", minAge: 5, maxAge: 30, genderedNoun: ["woman", "man", "adult"], commonality: 20 },
    {
      name: "elderly",
      noun: "elder",
      minAge: 31,
      maxAge: 45,
      genderedNoun: ["old woman", "old man", "elder"],
      commonality: 3
    }
  ],
  baseThreatLevel: 1,
  abilities: [],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: humanStandard(),
  // TODO: make real sizes
  tags: ["boar"]
};
const camel = {
  name: "camel",
  pluralName: "camels",
  adjective: "camel",
  breedType: "camel",
  environments: ["desert"],
  creatureTypes: ["beast"],
  physicalTraitGeneratorConfigs: [
    {
      name: "fur",
      category: "fur",
      options: ["beige", "brown", "tan"],
      tags: ["fur"]
    },
    {
      name: "skin",
      category: "skin",
      options: ["brown", "light", "tan"],
      tags: ["skin"]
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["amber", "brown", "dark", "green"],
      tags: ["eyes"]
    }
  ],
  ageCategories: [
    {
      name: "infant",
      noun: "baby",
      minAge: 0,
      maxAge: 1,
      genderedNoun: ["baby girl", "baby boy", "baby"],
      commonality: 1
    },
    { name: "child", noun: "child", minAge: 2, maxAge: 4, genderedNoun: ["girl", "boy", "child"], commonality: 2 },
    { name: "adult", noun: "adult", minAge: 5, maxAge: 30, genderedNoun: ["woman", "man", "adult"], commonality: 20 },
    {
      name: "elderly",
      noun: "elder",
      minAge: 31,
      maxAge: 45,
      genderedNoun: ["old woman", "old man", "elder"],
      commonality: 3
    }
  ],
  baseThreatLevel: 1,
  abilities: [],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: humanStandard(),
  // TODO: make real sizes
  tags: ["camel"]
};
const cat = {
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
        "spotted"
      ],
      tags: ["fur"]
    },
    {
      name: "skin",
      category: "skin",
      options: ["brown", "pink", "light", "tan"],
      tags: ["skin"]
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["amber", "brown", "dark", "green", "blue"],
      tags: ["eyes"]
    }
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
      commonality: 3
    }
  ],
  baseThreatLevel: 0,
  abilities: [],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: humanStandard(),
  // TODO: make real sizes
  tags: ["cat"]
};
const cow = {
  name: "cow",
  pluralName: "cows",
  adjective: "cow",
  breedType: "cow",
  environments: ["forest", "grassland", "mountain"],
  creatureTypes: ["beast"],
  physicalTraitGeneratorConfigs: [
    {
      name: "fur",
      category: "fur",
      options: ["black", "brown", "tan", "dappled", "white and black", "white", "grey"],
      tags: ["fur"]
    },
    {
      name: "horns",
      category: "horns",
      options: ["long", "short", "curved"],
      tags: ["horns"]
    },
    {
      name: "hair",
      category: "hair",
      options: ["black", "white", "brown"],
      tags: ["hair"]
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["amber", "brown", "dark", "green", "blue"],
      tags: ["eyes"]
    }
  ],
  ageCategories: [
    {
      name: "infant",
      noun: "baby",
      minAge: 0,
      maxAge: 1,
      genderedNoun: ["baby girl", "baby boy", "baby"],
      commonality: 1
    },
    { name: "child", noun: "child", minAge: 2, maxAge: 4, genderedNoun: ["girl", "boy", "child"], commonality: 2 },
    { name: "adult", noun: "adult", minAge: 5, maxAge: 30, genderedNoun: ["woman", "man", "adult"], commonality: 20 },
    {
      name: "elderly",
      noun: "elder",
      minAge: 31,
      maxAge: 45,
      genderedNoun: ["old woman", "old man", "elder"],
      commonality: 3
    }
  ],
  baseThreatLevel: 1,
  abilities: [],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: humanStandard(),
  // TODO: make real sizes
  tags: ["cow"]
};
const crocodile = {
  name: "crocodile",
  pluralName: "crocodiles",
  adjective: "crocodile",
  breedType: "crocodile",
  environments: ["forest"],
  creatureTypes: ["beast"],
  physicalTraitGeneratorConfigs: [
    {
      name: "scales",
      category: "scales",
      options: ["black", "brown", "green"],
      tags: ["scales"]
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["amber", "brown", "dark", "green"],
      tags: ["eyes"]
    }
  ],
  ageCategories: [
    {
      name: "infant",
      noun: "baby",
      minAge: 0,
      maxAge: 1,
      genderedNoun: ["baby girl", "baby boy", "baby"],
      commonality: 1
    },
    { name: "child", noun: "child", minAge: 2, maxAge: 4, genderedNoun: ["girl", "boy", "child"], commonality: 2 },
    { name: "adult", noun: "adult", minAge: 5, maxAge: 30, genderedNoun: ["woman", "man", "adult"], commonality: 20 },
    {
      name: "elderly",
      noun: "elder",
      minAge: 31,
      maxAge: 45,
      genderedNoun: ["old woman", "old man", "elder"],
      commonality: 3
    }
  ],
  baseThreatLevel: 1,
  abilities: [],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: humanStandard(),
  // TODO: make real sizes
  tags: ["crocodile", "reptile"]
};
const dog = {
  name: "dog",
  pluralName: "dogs",
  adjective: "dog",
  breedType: "dog",
  environments: ["desert", "grassland", "mountain"],
  creatureTypes: ["beast"],
  physicalTraitGeneratorConfigs: [
    {
      name: "fur",
      category: "fur",
      options: ["black", "brown", "tan"],
      tags: ["fur"]
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["amber", "brown", "dark", "green", "blue"],
      tags: ["eyes"]
    }
  ],
  ageCategories: [
    {
      name: "infant",
      noun: "baby",
      minAge: 0,
      maxAge: 1,
      genderedNoun: ["baby girl", "baby boy", "baby"],
      commonality: 1
    },
    { name: "child", noun: "child", minAge: 2, maxAge: 4, genderedNoun: ["girl", "boy", "child"], commonality: 2 },
    { name: "adult", noun: "adult", minAge: 5, maxAge: 30, genderedNoun: ["woman", "man", "adult"], commonality: 20 },
    {
      name: "elderly",
      noun: "elder",
      minAge: 31,
      maxAge: 45,
      genderedNoun: ["old woman", "old man", "elder"],
      commonality: 3
    }
  ],
  baseThreatLevel: 0,
  abilities: [],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: humanStandard(),
  // TODO: make real sizes
  tags: ["dog"]
};
const eagle = {
  name: "eagle",
  pluralName: "eagles",
  adjective: "eagle",
  breedType: "eagle",
  environments: ["desert", "forest", "grassland", "mountain"],
  creatureTypes: ["beast"],
  physicalTraitGeneratorConfigs: [
    {
      name: "feathers",
      category: "feathers",
      options: ["black", "brown", "tan"],
      tags: ["feathers"]
    },
    {
      name: "beak",
      category: "beak",
      options: ["brown", "yellow", "light", "black"],
      tags: ["beak"]
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["amber", "brown", "dark", "green"],
      tags: ["eyes"]
    }
  ],
  ageCategories: [
    {
      name: "hatchling",
      noun: "baby",
      minAge: 0,
      maxAge: 1,
      genderedNoun: ["baby girl", "baby boy", "baby"],
      commonality: 1
    },
    { name: "adult", noun: "adult", minAge: 2, maxAge: 30, genderedNoun: ["woman", "man", "adult"], commonality: 20 },
    {
      name: "elderly",
      noun: "elder",
      minAge: 31,
      maxAge: 45,
      genderedNoun: ["old woman", "old man", "elder"],
      commonality: 3
    }
  ],
  baseThreatLevel: 0,
  abilities: [],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: humanStandard(),
  // TODO: make real sizes
  tags: ["eagle"]
};
const elk = {
  name: "elk",
  pluralName: "elks",
  adjective: "elk",
  breedType: "elk",
  environments: ["forest", "grassland", "mountain"],
  creatureTypes: ["beast"],
  physicalTraitGeneratorConfigs: [
    {
      name: "fur",
      category: "fur",
      options: ["black", "brown", "tan"],
      tags: ["fur"]
    },
    {
      name: "skin",
      category: "skin",
      options: ["brown", "pink", "light", "tan"],
      tags: ["skin"]
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["amber", "brown", "dark", "green"],
      tags: ["eyes"]
    }
  ],
  ageCategories: [
    {
      name: "infant",
      noun: "baby",
      minAge: 0,
      maxAge: 1,
      genderedNoun: ["baby girl", "baby boy", "baby"],
      commonality: 1
    },
    { name: "child", noun: "child", minAge: 2, maxAge: 4, genderedNoun: ["girl", "boy", "child"], commonality: 2 },
    { name: "adult", noun: "adult", minAge: 5, maxAge: 30, genderedNoun: ["woman", "man", "adult"], commonality: 20 },
    {
      name: "elderly",
      noun: "elder",
      minAge: 31,
      maxAge: 45,
      genderedNoun: ["old woman", "old man", "elder"],
      commonality: 3
    }
  ],
  baseThreatLevel: 2,
  abilities: [],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: humanStandard(),
  // TODO: make real sizes
  tags: ["elk"]
};
const goat = {
  name: "goat",
  pluralName: "goats",
  adjective: "goat",
  breedType: "goat",
  environments: ["forest", "mountain"],
  creatureTypes: ["beast"],
  physicalTraitGeneratorConfigs: [
    {
      name: "fur",
      category: "fur",
      options: ["black", "brown", "tan"],
      tags: ["fur"]
    },
    {
      name: "skin",
      category: "skin",
      options: ["brown", "pink", "light", "tan"],
      tags: ["skin"]
    },
    {
      name: "horns",
      category: "horns",
      options: ["long", "short", "stubby", "curved"],
      tags: ["horns"]
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["amber", "brown", "dark", "green"],
      tags: ["eyes"]
    }
  ],
  ageCategories: [
    {
      name: "infant",
      noun: "baby",
      minAge: 0,
      maxAge: 1,
      genderedNoun: ["baby girl", "baby boy", "baby"],
      commonality: 1
    },
    { name: "child", noun: "child", minAge: 2, maxAge: 4, genderedNoun: ["girl", "boy", "child"], commonality: 2 },
    { name: "adult", noun: "adult", minAge: 5, maxAge: 30, genderedNoun: ["woman", "man", "adult"], commonality: 20 },
    {
      name: "elderly",
      noun: "elder",
      minAge: 31,
      maxAge: 45,
      genderedNoun: ["old woman", "old man", "elder"],
      commonality: 3
    }
  ],
  baseThreatLevel: 0,
  abilities: [],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: humanStandard(),
  // TODO: make real sizes
  tags: ["goat"]
};
const horse = {
  name: "horse",
  pluralName: "horses",
  adjective: "horse",
  breedType: "horse",
  environments: ["forest", "grassland", "mountain"],
  creatureTypes: ["beast"],
  physicalTraitGeneratorConfigs: [
    {
      name: "fur",
      category: "fur",
      options: ["black", "brown", "tan", "dappled", "pinto", "white", "grey"],
      tags: ["fur"]
    },
    {
      name: "hair",
      category: "hair",
      options: ["black", "white", "brown"],
      tags: ["hair"]
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["amber", "brown", "dark", "green", "blue"],
      tags: ["eyes"]
    }
  ],
  ageCategories: [
    {
      name: "infant",
      noun: "baby",
      minAge: 0,
      maxAge: 1,
      genderedNoun: ["baby girl", "baby boy", "baby"],
      commonality: 1
    },
    { name: "child", noun: "child", minAge: 2, maxAge: 4, genderedNoun: ["girl", "boy", "child"], commonality: 2 },
    { name: "adult", noun: "adult", minAge: 5, maxAge: 30, genderedNoun: ["woman", "man", "adult"], commonality: 20 },
    {
      name: "elderly",
      noun: "elder",
      minAge: 31,
      maxAge: 45,
      genderedNoun: ["old woman", "old man", "elder"],
      commonality: 3
    }
  ],
  baseThreatLevel: 1,
  abilities: [],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: humanStandard(),
  // TODO: make real sizes
  tags: ["horse"]
};
const lion = {
  name: "lion",
  pluralName: "lions",
  adjective: "lion",
  breedType: "lion",
  environments: ["desert", "grassland", "mountain"],
  creatureTypes: ["beast"],
  physicalTraitGeneratorConfigs: [
    {
      name: "fur",
      category: "fur",
      options: ["black", "brown", "tan"],
      tags: ["fur"]
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["amber", "brown", "dark", "green", "blue"],
      tags: ["eyes"]
    }
  ],
  ageCategories: [
    {
      name: "infant",
      noun: "baby",
      minAge: 0,
      maxAge: 1,
      genderedNoun: ["baby girl", "baby boy", "baby"],
      commonality: 1
    },
    { name: "child", noun: "child", minAge: 2, maxAge: 4, genderedNoun: ["girl", "boy", "child"], commonality: 2 },
    { name: "adult", noun: "adult", minAge: 5, maxAge: 30, genderedNoun: ["woman", "man", "adult"], commonality: 20 },
    {
      name: "elderly",
      noun: "elder",
      minAge: 31,
      maxAge: 45,
      genderedNoun: ["old woman", "old man", "elder"],
      commonality: 3
    }
  ],
  baseThreatLevel: 2,
  abilities: [],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: humanStandard(),
  // TODO: make real sizes
  tags: ["lion"]
};
const rat = {
  name: "rat",
  pluralName: "rats",
  adjective: "rat",
  breedType: "rat",
  environments: ["desert", "forest", "grassland", "mountain"],
  creatureTypes: ["beast"],
  physicalTraitGeneratorConfigs: [
    {
      name: "fur",
      category: "fur",
      options: ["black", "brown", "tan", "grey"],
      tags: ["fur"]
    },
    {
      name: "skin",
      category: "skin",
      options: ["brown", "pink", "light", "tan"],
      tags: ["skin"]
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["amber", "brown", "dark", "green"],
      tags: ["eyes"]
    }
  ],
  ageCategories: [
    {
      name: "infant",
      noun: "baby",
      minAge: 0,
      maxAge: 1,
      genderedNoun: ["baby girl", "baby boy", "baby"],
      commonality: 1
    },
    { name: "child", noun: "child", minAge: 2, maxAge: 4, genderedNoun: ["girl", "boy", "child"], commonality: 2 },
    { name: "adult", noun: "adult", minAge: 5, maxAge: 30, genderedNoun: ["woman", "man", "adult"], commonality: 20 },
    {
      name: "elderly",
      noun: "elder",
      minAge: 31,
      maxAge: 45,
      genderedNoun: ["old woman", "old man", "elder"],
      commonality: 3
    }
  ],
  baseThreatLevel: 0,
  abilities: [],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: humanStandard(),
  // TODO: make real sizes
  tags: ["rat"]
};
const snake = {
  name: "snake",
  pluralName: "snakes",
  adjective: "snake",
  breedType: "snake",
  environments: ["desert", "forest", "mountain"],
  creatureTypes: ["beast"],
  physicalTraitGeneratorConfigs: [
    {
      name: "scales",
      category: "scales",
      options: ["black", "brown", "tan", "striped", "diamond-patterned", "green", "grey", "white", "pale", "yellow"],
      tags: ["scales"]
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["amber", "brown", "dark", "green", "black", "white"],
      tags: ["eyes"]
    }
  ],
  ageCategories: [
    {
      name: "hatchling",
      noun: "baby",
      minAge: 0,
      maxAge: 1,
      genderedNoun: ["baby girl", "baby boy", "baby"],
      commonality: 1
    },
    { name: "adult", noun: "adult", minAge: 5, maxAge: 30, genderedNoun: ["woman", "man", "adult"], commonality: 20 },
    {
      name: "elderly",
      noun: "elder",
      minAge: 31,
      maxAge: 45,
      genderedNoun: ["old woman", "old man", "elder"],
      commonality: 3
    }
  ],
  baseThreatLevel: 0,
  abilities: [],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: humanStandard(),
  // TODO: make real sizes
  tags: ["snake"]
};
const wolf = {
  name: "wolf",
  pluralName: "wolves",
  adjective: "wolf",
  breedType: "wolf",
  environments: ["desert", "grassland", "mountain"],
  creatureTypes: ["beast"],
  physicalTraitGeneratorConfigs: [
    {
      name: "fur",
      category: "fur",
      options: ["black", "brown", "tan", "white", "grey"],
      tags: ["fur"]
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["amber", "brown", "dark", "green", "blue"],
      tags: ["eyes"]
    }
  ],
  ageCategories: [
    {
      name: "puppy",
      noun: "baby",
      minAge: 0,
      maxAge: 1,
      genderedNoun: ["baby girl", "baby boy", "baby"],
      commonality: 1
    },
    { name: "child", noun: "child", minAge: 2, maxAge: 4, genderedNoun: ["girl", "boy", "child"], commonality: 2 },
    { name: "adult", noun: "adult", minAge: 5, maxAge: 30, genderedNoun: ["woman", "man", "adult"], commonality: 20 },
    {
      name: "elderly",
      noun: "elder",
      minAge: 31,
      maxAge: 45,
      genderedNoun: ["old woman", "old man", "elder"],
      commonality: 3
    }
  ],
  baseThreatLevel: 1,
  abilities: [],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: humanStandard(),
  // TODO: make real sizes
  tags: ["wolf"]
};
const dretch = {
  name: "dretch",
  pluralName: "dretches",
  adjective: "dretch",
  breedType: "dretch",
  environments: ["desert", "forest", "grassland", "mountain", "underdark", "urban"],
  creatureTypes: ["fiend"],
  physicalTraitGeneratorConfigs: [
    {
      name: "skin",
      category: "skin",
      options: ["brown", "mottled brown", "olive", "tan"],
      tags: ["skin"]
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["amber", "brown", "dark", "red"],
      tags: ["eyes"]
    }
  ],
  ageCategories: [
    {
      name: "infant",
      noun: "baby",
      minAge: 0,
      maxAge: 1,
      genderedNoun: ["baby girl", "baby boy", "baby"],
      commonality: 1
    },
    { name: "child", noun: "child", minAge: 2, maxAge: 4, genderedNoun: ["girl", "boy", "child"], commonality: 2 },
    { name: "adult", noun: "adult", minAge: 5, maxAge: 30, genderedNoun: ["woman", "man", "adult"], commonality: 20 },
    {
      name: "elderly",
      noun: "elder",
      minAge: 31,
      maxAge: 45,
      genderedNoun: ["old woman", "old man", "elder"],
      commonality: 3
    }
  ],
  baseThreatLevel: 1,
  abilities: [
    {
      name: "fetid cloud",
      description: "can emit a fetid cloud of gas",
      category: "attack",
      threatLevel: 2
    }
  ],
  commonality: 3,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: humanStandard(),
  // TODO: make real sizes
  tags: ["demon", "dretch", "fiend"]
};
const hell_hound = {
  name: "hell hound",
  pluralName: "hell hounds",
  adjective: "hell hound",
  breedType: "hell hound",
  environments: ["desert", "forest", "grassland", "mountain", "underdark", "urban"],
  creatureTypes: ["fiend"],
  physicalTraitGeneratorConfigs: [
    {
      name: "fur",
      category: "fur",
      options: ["black", "brown", "grey"],
      tags: ["fur"]
    },
    {
      name: "skin",
      category: "skin",
      options: ["brown", "mottled brown", "olive", "black"],
      tags: ["skin"]
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["glowing amber", "glowing orange", "glowing red"],
      tags: ["eyes"]
    }
  ],
  ageCategories: [
    {
      name: "infant",
      noun: "baby",
      minAge: 0,
      maxAge: 1,
      genderedNoun: ["baby girl", "baby boy", "baby"],
      commonality: 1
    },
    { name: "child", noun: "child", minAge: 2, maxAge: 4, genderedNoun: ["girl", "boy", "child"], commonality: 2 },
    { name: "adult", noun: "adult", minAge: 5, maxAge: 30, genderedNoun: ["woman", "man", "adult"], commonality: 20 },
    {
      name: "elderly",
      noun: "elder",
      minAge: 31,
      maxAge: 45,
      genderedNoun: ["old woman", "old man", "elder"],
      commonality: 3
    }
  ],
  baseThreatLevel: 1,
  abilities: [
    {
      name: "immunity: fire damage",
      description: "is immune to fire damage",
      category: "immunity",
      threatLevel: 1
    },
    {
      name: "breath weapon: fire",
      description: "can breathe fire once an hour",
      category: "attack",
      threatLevel: 2
    }
  ],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: humanStandard(),
  // TODO: make real sizes
  tags: ["demon", "fiend", "hell hound"]
};
const imp = {
  name: "imp",
  pluralName: "imps",
  adjective: "imp",
  breedType: "imp",
  environments: ["desert", "forest", "grassland", "mountain", "underdark", "urban"],
  creatureTypes: ["fiend"],
  physicalTraitGeneratorConfigs: [
    {
      name: "skin",
      category: "skin",
      options: ["brown", "mottled brown", "olive", "black"],
      tags: ["skin"]
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["glowing amber", "glowing orange", "glowing red"],
      tags: ["eyes"]
    }
  ],
  ageCategories: [
    {
      name: "infant",
      noun: "baby",
      minAge: 0,
      maxAge: 1,
      genderedNoun: ["baby girl", "baby boy", "baby"],
      commonality: 1
    },
    { name: "child", noun: "child", minAge: 2, maxAge: 4, genderedNoun: ["girl", "boy", "child"], commonality: 2 },
    { name: "adult", noun: "adult", minAge: 5, maxAge: 30, genderedNoun: ["woman", "man", "adult"], commonality: 20 },
    {
      name: "elderly",
      noun: "elder",
      minAge: 31,
      maxAge: 45,
      genderedNoun: ["old woman", "old man", "elder"],
      commonality: 3
    }
  ],
  baseThreatLevel: 1,
  abilities: [
    {
      name: "shapeshift into animal",
      description: "can shapeshift into an animal",
      category: "shapeshift",
      threatLevel: 2
    },
    {
      name: "darkvision",
      description: "can see in darkness",
      category: "senses",
      threatLevel: 1
    },
    {
      name: "resistance: magic",
      description: "is resistant to magic",
      category: "resistance",
      threatLevel: 1
    }
  ],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: humanStandard(),
  // TODO: make real sizes
  tags: ["demon", "fiend", "imp"]
};
const lemure = {
  name: "lemure",
  pluralName: "lemures",
  adjective: "lemure",
  breedType: "lemure",
  environments: ["desert", "forest", "grassland", "mountain", "underdark", "urban"],
  creatureTypes: ["fiend"],
  physicalTraitGeneratorConfigs: [
    {
      name: "skin",
      category: "skin",
      options: ["brown", "mottled brown", "olive", "mottled green"],
      tags: ["skin"]
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["glowing", "black", "white"],
      tags: ["eyes"]
    }
  ],
  ageCategories: [
    {
      name: "infant",
      noun: "baby",
      minAge: 0,
      maxAge: 1,
      genderedNoun: ["baby girl", "baby boy", "baby"],
      commonality: 1
    },
    { name: "child", noun: "child", minAge: 2, maxAge: 4, genderedNoun: ["girl", "boy", "child"], commonality: 2 },
    { name: "adult", noun: "adult", minAge: 5, maxAge: 30, genderedNoun: ["woman", "man", "adult"], commonality: 20 },
    {
      name: "elderly",
      noun: "elder",
      minAge: 31,
      maxAge: 45,
      genderedNoun: ["old woman", "old man", "elder"],
      commonality: 1
    }
  ],
  baseThreatLevel: 1,
  abilities: [
    {
      name: "immunity: fire damage",
      description: "is immune to fire damage",
      category: "immunity",
      threatLevel: 1
    },
    {
      name: "immunity: poison",
      description: "is immune to poison",
      category: "immunity",
      threatLevel: 1
    }
  ],
  commonality: 4,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: humanStandard(),
  // TODO: make real sizes
  tags: ["demon", "fiend", "lemure"]
};
const quasit = {
  name: "quasit",
  pluralName: "quasits",
  adjective: "quasit",
  breedType: "quasit",
  environments: ["desert", "forest", "grassland", "mountain", "underdark", "urban"],
  creatureTypes: ["fiend"],
  physicalTraitGeneratorConfigs: [
    {
      name: "skin",
      category: "skin",
      options: ["brown", "mottled brown", "olive", "mottled green"],
      tags: ["skin"]
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["grey", "black", "dark"],
      tags: ["eyes"]
    }
  ],
  ageCategories: [
    {
      name: "infant",
      noun: "baby",
      minAge: 0,
      maxAge: 1,
      genderedNoun: ["baby girl", "baby boy", "baby"],
      commonality: 1
    },
    { name: "child", noun: "child", minAge: 2, maxAge: 4, genderedNoun: ["girl", "boy", "child"], commonality: 2 },
    { name: "adult", noun: "adult", minAge: 5, maxAge: 30, genderedNoun: ["woman", "man", "adult"], commonality: 20 },
    {
      name: "elderly",
      noun: "elder",
      minAge: 31,
      maxAge: 45,
      genderedNoun: ["old woman", "old man", "elder"],
      commonality: 1
    }
  ],
  baseThreatLevel: 1,
  abilities: [
    {
      name: "shapeshift into insect",
      description: "can shapeshift into an insect",
      category: "shapeshift",
      threatLevel: 2
    },
    {
      name: "minor invisibility",
      description: "can turn invisible at will, but not while attacking",
      category: "invisibility",
      threatLevel: 2
    },
    {
      name: "resistance: magic",
      description: "is resistant to magic",
      category: "resistance",
      threatLevel: 1
    }
  ],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: humanStandard(),
  // TODO: make real sizes
  tags: ["demon", "fiend", "quasit"]
};
const dust_mephit = {
  name: "dust mephit",
  pluralName: "dust mephits",
  adjective: "dust mephit",
  breedType: "dust mephit",
  environments: ["desert"],
  creatureTypes: ["elemental"],
  physicalTraitGeneratorConfigs: [
    {
      name: "skin",
      category: "skin",
      options: ["brown", "mottled brown", "tan", "mottled tan"],
      tags: ["skin"]
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["grey", "black", "dark"],
      tags: ["eyes"]
    }
  ],
  ageCategories: [
    {
      name: "infant",
      noun: "baby",
      minAge: 0,
      maxAge: 1,
      genderedNoun: ["baby girl", "baby boy", "baby"],
      commonality: 1
    },
    { name: "child", noun: "child", minAge: 2, maxAge: 4, genderedNoun: ["girl", "boy", "child"], commonality: 2 },
    { name: "adult", noun: "adult", minAge: 5, maxAge: 30, genderedNoun: ["woman", "man", "adult"], commonality: 20 },
    {
      name: "elderly",
      noun: "elder",
      minAge: 31,
      maxAge: 45,
      genderedNoun: ["old woman", "old man", "elder"],
      commonality: 1
    }
  ],
  baseThreatLevel: 1,
  abilities: [
    {
      name: "death burst",
      description: "explodes on death",
      category: "attack",
      threatLevel: 2
    },
    {
      name: "blinding dust breath",
      description: "blinds enemies",
      category: "attack",
      threatLevel: 2
    }
  ],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: humanStandard(),
  // TODO: make real sizes
  tags: ["elemental", "dust mephit"]
};
const ice_mephit = {
  name: "ice mephit",
  pluralName: "ice mephits",
  adjective: "ice mephit",
  breedType: "ice mephit",
  environments: ["arctic"],
  creatureTypes: ["elemental"],
  physicalTraitGeneratorConfigs: [
    {
      name: "skin",
      category: "skin",
      options: ["brown", "mottled brown", "tan", "mottled tan"],
      tags: ["skin"]
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["grey", "black", "dark"],
      tags: ["eyes"]
    }
  ],
  ageCategories: [
    {
      name: "infant",
      noun: "baby",
      minAge: 0,
      maxAge: 1,
      genderedNoun: ["baby girl", "baby boy", "baby"],
      commonality: 1
    },
    { name: "child", noun: "child", minAge: 2, maxAge: 4, genderedNoun: ["girl", "boy", "child"], commonality: 2 },
    { name: "adult", noun: "adult", minAge: 5, maxAge: 30, genderedNoun: ["woman", "man", "adult"], commonality: 20 },
    {
      name: "elderly",
      noun: "elder",
      minAge: 31,
      maxAge: 45,
      genderedNoun: ["old woman", "old man", "elder"],
      commonality: 1
    }
  ],
  baseThreatLevel: 1,
  abilities: [
    {
      name: "spell: fog cloud",
      description: "can cast fog cloud",
      category: "spell",
      threatLevel: 2
    },
    {
      name: "ice explosion on death",
      description: "explodes in ice shards on death",
      category: "attack",
      threatLevel: 2
    },
    {
      name: "breath weapon: frost",
      description: "can breathe frost",
      category: "attack",
      threatLevel: 2
    },
    {
      name: "immunity: cold",
      description: "is immune to cold",
      category: "immunity",
      threatLevel: 1
    }
  ],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: humanStandard(),
  // TODO: make real sizes
  tags: ["elemental", "ice mephit"]
};
const magma_mephit = {
  name: "magma mephit",
  pluralName: "magma mephits",
  adjective: "magma mephit",
  breedType: "magma mephit",
  environments: ["underdark"],
  creatureTypes: ["elemental"],
  physicalTraitGeneratorConfigs: [
    {
      name: "skin",
      category: "skin",
      options: ["red", "mottled red", "black", "mottled black"],
      tags: ["skin"]
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["red", "black", "dark"],
      tags: ["eyes"]
    }
  ],
  ageCategories: [
    {
      name: "infant",
      noun: "baby",
      minAge: 0,
      maxAge: 1,
      genderedNoun: ["baby girl", "baby boy", "baby"],
      commonality: 1
    },
    { name: "child", noun: "child", minAge: 2, maxAge: 4, genderedNoun: ["girl", "boy", "child"], commonality: 2 },
    { name: "adult", noun: "adult", minAge: 5, maxAge: 30, genderedNoun: ["woman", "man", "adult"], commonality: 20 },
    {
      name: "elderly",
      noun: "elder",
      minAge: 31,
      maxAge: 45,
      genderedNoun: ["old woman", "old man", "elder"],
      commonality: 1
    }
  ],
  baseThreatLevel: 1,
  abilities: [
    {
      name: "spell: heat metal",
      description: "can cast heat metal",
      category: "spell",
      threatLevel: 1
    },
    {
      name: "lava explosion on death",
      description: "explodes in lava on death",
      category: "attack",
      threatLevel: 2
    },
    {
      name: "breath weapon: fire",
      description: "can breathe fire",
      category: "attack",
      threatLevel: 2
    },
    {
      name: "immunity: fire",
      description: "is immune to fire",
      category: "immunity",
      threatLevel: 1
    }
  ],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: humanStandard(),
  // TODO: make real sizes
  tags: ["elemental", "magma mephit"]
};
const steam_mephit = {
  name: "steam mephit",
  pluralName: "steam mephits",
  adjective: "steam mephit",
  breedType: "steam mephit",
  environments: ["underwater"],
  creatureTypes: ["elemental"],
  physicalTraitGeneratorConfigs: [
    {
      name: "skin",
      category: "skin",
      options: ["red", "mottled red", "black", "mottled black"],
      tags: ["skin"]
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["red", "black", "dark"],
      tags: ["eyes"]
    }
  ],
  ageCategories: [
    {
      name: "infant",
      noun: "baby",
      minAge: 0,
      maxAge: 1,
      genderedNoun: ["baby girl", "baby boy", "baby"],
      commonality: 1
    },
    { name: "child", noun: "child", minAge: 2, maxAge: 4, genderedNoun: ["girl", "boy", "child"], commonality: 2 },
    { name: "adult", noun: "adult", minAge: 5, maxAge: 30, genderedNoun: ["woman", "man", "adult"], commonality: 20 },
    {
      name: "elderly",
      noun: "elder",
      minAge: 31,
      maxAge: 45,
      genderedNoun: ["old woman", "old man", "elder"],
      commonality: 1
    }
  ],
  baseThreatLevel: 1,
  abilities: [
    {
      name: "spell: blur",
      description: "can cast blur",
      category: "spell",
      threatLevel: 1
    },
    {
      name: "steam explosion on death",
      description: "explodes in steam on death",
      category: "attack",
      threatLevel: 1
    },
    {
      name: "scalding steam breath",
      description: "can breathe scalding steam",
      category: "attack",
      threatLevel: 2
    },
    {
      name: "immunity: fire",
      description: "is immune to fire",
      category: "immunity",
      threatLevel: 1
    },
    {
      name: "immunity: poison",
      description: "is immune to poison",
      category: "immunity",
      threatLevel: 1
    }
  ],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: humanStandard(),
  // TODO: make real sizes
  tags: ["elemental", "steam mephit"]
};
const fire_beetle = {
  name: "fire beetle",
  pluralName: "fire beetles",
  adjective: "fire beetle",
  breedType: "fire beetle",
  environments: ["forest", "underdark"],
  creatureTypes: ["beast"],
  physicalTraitGeneratorConfigs: [
    {
      name: "body",
      category: "body",
      options: ["red", "mottled red", "black", "mottled black"],
      tags: ["body"]
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["red", "black", "dark"],
      tags: ["eyes"]
    }
  ],
  ageCategories: [
    {
      name: "infant",
      noun: "baby",
      minAge: 0,
      maxAge: 1,
      genderedNoun: ["baby girl", "baby boy", "baby"],
      commonality: 1
    },
    { name: "child", noun: "child", minAge: 2, maxAge: 4, genderedNoun: ["girl", "boy", "child"], commonality: 2 },
    { name: "adult", noun: "adult", minAge: 5, maxAge: 30, genderedNoun: ["woman", "man", "adult"], commonality: 20 },
    {
      name: "elderly",
      noun: "elder",
      minAge: 31,
      maxAge: 45,
      genderedNoun: ["old woman", "old man", "elder"],
      commonality: 1
    }
  ],
  baseThreatLevel: 1,
  abilities: [
    {
      name: "illumination",
      description: "glows with soft orange light",
      category: "misc",
      threatLevel: 1
    }
  ],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: humanStandard(),
  // TODO: make real sizes
  tags: ["insect", "fire beetle", "beetle"]
};
const giant_ant = {
  name: "giant ant",
  pluralName: "giant ants",
  adjective: "giant ant",
  breedType: "giant ant",
  environments: ["forest", "grassland", "hill"],
  creatureTypes: ["beast"],
  physicalTraitGeneratorConfigs: [
    {
      name: "body",
      category: "body",
      options: ["red", "black", "brown"],
      tags: ["body"]
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["red", "black", "dark"],
      tags: ["eyes"]
    }
  ],
  ageCategories: [
    {
      name: "infant",
      noun: "baby",
      minAge: 0,
      maxAge: 1,
      genderedNoun: ["baby girl", "baby boy", "baby"],
      commonality: 1
    },
    { name: "child", noun: "child", minAge: 2, maxAge: 4, genderedNoun: ["girl", "boy", "child"], commonality: 2 },
    { name: "adult", noun: "adult", minAge: 5, maxAge: 30, genderedNoun: ["woman", "man", "adult"], commonality: 20 },
    {
      name: "elderly",
      noun: "elder",
      minAge: 31,
      maxAge: 45,
      genderedNoun: ["old woman", "old man", "elder"],
      commonality: 1
    }
  ],
  baseThreatLevel: 1,
  abilities: [],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: humanStandard(),
  // TODO: make real sizes
  tags: ["insect", "giant ant", "ant", "swarm"]
};
const giant_bee = {
  name: "giant bee",
  pluralName: "giant bees",
  adjective: "giant bee",
  breedType: "giant bee",
  environments: ["forest", "grassland", "hill"],
  creatureTypes: ["beast"],
  physicalTraitGeneratorConfigs: [
    {
      name: "body",
      category: "body",
      options: ["yellow", "black", "brown"],
      tags: ["body"]
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["black", "dark"],
      tags: ["eyes"]
    }
  ],
  ageCategories: [
    {
      name: "infant",
      noun: "baby",
      minAge: 0,
      maxAge: 1,
      genderedNoun: ["baby girl", "baby boy", "baby"],
      commonality: 1
    },
    { name: "child", noun: "child", minAge: 2, maxAge: 4, genderedNoun: ["girl", "boy", "child"], commonality: 2 },
    { name: "adult", noun: "adult", minAge: 5, maxAge: 30, genderedNoun: ["woman", "man", "adult"], commonality: 20 },
    {
      name: "elderly",
      noun: "elder",
      minAge: 31,
      maxAge: 45,
      genderedNoun: ["old woman", "old man", "elder"],
      commonality: 1
    }
  ],
  baseThreatLevel: 1,
  abilities: [{
    name: "flight",
    description: "can fly",
    category: "movement",
    threatLevel: 1
  }],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: humanStandard(),
  // TODO: make real sizes
  tags: ["insect", "giant bee", "bee", "flying", "swarm"]
};
const giant_beetle = {
  name: "giant beetle",
  pluralName: "giant beetles",
  adjective: "giant beetle",
  breedType: "giant beetle",
  environments: ["forest", "grassland", "hill", "mountain", "urban", "underdark"],
  creatureTypes: ["beast"],
  physicalTraitGeneratorConfigs: [
    {
      name: "body",
      category: "body",
      options: ["blue", "brown", "black", "ochre"],
      tags: ["body"]
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["black", "dark"],
      tags: ["eyes"]
    }
  ],
  ageCategories: [
    {
      name: "infant",
      noun: "baby",
      minAge: 0,
      maxAge: 1,
      genderedNoun: ["baby girl", "baby boy", "baby"],
      commonality: 1
    },
    { name: "child", noun: "child", minAge: 2, maxAge: 4, genderedNoun: ["girl", "boy", "child"], commonality: 2 },
    { name: "adult", noun: "adult", minAge: 5, maxAge: 30, genderedNoun: ["woman", "man", "adult"], commonality: 20 },
    {
      name: "elderly",
      noun: "elder",
      minAge: 31,
      maxAge: 45,
      genderedNoun: ["old woman", "old man", "elder"],
      commonality: 1
    }
  ],
  baseThreatLevel: 1,
  abilities: [],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: humanStandard(),
  // TODO: make real sizes
  tags: ["insect", "giant beetle", "beetle"]
};
const giant_centipede = {
  name: "giant centipede",
  pluralName: "giant centipedes",
  adjective: "giant centipede",
  breedType: "giant centipede",
  environments: ["forest", "grassland", "hill", "mountain", "underdark"],
  creatureTypes: ["beast"],
  physicalTraitGeneratorConfigs: [
    {
      name: "body",
      category: "body",
      options: ["red", "black", "brown"],
      tags: ["body"]
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["red", "black", "dark"],
      tags: ["eyes"]
    }
  ],
  ageCategories: [
    {
      name: "infant",
      noun: "baby",
      minAge: 0,
      maxAge: 1,
      genderedNoun: ["baby girl", "baby boy", "baby"],
      commonality: 1
    },
    { name: "child", noun: "child", minAge: 2, maxAge: 4, genderedNoun: ["girl", "boy", "child"], commonality: 2 },
    { name: "adult", noun: "adult", minAge: 5, maxAge: 30, genderedNoun: ["woman", "man", "adult"], commonality: 20 },
    {
      name: "elderly",
      noun: "elder",
      minAge: 31,
      maxAge: 45,
      genderedNoun: ["old woman", "old man", "elder"],
      commonality: 1
    }
  ],
  baseThreatLevel: 1,
  abilities: [
    {
      name: "venomous bite",
      description: "can bite with venom",
      category: "attack",
      threatLevel: 1
    }
  ],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: humanStandard(),
  // TODO: make real sizes
  tags: ["insect", "giant centipede", "centipede"]
};
const giant_dragonfly = {
  name: "giant dragonfly",
  pluralName: "giant dragonflies",
  adjective: "giant dragonfly",
  breedType: "giant dragonfly",
  environments: ["forest", "grassland", "hill"],
  creatureTypes: ["beast"],
  physicalTraitGeneratorConfigs: [
    {
      name: "body",
      category: "body",
      options: ["yellow", "black", "brown"],
      tags: ["body"]
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["black", "dark"],
      tags: ["eyes"]
    }
  ],
  ageCategories: [
    {
      name: "infant",
      noun: "baby",
      minAge: 0,
      maxAge: 1,
      genderedNoun: ["baby girl", "baby boy", "baby"],
      commonality: 1
    },
    { name: "child", noun: "child", minAge: 2, maxAge: 4, genderedNoun: ["girl", "boy", "child"], commonality: 2 },
    { name: "adult", noun: "adult", minAge: 5, maxAge: 30, genderedNoun: ["woman", "man", "adult"], commonality: 20 },
    {
      name: "elderly",
      noun: "elder",
      minAge: 31,
      maxAge: 45,
      genderedNoun: ["old woman", "old man", "elder"],
      commonality: 1
    }
  ],
  baseThreatLevel: 1,
  abilities: [
    {
      name: "flight",
      description: "can fly",
      category: "movement",
      threatLevel: 1
    }
  ],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: humanStandard(),
  // TODO: make real sizes
  tags: ["insect", "giant dragonfly", "dragonfly", "flying", "swarm"]
};
const giant_scorpion = {
  name: "giant scorpion",
  pluralName: "giant scorpions",
  adjective: "giant scorpion",
  breedType: "giant scorpion",
  environments: ["desert"],
  creatureTypes: ["beast"],
  physicalTraitGeneratorConfigs: [
    {
      name: "body",
      category: "body",
      options: ["yellow", "black", "brown"],
      tags: ["body"]
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["black", "dark"],
      tags: ["eyes"]
    }
  ],
  ageCategories: [
    {
      name: "infant",
      noun: "baby",
      minAge: 0,
      maxAge: 1,
      genderedNoun: ["baby girl", "baby boy", "baby"],
      commonality: 1
    },
    { name: "child", noun: "child", minAge: 2, maxAge: 4, genderedNoun: ["girl", "boy", "child"], commonality: 2 },
    { name: "adult", noun: "adult", minAge: 5, maxAge: 30, genderedNoun: ["woman", "man", "adult"], commonality: 20 },
    {
      name: "elderly",
      noun: "elder",
      minAge: 31,
      maxAge: 45,
      genderedNoun: ["old woman", "old man", "elder"],
      commonality: 1
    }
  ],
  baseThreatLevel: 1,
  abilities: [
    {
      name: "venomous sting",
      description: "can sting with venom",
      category: "attack",
      threatLevel: 1
    }
  ],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: humanStandard(),
  // TODO: make real sizes
  tags: ["arachnid", "insect", "giant scorpion", "scorpion"]
};
const giant_spider = {
  name: "giant spider",
  pluralName: "giant spiders",
  adjective: "giant spider",
  breedType: "giant spider",
  environments: ["coastal", "forest", "grassland", "hill", "mountain", "underdark", "urban"],
  creatureTypes: ["beast"],
  physicalTraitGeneratorConfigs: [
    {
      name: "body",
      category: "body",
      options: ["white", "black", "brown"],
      tags: ["body"]
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["black", "dark", "red", "brown"],
      tags: ["eyes"]
    }
  ],
  ageCategories: [
    {
      name: "infant",
      noun: "baby",
      minAge: 0,
      maxAge: 1,
      genderedNoun: ["baby girl", "baby boy", "baby"],
      commonality: 1
    },
    { name: "child", noun: "child", minAge: 2, maxAge: 4, genderedNoun: ["girl", "boy", "child"], commonality: 2 },
    { name: "adult", noun: "adult", minAge: 5, maxAge: 30, genderedNoun: ["woman", "man", "adult"], commonality: 20 },
    {
      name: "elderly",
      noun: "elder",
      minAge: 31,
      maxAge: 45,
      genderedNoun: ["old woman", "old man", "elder"],
      commonality: 1
    }
  ],
  baseThreatLevel: 1,
  abilities: [
    {
      name: "venomous bite",
      description: "can bite with venom",
      category: "attack",
      threatLevel: 1
    },
    {
      name: "spin web",
      description: "can spin webs",
      category: "misc",
      threatLevel: 1
    }
  ],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: humanStandard(),
  // TODO: make real sizes
  tags: ["insect", "giant spider", "spider", "arachnid"]
};
const cockatrice = {
  name: "cockatrice",
  pluralName: "cockatrices",
  adjective: "cockatrice",
  breedType: "cockatrice",
  environments: ["forest", "grassland", "hill", "mountain"],
  creatureTypes: ["monstrosity"],
  physicalTraitGeneratorConfigs: [
    {
      name: "wings",
      category: "wings",
      options: ["striped", "short", "broad"],
      tags: ["wings"]
    },
    {
      name: "feathers",
      category: "feathers",
      options: ["black", "grey", "red", "brown"],
      tags: ["feathers"]
    },
    {
      name: "scales",
      category: "scales",
      options: ["black", "russet", "red", "brown"],
      tags: ["scales"]
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["black", "orange", "red", "brown"],
      tags: ["eyes"]
    }
  ],
  ageCategories: [
    {
      name: "infant",
      noun: "baby",
      minAge: 0,
      maxAge: 1,
      genderedNoun: ["baby girl", "baby boy", "baby"],
      commonality: 1
    },
    { name: "child", noun: "child", minAge: 2, maxAge: 4, genderedNoun: ["girl", "boy", "child"], commonality: 2 },
    { name: "adult", noun: "adult", minAge: 5, maxAge: 30, genderedNoun: ["woman", "man", "adult"], commonality: 20 },
    {
      name: "elderly",
      noun: "elder",
      minAge: 31,
      maxAge: 45,
      genderedNoun: ["old woman", "old man", "elder"],
      commonality: 1
    }
  ],
  baseThreatLevel: 1,
  abilities: [
    {
      name: "venomous bite",
      description: "can bite with venom",
      category: "attack",
      threatLevel: 1
    }
  ],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: humanStandard(),
  // TODO: make real sizes
  tags: ["cockatrice", "monstrosity"]
};
const darkmantle = {
  name: "darkmantle",
  pluralName: "darkmantles",
  adjective: "darkmantle",
  breedType: "darkmantle",
  environments: ["mountain", "underdark"],
  creatureTypes: ["monstrosity"],
  physicalTraitGeneratorConfigs: [
    {
      name: "skin",
      category: "skin",
      options: ["black", "grey", "brown"],
      tags: ["skin"]
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["black", "orange", "red", "brown"],
      tags: ["eyes"]
    }
  ],
  ageCategories: [
    {
      name: "infant",
      noun: "baby",
      minAge: 0,
      maxAge: 1,
      genderedNoun: ["baby girl", "baby boy", "baby"],
      commonality: 1
    },
    { name: "child", noun: "child", minAge: 2, maxAge: 4, genderedNoun: ["girl", "boy", "child"], commonality: 2 },
    { name: "adult", noun: "adult", minAge: 5, maxAge: 30, genderedNoun: ["woman", "man", "adult"], commonality: 20 },
    {
      name: "elderly",
      noun: "elder",
      minAge: 31,
      maxAge: 45,
      genderedNoun: ["old woman", "old man", "elder"],
      commonality: 1
    }
  ],
  baseThreatLevel: 1,
  abilities: [
    {
      name: "stalactite disguise",
      description: "can disguise as stalactite",
      category: "misc",
      threatLevel: 1
    }
  ],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: humanStandard(),
  // TODO: make real sizes
  tags: ["darkmantle", "monstrosity"]
};
const gryfalcon = {
  name: "gryfalcon",
  pluralName: "gryfalcons",
  adjective: "gryfalcon",
  breedType: "gryfalcon",
  environments: ["forest", "grassland", "hill", "mountain"],
  creatureTypes: ["monstrosity"],
  physicalTraitGeneratorConfigs: [
    {
      name: "wings",
      category: "wings",
      options: ["striped", "long", "tapered"],
      tags: ["wings"]
    },
    {
      name: "beak",
      category: "beak",
      options: ["short", "narrow", "sharp"],
      tags: ["beak"]
    },
    {
      name: "feathers",
      category: "feathers",
      options: ["white", "grey", "silver", "brown"],
      tags: ["feathers"]
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["brown", "blue", "amber", "grey"],
      tags: ["eyes"]
    }
  ],
  ageCategories: [
    {
      name: "infant",
      noun: "baby",
      minAge: 0,
      maxAge: 1,
      genderedNoun: ["baby girl", "baby boy", "baby"],
      commonality: 1
    },
    { name: "child", noun: "child", minAge: 2, maxAge: 4, genderedNoun: ["girl", "boy", "child"], commonality: 2 },
    { name: "adult", noun: "adult", minAge: 5, maxAge: 30, genderedNoun: ["woman", "man", "adult"], commonality: 20 },
    {
      name: "elderly",
      noun: "elder",
      minAge: 31,
      maxAge: 45,
      genderedNoun: ["old woman", "old man", "elder"],
      commonality: 1
    }
  ],
  baseThreatLevel: 3,
  abilities: [
    {
      name: "flight",
      description: "can fly",
      category: "movement",
      threatLevel: 1
    }
  ],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: humanStandard(),
  // TODO: make real sizes
  tags: ["gryfalcon", "monstrosity"]
};
const gryphon = {
  name: "gryphon",
  pluralName: "gryphons",
  adjective: "gryphon",
  breedType: "gryphon",
  environments: ["forest", "grassland", "hill", "mountain"],
  creatureTypes: ["monstrosity"],
  physicalTraitGeneratorConfigs: [
    {
      name: "wings",
      category: "wings",
      options: ["wide", "broad"],
      tags: ["wings"]
    },
    {
      name: "beak",
      category: "beak",
      options: ["hooked", "crooked", "large", "sharp"],
      tags: ["beak"]
    },
    {
      name: "feathers",
      category: "feathers",
      options: ["white", "grey", "silver", "brown"],
      tags: ["feathers"]
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["brown", "blue", "amber", "grey"],
      tags: ["eyes"]
    }
  ],
  ageCategories: [
    {
      name: "infant",
      noun: "baby",
      minAge: 0,
      maxAge: 1,
      genderedNoun: ["baby girl", "baby boy", "baby"],
      commonality: 1
    },
    { name: "child", noun: "child", minAge: 2, maxAge: 4, genderedNoun: ["girl", "boy", "child"], commonality: 2 },
    { name: "adult", noun: "adult", minAge: 5, maxAge: 30, genderedNoun: ["woman", "man", "adult"], commonality: 20 },
    {
      name: "elderly",
      noun: "elder",
      minAge: 31,
      maxAge: 45,
      genderedNoun: ["old woman", "old man", "elder"],
      commonality: 1
    }
  ],
  baseThreatLevel: 3,
  abilities: [
    {
      name: "flight",
      description: "can fly",
      category: "movement",
      threatLevel: 1
    }
  ],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: humanStandard(),
  // TODO: make real sizes
  tags: ["gryphon", "monstrosity"]
};
const harpy = {
  name: "harpy",
  pluralName: "harpies",
  adjective: "harpy",
  breedType: "harpy",
  environments: ["forest", "grassland", "hill", "mountain"],
  creatureTypes: ["monstrosity"],
  physicalTraitGeneratorConfigs: [
    {
      name: "wings",
      category: "wings",
      options: ["striped", "long", "tapered"],
      tags: ["wings"]
    },
    {
      name: "feathers",
      category: "feathers",
      options: ["white", "grey", "silver", "brown"],
      tags: ["feathers"]
    },
    {
      name: "skin",
      category: "skin",
      options: ["white", "black", "tan", "brown"],
      tags: ["skin"]
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["brown", "blue", "amber", "grey"],
      tags: ["eyes"]
    }
  ],
  ageCategories: [
    {
      name: "infant",
      noun: "baby",
      minAge: 0,
      maxAge: 1,
      genderedNoun: ["baby girl", "baby boy", "baby"],
      commonality: 1
    },
    { name: "child", noun: "child", minAge: 2, maxAge: 4, genderedNoun: ["girl", "boy", "child"], commonality: 2 },
    { name: "adult", noun: "adult", minAge: 5, maxAge: 30, genderedNoun: ["woman", "man", "adult"], commonality: 20 },
    {
      name: "elderly",
      noun: "elder",
      minAge: 31,
      maxAge: 45,
      genderedNoun: ["old woman", "old man", "elder"],
      commonality: 1
    }
  ],
  baseThreatLevel: 1,
  abilities: [
    {
      name: "flight",
      description: "can fly",
      category: "movement",
      threatLevel: 1
    }
  ],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: humanStandard(),
  // TODO: make real sizes
  tags: ["harpy", "monstrosity"]
};
const hippogriff = {
  name: "hippogriff",
  pluralName: "hippogriffs",
  adjective: "hippogriff",
  breedType: "hippogriff",
  environments: ["forest", "grassland", "hill", "mountain"],
  creatureTypes: ["monstrosity"],
  physicalTraitGeneratorConfigs: [
    {
      name: "wings",
      category: "wings",
      options: ["striped", "long", "tapered"],
      tags: ["wings"]
    },
    {
      name: "beak",
      category: "beak",
      options: ["short", "narrow", "sharp"],
      tags: ["beak"]
    },
    {
      name: "feathers",
      category: "feathers",
      options: ["white", "grey", "silver", "brown"],
      tags: ["feathers"]
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["brown", "blue", "amber", "grey"],
      tags: ["eyes"]
    }
  ],
  ageCategories: [
    {
      name: "infant",
      noun: "baby",
      minAge: 0,
      maxAge: 1,
      genderedNoun: ["baby girl", "baby boy", "baby"],
      commonality: 1
    },
    { name: "child", noun: "child", minAge: 2, maxAge: 4, genderedNoun: ["girl", "boy", "child"], commonality: 2 },
    { name: "adult", noun: "adult", minAge: 5, maxAge: 30, genderedNoun: ["woman", "man", "adult"], commonality: 20 },
    {
      name: "elderly",
      noun: "elder",
      minAge: 31,
      maxAge: 45,
      genderedNoun: ["old woman", "old man", "elder"],
      commonality: 1
    }
  ],
  baseThreatLevel: 3,
  abilities: [
    {
      name: "flight",
      description: "can fly",
      category: "movement",
      threatLevel: 1
    }
  ],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: humanStandard(),
  // TODO: make real sizes
  tags: ["hippogriff", "monstrosity"]
};
const owlbear = {
  name: "owlbear",
  pluralName: "owlbears",
  adjective: "owlbear",
  breedType: "owlbear",
  environments: ["forest", "grassland", "hill", "mountain"],
  creatureTypes: ["monstrosity"],
  physicalTraitGeneratorConfigs: [
    {
      name: "beak",
      category: "beak",
      options: ["hooked", "crooked", "large", "sharp"],
      tags: ["beak"]
    },
    {
      name: "feathers",
      category: "feathers",
      options: ["white", "grey", "silver", "brown"],
      tags: ["feathers"]
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["brown", "blue", "amber", "grey"],
      tags: ["eyes"]
    }
  ],
  ageCategories: [
    {
      name: "infant",
      noun: "baby",
      minAge: 0,
      maxAge: 1,
      genderedNoun: ["baby girl", "baby boy", "baby"],
      commonality: 1
    },
    { name: "child", noun: "child", minAge: 2, maxAge: 4, genderedNoun: ["girl", "boy", "child"], commonality: 2 },
    { name: "adult", noun: "adult", minAge: 5, maxAge: 30, genderedNoun: ["woman", "man", "adult"], commonality: 20 },
    {
      name: "elderly",
      noun: "elder",
      minAge: 31,
      maxAge: 45,
      genderedNoun: ["old woman", "old man", "elder"],
      commonality: 1
    }
  ],
  baseThreatLevel: 4,
  abilities: [],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: humanStandard(),
  // TODO: make real sizes
  tags: ["owlbear", "monstrosity"]
};
const rust_monster = {
  name: "rust monster",
  pluralName: "rust monsters",
  adjective: "rust monster",
  breedType: "rust monster",
  environments: ["forest", "grassland", "hill", "mountain"],
  creatureTypes: ["monstrosity"],
  physicalTraitGeneratorConfigs: [
    {
      name: "body",
      category: "body",
      options: ["red", "russet", "brown"],
      tags: ["body"]
    },
    {
      name: "feelers",
      category: "feelers",
      options: ["brown", "ochre", "tan", "grey"],
      tags: ["feelers"]
    }
  ],
  ageCategories: [
    {
      name: "infant",
      noun: "baby",
      minAge: 0,
      maxAge: 1,
      genderedNoun: ["baby girl", "baby boy", "baby"],
      commonality: 1
    },
    { name: "child", noun: "child", minAge: 2, maxAge: 4, genderedNoun: ["girl", "boy", "child"], commonality: 2 },
    { name: "adult", noun: "adult", minAge: 5, maxAge: 30, genderedNoun: ["woman", "man", "adult"], commonality: 20 },
    {
      name: "elderly",
      noun: "elder",
      minAge: 31,
      maxAge: 45,
      genderedNoun: ["old woman", "old man", "elder"],
      commonality: 1
    }
  ],
  baseThreatLevel: 0,
  abilities: [
    {
      name: "rusting touch",
      description: "rusts nonmagical metal it touches",
      category: "attack",
      threatLevel: 1
    }
  ],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: humanStandard(),
  // TODO: make real sizes
  tags: ["rust monster", "monstrosity"]
};
const worg = {
  name: "worg",
  pluralName: "worgs",
  adjective: "worg",
  breedType: "worg",
  environments: ["forest", "grassland", "hill", "mountain"],
  creatureTypes: ["monstrosity"],
  physicalTraitGeneratorConfigs: [
    {
      name: "fangs",
      category: "fangs",
      options: ["hooked", "crooked", "large", "sharp"],
      tags: ["fangs"]
    },
    {
      name: "fur",
      category: "fur",
      options: ["black", "grey", "white", "brown", "dark"],
      tags: ["fur"]
    },
    {
      name: "skin",
      category: "skin",
      options: ["pale", "grey", "black", "brown"],
      tags: ["skin"]
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["brown", "red", "amber", "grey"],
      tags: ["eyes"]
    }
  ],
  ageCategories: [
    {
      name: "infant",
      noun: "baby",
      minAge: 0,
      maxAge: 1,
      genderedNoun: ["baby girl", "baby boy", "baby"],
      commonality: 1
    },
    { name: "child", noun: "child", minAge: 2, maxAge: 4, genderedNoun: ["girl", "boy", "child"], commonality: 2 },
    { name: "adult", noun: "adult", minAge: 5, maxAge: 30, genderedNoun: ["woman", "man", "adult"], commonality: 20 },
    {
      name: "elderly",
      noun: "elder",
      minAge: 31,
      maxAge: 45,
      genderedNoun: ["old woman", "old man", "elder"],
      commonality: 1
    }
  ],
  baseThreatLevel: 2,
  abilities: [
    {
      name: "darkvision",
      description: "can see in the dark",
      category: "senses",
      threatLevel: 1
    }
  ],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: humanStandard(),
  // TODO: make real sizes
  tags: ["worg", "monstrosity"]
};
const black_pudding = {
  name: "black pudding",
  pluralName: "black puddings",
  adjective: "black pudding",
  breedType: "black pudding",
  environments: ["forest", "grassland", "hill", "mountain", "underdark"],
  creatureTypes: ["ooze"],
  physicalTraitGeneratorConfigs: [
    {
      name: "body",
      category: "body",
      options: ["black", "viscous black", "dark"],
      tags: ["body"]
    }
  ],
  ageCategories: [
    {
      name: "infant",
      noun: "baby",
      minAge: 0,
      maxAge: 1,
      genderedNoun: ["baby girl", "baby boy", "baby"],
      commonality: 1
    },
    { name: "child", noun: "child", minAge: 2, maxAge: 4, genderedNoun: ["girl", "boy", "child"], commonality: 2 },
    { name: "adult", noun: "adult", minAge: 5, maxAge: 30, genderedNoun: ["woman", "man", "adult"], commonality: 20 },
    {
      name: "elderly",
      noun: "elder",
      minAge: 31,
      maxAge: 45,
      genderedNoun: ["old woman", "old man", "elder"],
      commonality: 1
    }
  ],
  baseThreatLevel: 1,
  abilities: [
    {
      name: "metal dissolution",
      description: "dissolve nonmagical metal things",
      category: "attack",
      threatLevel: 1
    },
    {
      name: "amorphous",
      description: "can squeeze through small spaces",
      category: "movement",
      threatLevel: 1
    },
    {
      name: "climb walls and ceilings",
      description: "can climb walls and ceilings",
      category: "movement",
      threatLevel: 1
    }
  ],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: humanStandard(),
  // TODO: make real sizes
  tags: ["black pudding", "ooze"]
};
const blue_jelly = {
  name: "blue jelly",
  pluralName: "blue jellies",
  adjective: "blue jelly",
  breedType: "blue jelly",
  environments: ["forest", "grassland", "hill", "mountain", "underdark"],
  creatureTypes: ["ooze"],
  physicalTraitGeneratorConfigs: [
    {
      name: "body",
      category: "body",
      options: ["blue", "azure", "dark blue"],
      tags: ["body"]
    }
  ],
  ageCategories: [
    {
      name: "infant",
      noun: "baby",
      minAge: 0,
      maxAge: 1,
      genderedNoun: ["baby girl", "baby boy", "baby"],
      commonality: 1
    },
    { name: "child", noun: "child", minAge: 2, maxAge: 4, genderedNoun: ["girl", "boy", "child"], commonality: 2 },
    { name: "adult", noun: "adult", minAge: 5, maxAge: 30, genderedNoun: ["woman", "man", "adult"], commonality: 20 },
    {
      name: "elderly",
      noun: "elder",
      minAge: 31,
      maxAge: 45,
      genderedNoun: ["old woman", "old man", "elder"],
      commonality: 1
    }
  ],
  baseThreatLevel: 1,
  abilities: [
    {
      name: "amorphous",
      description: "can squeeze through small spaces",
      category: "movement",
      threatLevel: 1
    },
    {
      name: "climb walls and ceilings",
      description: "can climb walls and ceilings",
      category: "movement",
      threatLevel: 1
    }
  ],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: humanStandard(),
  // TODO: make real sizes
  tags: ["blue jelly", "ooze"]
};
const blue_slime = {
  name: "blue slime",
  pluralName: "blue slimes",
  adjective: "blue slime",
  breedType: "blue slime",
  environments: ["forest", "grassland", "hill", "mountain", "underdark"],
  creatureTypes: ["ooze"],
  physicalTraitGeneratorConfigs: [
    {
      name: "body",
      category: "body",
      options: ["blue", "azure", "dark blue"],
      tags: ["body"]
    }
  ],
  ageCategories: [
    {
      name: "infant",
      noun: "baby",
      minAge: 0,
      maxAge: 1,
      genderedNoun: ["baby girl", "baby boy", "baby"],
      commonality: 1
    },
    { name: "child", noun: "child", minAge: 2, maxAge: 4, genderedNoun: ["girl", "boy", "child"], commonality: 2 },
    { name: "adult", noun: "adult", minAge: 5, maxAge: 30, genderedNoun: ["woman", "man", "adult"], commonality: 20 },
    {
      name: "elderly",
      noun: "elder",
      minAge: 31,
      maxAge: 45,
      genderedNoun: ["old woman", "old man", "elder"],
      commonality: 1
    }
  ],
  baseThreatLevel: 1,
  abilities: [
    {
      name: "amorphous",
      description: "can squeeze through small spaces",
      category: "movement",
      threatLevel: 1
    },
    {
      name: "climb walls and ceilings",
      description: "can climb walls and ceilings",
      category: "movement",
      threatLevel: 1
    }
  ],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: humanStandard(),
  // TODO: make real sizes
  tags: ["blue slime", "ooze"]
};
const brown_pudding = {
  name: "brown pudding",
  pluralName: "brown puddings",
  adjective: "brown pudding",
  breedType: "brown pudding",
  environments: ["forest", "grassland", "hill", "mountain", "underdark"],
  creatureTypes: ["ooze"],
  physicalTraitGeneratorConfigs: [
    {
      name: "body",
      category: "body",
      options: ["brown", "russet", "dark brown"],
      tags: ["body"]
    }
  ],
  ageCategories: [
    {
      name: "infant",
      noun: "baby",
      minAge: 0,
      maxAge: 1,
      genderedNoun: ["baby girl", "baby boy", "baby"],
      commonality: 1
    },
    { name: "child", noun: "child", minAge: 2, maxAge: 4, genderedNoun: ["girl", "boy", "child"], commonality: 2 },
    { name: "adult", noun: "adult", minAge: 5, maxAge: 30, genderedNoun: ["woman", "man", "adult"], commonality: 20 },
    {
      name: "elderly",
      noun: "elder",
      minAge: 31,
      maxAge: 45,
      genderedNoun: ["old woman", "old man", "elder"],
      commonality: 1
    }
  ],
  baseThreatLevel: 1,
  abilities: [
    {
      name: "amorphous",
      description: "can squeeze through small spaces",
      category: "movement",
      threatLevel: 1
    },
    {
      name: "climb walls and ceilings",
      description: "can climb walls and ceilings",
      category: "movement",
      threatLevel: 1
    }
  ],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: humanStandard(),
  // TODO: make real sizes
  tags: ["brown pudding", "ooze"]
};
const gelatinous_cube = {
  name: "gelatinous cube",
  pluralName: "gelatinous cubes",
  adjective: "gelatinous cube",
  breedType: "gelatinous cube",
  environments: ["forest", "grassland", "hill", "mountain", "underdark"],
  creatureTypes: ["ooze"],
  physicalTraitGeneratorConfigs: [
    {
      name: "body",
      category: "body",
      options: ["clear", "translucent", "foggy"],
      tags: ["body"]
    }
  ],
  ageCategories: [
    {
      name: "infant",
      noun: "baby",
      minAge: 0,
      maxAge: 1,
      genderedNoun: ["baby girl", "baby boy", "baby"],
      commonality: 1
    },
    { name: "child", noun: "child", minAge: 2, maxAge: 4, genderedNoun: ["girl", "boy", "child"], commonality: 2 },
    { name: "adult", noun: "adult", minAge: 5, maxAge: 30, genderedNoun: ["woman", "man", "adult"], commonality: 20 },
    {
      name: "elderly",
      noun: "elder",
      minAge: 31,
      maxAge: 45,
      genderedNoun: ["old woman", "old man", "elder"],
      commonality: 1
    }
  ],
  baseThreatLevel: 1,
  abilities: [
    {
      name: "nonmetal dissolution",
      description: "dissolve nonmagical nonmetal things",
      category: "attack",
      threatLevel: 1
    }
  ],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: humanStandard(),
  // TODO: make real sizes
  tags: ["gelatinous cube", "ooze"]
};
const green_slime = {
  name: "green slime",
  pluralName: "green slimes",
  adjective: "green slime",
  breedType: "green slime",
  environments: ["forest", "grassland", "hill", "mountain", "underdark"],
  creatureTypes: ["ooze"],
  physicalTraitGeneratorConfigs: [
    {
      name: "body",
      category: "body",
      options: ["green", "emerald green", "dark green"],
      tags: ["body"]
    }
  ],
  ageCategories: [
    {
      name: "infant",
      noun: "baby",
      minAge: 0,
      maxAge: 1,
      genderedNoun: ["baby girl", "baby boy", "baby"],
      commonality: 1
    },
    { name: "child", noun: "child", minAge: 2, maxAge: 4, genderedNoun: ["girl", "boy", "child"], commonality: 2 },
    { name: "adult", noun: "adult", minAge: 5, maxAge: 30, genderedNoun: ["woman", "man", "adult"], commonality: 20 },
    {
      name: "elderly",
      noun: "elder",
      minAge: 31,
      maxAge: 45,
      genderedNoun: ["old woman", "old man", "elder"],
      commonality: 1
    }
  ],
  baseThreatLevel: 1,
  abilities: [
    {
      name: "amorphous",
      description: "can squeeze through small spaces",
      category: "movement",
      threatLevel: 1
    },
    {
      name: "climb walls and ceilings",
      description: "can climb walls and ceilings",
      category: "movement",
      threatLevel: 1
    }
  ],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: humanStandard(),
  // TODO: make real sizes
  tags: ["green slime", "ooze"]
};
const grey_ooze = {
  name: "grey ooze",
  pluralName: "grey oozes",
  adjective: "grey ooze",
  breedType: "grey ooze",
  environments: ["forest", "grassland", "hill", "mountain", "underdark"],
  creatureTypes: ["ooze"],
  physicalTraitGeneratorConfigs: [
    {
      name: "body",
      category: "body",
      options: ["grey", "dark grey", "light grey"],
      tags: ["body"]
    }
  ],
  ageCategories: [
    {
      name: "infant",
      noun: "baby",
      minAge: 0,
      maxAge: 1,
      genderedNoun: ["baby girl", "baby boy", "baby"],
      commonality: 1
    },
    { name: "child", noun: "child", minAge: 2, maxAge: 4, genderedNoun: ["girl", "boy", "child"], commonality: 2 },
    { name: "adult", noun: "adult", minAge: 5, maxAge: 30, genderedNoun: ["woman", "man", "adult"], commonality: 20 },
    {
      name: "elderly",
      noun: "elder",
      minAge: 31,
      maxAge: 45,
      genderedNoun: ["old woman", "old man", "elder"],
      commonality: 1
    }
  ],
  baseThreatLevel: 1,
  abilities: [
    {
      name: "amorphous",
      description: "can squeeze through small spaces",
      category: "movement",
      threatLevel: 1
    },
    {
      name: "climb walls and ceilings",
      description: "can climb walls and ceilings",
      category: "movement",
      threatLevel: 1
    },
    {
      name: "corrode metal",
      description: "corrode metal",
      category: "misc",
      threatLevel: 1
    },
    {
      name: "imitate oily pool",
      description: "imitate oily pool",
      category: "misc",
      threatLevel: 1
    }
  ],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: humanStandard(),
  // TODO: make real sizes
  tags: ["grey ooze", "ooze"]
};
const ochre_jelly = {
  name: "ochre jelly",
  pluralName: "ochre jellies",
  adjective: "ochre jelly",
  breedType: "ochre jelly",
  environments: ["forest", "grassland", "hill", "mountain", "underdark"],
  creatureTypes: ["ooze"],
  physicalTraitGeneratorConfigs: [
    {
      name: "body",
      category: "body",
      options: ["ochre", "yellow", "dark ochre"],
      tags: ["body"]
    }
  ],
  ageCategories: [
    {
      name: "infant",
      noun: "baby",
      minAge: 0,
      maxAge: 1,
      genderedNoun: ["baby girl", "baby boy", "baby"],
      commonality: 1
    },
    { name: "child", noun: "child", minAge: 2, maxAge: 4, genderedNoun: ["girl", "boy", "child"], commonality: 2 },
    { name: "adult", noun: "adult", minAge: 5, maxAge: 30, genderedNoun: ["woman", "man", "adult"], commonality: 20 },
    {
      name: "elderly",
      noun: "elder",
      minAge: 31,
      maxAge: 45,
      genderedNoun: ["old woman", "old man", "elder"],
      commonality: 1
    }
  ],
  baseThreatLevel: 1,
  abilities: [
    {
      name: "amorphous",
      description: "can squeeze through small spaces",
      category: "movement",
      threatLevel: 1
    },
    {
      name: "climb walls and ceilings",
      description: "can climb walls and ceilings",
      category: "movement",
      threatLevel: 1
    },
    {
      name: "lightning split",
      description: "split in half when hit with lightning",
      category: "misc",
      threatLevel: 1
    }
  ],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: humanStandard(),
  // TODO: make real sizes
  tags: ["ochre jelly", "ooze"]
};
const wingLengths = ["short", "long"];
const wingTypes = ["black-tipped", "sleek", "knife-edged", "graceful", "full"];
let wingAppearances = [];
for (let j = 0; j < wingTypes.length; j++) {
  for (let i = 0; i < wingLengths.length; i++) {
    wingAppearances.push(`${wingLengths[i]} and ${wingTypes[j]}`);
  }
  wingAppearances.push(wingTypes[j]);
}
const aarakocra = {
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
    "urban"
  ],
  creatureTypes: ["humanoid"],
  physicalTraitGeneratorConfigs: [
    {
      name: "feathers",
      category: "feathers",
      options: ["white", "mottled", "brown", "russet", "black", "grey", "red", "orange"],
      tags: ["feathers"]
    },
    {
      name: "wings",
      category: "wings",
      options: wingAppearances,
      tags: ["wings"]
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["yellow", "red", "white", "silver", "gold", "blue", "green"],
      tags: ["eyes"]
    }
  ],
  ageCategories: getHumanVariant(1.2),
  baseThreatLevel: 1,
  abilities: [
    {
      name: "flight",
      description: "can fly",
      category: "movement",
      threatLevel: 1
    }
  ],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: getHumanVariant$1(0.7, 0.95),
  tags: ["corruptible", "aarakocra", "flying", "martial", "magic", "sentient"]
};
const aasimar = {
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
    "underdark"
  ],
  creatureTypes: ["humanoid"],
  physicalTraitGeneratorConfigs: [
    {
      name: "hair",
      category: "hair",
      options: ["black", "blonde", "brown", "dark", "light", "red", "russet", "white"],
      tags: ["hair"]
    },
    {
      name: "skin",
      category: "skin",
      options: ["bronzed", "light", "pale", "tan", "white", "black", "brown"],
      tags: ["skin"]
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["amber", "blue", "brown", "dark", "green", "gold", "silver"],
      tags: ["eyes"]
    }
  ],
  ageCategories: getHumanVariant(1.6),
  baseThreatLevel: 1,
  abilities: [
    {
      name: "healing touch",
      description: "can heal with a touch",
      category: "spell",
      threatLevel: 1
    },
    {
      name: "summon light",
      description: "can summon light",
      category: "spell",
      threatLevel: 1
    }
  ],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: getHumanVariant$1(0.9, 0.95),
  tags: ["aasimar", "celestial", "human", "martial", "magic", "sentient"]
};
const bugbear = {
  name: "bugbear",
  pluralName: "bugbears",
  adjective: "bugbear",
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
    "underdark"
  ],
  creatureTypes: ["humanoid", "goblinoid"],
  physicalTraitGeneratorConfigs: [
    {
      name: "hair",
      category: "hair",
      options: ["black", "brown", "dark", "red", "russet"],
      tags: ["hair"]
    },
    {
      name: "skin",
      category: "skin",
      options: ["black", "dark green", "dark grey", "grey", "light green", "green", "grey", "olive"],
      tags: ["skin"]
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["amber", "red", "brown", "dark", "yellow", "orange", "grey"],
      tags: ["eyes"]
    }
  ],
  ageCategories: getHumanVariant(0.8),
  baseThreatLevel: 2,
  abilities: [],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: getHumanVariant$1(1.1, 1.15),
  tags: ["corruptible", "bugbear", "greenskin", "martial", "sentient"]
};
const centaur = {
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
    "urban"
  ],
  creatureTypes: ["fey", "tauroid"],
  physicalTraitGeneratorConfigs: [
    {
      name: "hair",
      category: "hair",
      options: ["black", "blonde", "brown", "dark", "light", "red", "russet"],
      tags: ["hair"]
    },
    {
      name: "skin",
      category: "skin",
      options: ["bronzed", "light", "pale", "tan", "white"],
      tags: ["skin"]
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["amber", "blue", "brown", "dark", "green"],
      tags: ["eyes"]
    },
    {
      name: "horse-hide",
      category: "horse-hide",
      options: ["black", "brown", "dark", "light", "white"],
      tags: ["horse-hide"]
    },
    {
      name: "hooves",
      category: "hooves",
      options: ["heavy", "small", "sharp", "black", "white", "hairy"],
      tags: ["hooves"]
    }
  ],
  ageCategories: getHumanVariant(1.85),
  baseThreatLevel: 2,
  abilities: [],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: getHumanVariant$1(1.45, 1.25),
  tags: ["centaur", "human", "martial", "magic", "sentient"]
};
const dark_elf = {
  name: "dark elf",
  pluralName: "dark elves",
  adjective: "dark elven",
  breedType: "human",
  environments: ["forest", "mountain", "underdark"],
  creatureTypes: ["humanoid", "elf"],
  physicalTraitGeneratorConfigs: [
    {
      name: "hair",
      category: "hair",
      options: ["white", "light grey", "ashen", "silver", "blue-grey"],
      tags: ["hair"]
    },
    {
      name: "skin",
      category: "skin",
      options: ["black", "jet black", "dark grey", "grey", "light grey", "blue-grey"],
      tags: ["skin"]
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["blue", "purple", "brown", "dark", "amber", "grey", "red"],
      tags: ["eyes"]
    }
  ],
  ageCategories: getHumanVariant(7),
  baseThreatLevel: 1,
  abilities: [
    {
      name: "darkvision",
      description: "can see in the dark",
      category: "senses",
      threatLevel: 1
    },
    {
      name: "spell: faerie fire",
      description: "can cast faerie fire",
      category: "spell",
      threatLevel: 2
    },
    {
      name: "spell: dancing lights",
      description: "can cast dancing lights",
      category: "spell",
      threatLevel: 2
    }
  ],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: getHumanVariant$1(0.6, 0.9),
  tags: ["corruptible", "dark elf", "elf", "martial", "magic", "sentient"]
};
const deep_gnome = {
  name: "deep gnome",
  pluralName: "deep gnomes",
  adjective: "deep gnome",
  breedType: "human",
  environments: ["forest", "mountain", "underdark"],
  creatureTypes: ["humanoid", "gnome"],
  physicalTraitGeneratorConfigs: [
    {
      name: "hair",
      category: "hair",
      options: ["black", "dark", "light", "white"],
      tags: ["hair"]
    },
    {
      name: "skin",
      category: "skin",
      options: ["grey", "dark grey", "pale", "light grey", "bone white"],
      tags: ["skin"]
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["amber", "black", "brown", "dark", "white"],
      tags: ["eyes"]
    }
  ],
  ageCategories: getHumanVariant(5),
  baseThreatLevel: 1,
  abilities: [
    {
      name: "darkvision",
      description: "can see in the dark",
      category: "senses",
      threatLevel: 1
    }
  ],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: getHumanVariant$1(0.5, 0.5),
  tags: ["corruptible", "deep gnome", "gnome", "martial", "magic", "sentient"]
};
let ageCategories = getHumanVariant(0.8);
for (let i = 0; i < ageCategories.length; i++) {
  if (ageCategories[i].name == "infant") {
    ageCategories[i].name = "hatchling";
  }
}
const dragonborn = {
  name: "dragonborn",
  pluralName: "dragonborn",
  adjective: "dragonborn",
  breedType: "dragonborn",
  environments: [
    "arctic",
    "coastal",
    "desert",
    "forest",
    "grassland",
    "hill",
    "mountain",
    "urban",
    "underdark"
  ],
  creatureTypes: ["humanoid"],
  physicalTraitGeneratorConfigs: [
    {
      name: "crest",
      category: "crest",
      options: ["finned", "horned", "ridged", "spiked", "spined", "webbed"],
      tags: ["crest"]
    },
    {
      name: "scales",
      category: "skin",
      options: [
        "amethyst",
        "black",
        "blue",
        "brass",
        "bronze",
        "copper",
        "crystal",
        "emerald",
        "gold",
        "green",
        "red",
        "sapphire",
        "silver",
        "topaz",
        "white"
      ],
      tags: ["scales", "skin"]
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["amber", "blue", "dark", "green", "orange", "red", "turquoise", "white", "yellow"],
      tags: ["eyes"]
    }
  ],
  ageCategories,
  baseThreatLevel: 2,
  abilities: [
    {
      name: "breath weapon",
      description: "can breathe an element (acid, cold, fire, lightning, poison) appropriate to the dragonborn's type",
      category: "attack",
      threatLevel: 1
    }
  ],
  commonality: 10,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: getHumanVariant$1(1.7, 1.1),
  tags: ["corruptible", "dragonborn", "dragonkin", "martial", "sentient", "magic"]
};
const duergar = {
  name: "duergar",
  pluralName: "duergar",
  adjective: "duergar",
  breedType: "human",
  environments: ["underdark"],
  creatureTypes: ["humanoid", "dwarf"],
  physicalTraitGeneratorConfigs: [
    {
      name: "hair",
      category: "hair",
      options: ["dark", "black", "russet", "brown", "red"],
      tags: ["hair"]
    },
    {
      name: "skin",
      category: "skin",
      options: ["grey", "blue-grey", "dark grey", "light grey"],
      tags: ["skin"]
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["black", "red", "dark", "amber"],
      tags: ["eyes"]
    }
  ],
  ageCategories: getHumanVariant(3),
  baseThreatLevel: 1,
  abilities: [
    {
      name: "darkvision",
      description: "can see in the dark",
      category: "senses",
      threatLevel: 1
    }
  ],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: getHumanVariant$1(1, 0.75),
  tags: ["corruptible", "duergar", "dwarf", "martial", "sentient"]
};
const dwarf = {
  name: "dwarf",
  pluralName: "dwarves",
  adjective: "dwarven",
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
    "underdark"
  ],
  creatureTypes: ["humanoid", "dwarf"],
  physicalTraitGeneratorConfigs: [
    {
      name: "hair",
      category: "hair",
      options: ["dark", "black", "russet", "brown", "red"],
      tags: ["hair"]
    },
    {
      name: "skin",
      category: "skin",
      options: ["grey", "blue-grey", "dark grey", "light grey"],
      tags: ["skin"]
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["black", "red", "dark", "amber"],
      tags: ["eyes"]
    }
  ],
  ageCategories: getHumanVariant(3),
  baseThreatLevel: 1,
  abilities: [
    {
      name: "darkvision",
      description: "can see in the dark",
      category: "senses",
      threatLevel: 1
    }
  ],
  commonality: 20,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: getHumanVariant$1(1, 0.75),
  tags: ["corruptible", "dwarf", "martial", "sentient"]
};
const elf = {
  name: "elf",
  pluralName: "elves",
  adjective: "elven",
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
    "underdark"
  ],
  creatureTypes: ["humanoid", "elf"],
  physicalTraitGeneratorConfigs: [
    {
      name: "hair",
      category: "hair",
      options: ["black", "blonde", "brown", "dark", "light", "red", "russet"],
      tags: ["hair"]
    },
    {
      name: "skin",
      category: "skin",
      options: ["tan", "light", "bronzed", "white", "pale"],
      tags: ["skin"]
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["blue", "green", "brown", "dark", "amber", "grey"],
      tags: ["eyes"]
    }
  ],
  ageCategories: getHumanVariant(7),
  baseThreatLevel: 1,
  abilities: [
    {
      name: "darkvision",
      description: "can see in the dark",
      category: "senses",
      threatLevel: 1
    },
    {
      name: "trance",
      description: "can meditate instead of sleeping",
      category: "senses",
      threatLevel: 1
    },
    {
      name: "immunity: sleep",
      description: "cannot be put to sleep by magic",
      category: "immunity",
      threatLevel: 1
    }
  ],
  commonality: 30,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: getHumanVariant$1(0.6, 0.9),
  tags: ["corruptible", "elf", "martial", "magic", "sentient"]
};
const firbolg = {
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
      tags: ["hair"]
    },
    {
      name: "skin",
      category: "skin",
      options: ["bronzed", "light", "pale", "tan", "white"],
      tags: ["skin"]
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["amber", "blue", "brown", "dark", "green"],
      tags: ["eyes"]
    }
  ],
  ageCategories: getHumanVariant(5),
  baseThreatLevel: 2,
  abilities: [
    {
      name: "minor invisibility",
      description: "can turn invisible when not attacking",
      category: "invisibility",
      threatLevel: 2
    }
  ],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: getHumanVariant$1(1.9, 1.8),
  tags: ["firbolg", "giant", "human", "martial", "magic", "sentient"]
};
const gnome = {
  name: "gnome",
  pluralName: "gnomes",
  adjective: "gnomish",
  breedType: "human",
  environments: [
    "arctic",
    "coastal",
    "desert",
    "forest",
    "grassland",
    "hill",
    "mountain",
    "urban"
  ],
  creatureTypes: ["humanoid", "gnome"],
  physicalTraitGeneratorConfigs: [
    {
      name: "hair",
      category: "hair",
      options: ["black", "blonde", "brown", "dark", "light", "red", "russet"],
      tags: ["hair"]
    },
    {
      name: "skin",
      category: "skin",
      options: ["bronzed", "light", "pale", "tan", "white"],
      tags: ["skin"]
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["amber", "blue", "brown", "dark", "green"],
      tags: ["eyes"]
    }
  ],
  ageCategories: getHumanVariant(5),
  baseThreatLevel: 1,
  abilities: [],
  commonality: 20,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: getHumanVariant$1(0.4, 0.4),
  tags: ["corruptible", "gnome", "martial", "magic", "sentient"]
};
const goblin = {
  name: "goblin",
  pluralName: "goblins",
  adjective: "goblin",
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
    "underdark"
  ],
  creatureTypes: ["humanoid", "goblinoid"],
  physicalTraitGeneratorConfigs: [
    {
      name: "hair",
      category: "hair",
      options: ["black", "blonde", "brown", "dark", "light", "red", "russet"],
      tags: ["hair"]
    },
    {
      name: "skin",
      category: "skin",
      options: ["green", "grey", "pale", "dark green", "brown"],
      tags: ["skin"]
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["amber", "red", "brown", "dark", "orange"],
      tags: ["eyes"]
    }
  ],
  ageCategories: getHumanVariant(1.15),
  baseThreatLevel: 1,
  abilities: [
    {
      name: "darkvision",
      description: "can see in the dark",
      category: "senses",
      threatLevel: 1
    }
  ],
  commonality: 15,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: getHumanVariant$1(0.5, 0.6),
  tags: ["goblin", "greenskin", "martial", "sentient"]
};
const halfling = {
  name: "halfling",
  pluralName: "halflings",
  adjective: "halfling",
  breedType: "human",
  environments: [
    "arctic",
    "coastal",
    "desert",
    "forest",
    "grassland",
    "hill",
    "mountain",
    "urban"
  ],
  creatureTypes: ["humanoid"],
  physicalTraitGeneratorConfigs: [
    {
      name: "hair",
      category: "hair",
      options: ["black", "blonde", "brown", "dark", "light", "red", "russet"],
      tags: ["hair"]
    },
    {
      name: "skin",
      category: "skin",
      options: ["bronzed", "light", "pale", "tan", "white"],
      tags: ["skin"]
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["amber", "blue", "brown", "dark", "green"],
      tags: ["eyes"]
    }
  ],
  ageCategories: getHumanVariant(1.5),
  baseThreatLevel: 1,
  abilities: [],
  commonality: 20,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: getHumanVariant$1(0.5, 0.6),
  tags: ["halfling", "sentient"]
};
const hobgoblin = {
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
    "underdark"
  ],
  creatureTypes: ["humanoid", "goblinoid"],
  physicalTraitGeneratorConfigs: [
    {
      name: "hair",
      category: "hair",
      options: ["black", "brown", "dark", "red", "russet"],
      tags: ["hair"]
    },
    {
      name: "skin",
      category: "skin",
      options: ["red", "dark grey", "grey", "russet", "bronze"],
      tags: ["skin"]
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["amber", "red", "brown", "dark", "yellow", "orange", "grey"],
      tags: ["eyes"]
    }
  ],
  ageCategories: getHumanVariant(0.8),
  baseThreatLevel: 2,
  abilities: [
    {
      name: "darkvision",
      description: "can see in the dark",
      category: "senses",
      threatLevel: 1
    }
  ],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: getHumanVariant$1(1.1, 1.15),
  tags: ["hobgoblin", "greenskin", "martial", "sentient"]
};
const human = {
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
      tags: ["hair"]
    },
    {
      name: "skin",
      category: "skin",
      options: ["black", "bronzed", "ebony", "light", "pale", "tan", "white"],
      tags: ["skin"]
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["amber", "blue", "brown", "dark", "green"],
      tags: ["eyes"]
    }
  ],
  ageCategories: humanStandard$1(),
  baseThreatLevel: 1,
  abilities: [],
  commonality: 200,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: humanStandard(),
  tags: ["corruptible", "human", "martial", "magic", "sentient"]
};
const orc = {
  name: "orc",
  pluralName: "orcs",
  adjective: "orc",
  breedType: "human",
  environments: ["arctic", "coastal", "desert", "forest", "grassland", "hill", "mountain", "urban", "underdark"],
  creatureTypes: ["humanoid", "goblinoid"],
  physicalTraitGeneratorConfigs: [
    {
      name: "hair",
      category: "hair",
      options: ["black", "brown", "dark", "red", "russet"],
      tags: ["hair"]
    },
    {
      name: "skin",
      category: "skin",
      options: ["black", "dark green", "dark grey", "grey", "light green", "green", "grey", "olive"],
      tags: ["skin"]
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["amber", "red", "brown", "dark", "yellow", "orange", "grey"],
      tags: ["eyes"]
    }
  ],
  ageCategories: getHumanVariant(0.8),
  baseThreatLevel: 1,
  abilities: [],
  commonality: 10,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: getHumanVariant$1(1.1, 1.15),
  tags: ["corruptible", "orc", "greenskin", "martial", "sentient"]
};
const hornLengths = ["short", "long"];
const hornTypes = ["curved", "straight", "curled", "spiraled"];
let hornAppearances = [];
for (let j = 0; j < hornTypes.length; j++) {
  for (let i = 0; i < hornLengths.length; i++) {
    hornAppearances.push(`${hornLengths[i]} and ${hornTypes[j]}`);
  }
  hornAppearances.push(hornTypes[j]);
}
const tiefling = {
  name: "tiefling",
  pluralName: "tieflings",
  adjective: "tiefling",
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
    "underdark"
  ],
  creatureTypes: ["humanoid", "demonic"],
  physicalTraitGeneratorConfigs: [
    {
      name: "hair",
      category: "hair",
      options: [
        "black",
        "brown",
        "dark",
        "red",
        "russet",
        "blue",
        "dark blue",
        "dark red",
        "dark purple",
        "purple"
      ],
      tags: ["hair"]
    },
    {
      name: "skin",
      category: "skin",
      options: [
        "tan",
        "light",
        "bronzed",
        "white",
        "pale",
        "red",
        "purple",
        "blue",
        "ochre",
        "yellow",
        "brown",
        "black"
      ],
      tags: ["skin"]
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["black", "red", "white", "silver", "gold", "blue", "green"],
      tags: ["eyes"]
    },
    {
      name: "horns",
      category: "horns",
      options: hornAppearances,
      tags: ["horns"]
    }
  ],
  ageCategories: getHumanVariant(1.2),
  baseThreatLevel: 1,
  abilities: [],
  commonality: 10,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: getHumanVariant$1(1.2, 1),
  tags: ["corruptible", "tiefling", "demonic", "martial", "magic", "sentient"]
};
const troll = {
  name: "troll",
  pluralName: "trolls",
  adjective: "troll",
  breedType: "giant",
  environments: [
    "arctic",
    "coastal",
    "desert",
    "forest",
    "grassland",
    "hill",
    "mountain",
    "urban",
    "underdark"
  ],
  creatureTypes: ["humanoid"],
  physicalTraitGeneratorConfigs: [
    {
      name: "hair",
      category: "hair",
      options: ["black", "brown", "dark", "red", "russet"],
      tags: ["hair"]
    },
    {
      name: "skin",
      category: "skin",
      options: ["black", "dark green", "dark grey", "grey", "light green", "green", "grey", "olive"],
      tags: ["skin"]
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["amber", "red", "brown", "dark", "yellow", "orange", "grey"],
      tags: ["eyes"]
    }
  ],
  ageCategories: getHumanVariant(0.8),
  baseThreatLevel: 3,
  abilities: [
    {
      name: "regeneration",
      description: "regenerate unless burned",
      category: "misc",
      threatLevel: 2
    }
  ],
  commonality: 8,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: getHumanVariant$1(1.4, 1.45),
  tags: ["corruptible", "troll", "greenskin", "martial", "sentient"]
};
const ghoul = {
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
      tags: ["fangs"]
    },
    {
      name: "skin",
      category: "skin",
      options: ["pale", "pallid", "grey", "light grey"],
      tags: ["skin"]
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["brown", "red", "yellow", "grey"],
      tags: ["eyes"]
    }
  ],
  ageCategories: [
    {
      name: "infant",
      noun: "baby",
      minAge: 0,
      maxAge: 1,
      genderedNoun: ["baby girl", "baby boy", "baby"],
      commonality: 1
    },
    { name: "child", noun: "child", minAge: 2, maxAge: 4, genderedNoun: ["girl", "boy", "child"], commonality: 2 },
    { name: "adult", noun: "adult", minAge: 5, maxAge: 30, genderedNoun: ["woman", "man", "adult"], commonality: 20 },
    {
      name: "elderly",
      noun: "elder",
      minAge: 31,
      maxAge: 45,
      genderedNoun: ["old woman", "old man", "elder"],
      commonality: 1
    }
  ],
  baseThreatLevel: 4,
  abilities: [],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: humanStandard(),
  // TODO: make real sizes
  tags: ["ghoul", "undead"]
};
const shadow = {
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
      tags: ["body"]
    }
  ],
  ageCategories: [
    {
      name: "infant",
      noun: "baby",
      minAge: 0,
      maxAge: 1,
      genderedNoun: ["baby girl", "baby boy", "baby"],
      commonality: 1
    },
    { name: "child", noun: "child", minAge: 2, maxAge: 4, genderedNoun: ["girl", "boy", "child"], commonality: 2 },
    { name: "adult", noun: "adult", minAge: 5, maxAge: 30, genderedNoun: ["woman", "man", "adult"], commonality: 20 },
    {
      name: "elderly",
      noun: "elder",
      minAge: 31,
      maxAge: 45,
      genderedNoun: ["old woman", "old man", "elder"],
      commonality: 1
    }
  ],
  abilities: [
    {
      name: "amorphous",
      description: "can squeeze through small spaces",
      category: "movement",
      threatLevel: 1
    },
    {
      name: "immunity: necrotic magic",
      description: "immune to necrotic magic",
      category: "immunity",
      threatLevel: 1
    },
    {
      name: "immunity: poison",
      description: "immune to poison",
      category: "immunity",
      threatLevel: 1
    },
    {
      name: "darkvision",
      description: "can see in the dark",
      category: "senses",
      threatLevel: 1
    },
    {
      name: "drain strength",
      description: "drains strength on melee attacks",
      category: "attack",
      threatLevel: 2
    }
  ],
  baseThreatLevel: 4,
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: humanStandard(),
  // TODO: make real sizes
  tags: ["shadow", "undead"]
};
const will_o_the_wisp = {
  name: "will o' the wisp",
  pluralName: "will o' the wisps",
  adjective: "will o' the wisp",
  breedType: "will o' the wisp",
  environments: ["forest", "swamp"],
  creatureTypes: ["undead"],
  physicalTraitGeneratorConfigs: [
    {
      name: "body",
      category: "body",
      options: ["glowing", "bright", "round", "ethereal"],
      tags: ["body"]
    }
  ],
  ageCategories: [
    {
      name: "infant",
      noun: "baby",
      minAge: 0,
      maxAge: 1,
      genderedNoun: ["baby girl", "baby boy", "baby"],
      commonality: 1
    },
    { name: "child", noun: "child", minAge: 2, maxAge: 4, genderedNoun: ["girl", "boy", "child"], commonality: 2 },
    { name: "adult", noun: "adult", minAge: 5, maxAge: 30, genderedNoun: ["woman", "man", "adult"], commonality: 20 },
    {
      name: "elderly",
      noun: "elder",
      minAge: 31,
      maxAge: 45,
      genderedNoun: ["old woman", "old man", "elder"],
      commonality: 1
    }
  ],
  baseThreatLevel: 1,
  abilities: [
    {
      name: "illumination",
      description: "glows with a bright light",
      category: "misc",
      threatLevel: 1
    },
    {
      name: "minor invisibility",
      description: "can become invisible unless attacking",
      category: "invisibility",
      threatLevel: 2
    }
  ],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } }
  ],
  sizeGeneratorConfigMatrix: humanStandard(),
  // TODO: make real sizes
  tags: ["will o' the wisp", "undead"]
};
const all$1 = [
  ape,
  axe_beak,
  baboon,
  badger,
  bat,
  bear,
  blink_dog,
  boar,
  camel,
  cat,
  cow,
  crocodile,
  dog,
  eagle,
  elk,
  goat,
  horse,
  lion,
  rat,
  snake,
  wolf,
  dretch,
  hell_hound,
  imp,
  lemure,
  quasit,
  dust_mephit,
  ice_mephit,
  magma_mephit,
  steam_mephit,
  aarakocra,
  aasimar,
  bugbear,
  centaur,
  dark_elf,
  deep_gnome,
  dragonborn,
  duergar,
  dwarf,
  elf,
  firbolg,
  gnome,
  goblin,
  halfling,
  hobgoblin,
  human,
  orc,
  tiefling,
  troll,
  fire_beetle,
  giant_ant,
  giant_bee,
  giant_beetle,
  giant_centipede,
  giant_dragonfly,
  giant_scorpion,
  giant_spider,
  cockatrice,
  darkmantle,
  gryfalcon,
  gryphon,
  harpy,
  hippogriff,
  owlbear,
  rust_monster,
  worg,
  black_pudding,
  blue_jelly,
  blue_slime,
  brown_pudding,
  gelatinous_cube,
  green_slime,
  grey_ooze,
  ochre_jelly,
  ghoul,
  shadow,
  will_o_the_wisp
];
function modify$2(species) {
  let result = JSON.parse(JSON.stringify(species));
  let modifierName = "skeletal";
  result.name = `${modifierName} ${result.name}`;
  result.pluralName = `${modifierName} ${result.pluralName}`;
  result.adjective = `${modifierName} ${result.adjective}`;
  result.abilities.push(
    {
      name: "immunity: piercing",
      description: "immune to piercing damage",
      category: "immunity",
      threatLevel: 1
    }
  );
  result.tags.push("skeleton");
  result.tags.push("undead");
  return result;
}
function modify$1(species) {
  let result = JSON.parse(JSON.stringify(species));
  let modifierName = "vampire";
  result.name = `${modifierName} ${result.name}`;
  result.pluralName = `${modifierName} ${result.pluralName}`;
  result.adjective = `${modifierName} ${result.adjective}`;
  let vampiricAbilities = [
    {
      name: "vampiric bite",
      description: "can bite others to drain their life force and heal itself",
      category: "attack",
      threatLevel: 2
    },
    {
      name: "vampiric charm",
      description: "can charm others to do its bidding",
      category: "attack",
      threatLevel: 3
    },
    {
      name: "shapeshift into animal",
      description: "can shapeshift into an animal",
      category: "shapeshift",
      threatLevel: 2
    },
    {
      name: "darkvision",
      description: "can see in darkness",
      category: "senses",
      threatLevel: 1
    },
    {
      name: "resistance: magic",
      description: "is resistant to magic",
      category: "resistance",
      threatLevel: 2
    },
    {
      name: "shapeshift into mist",
      description: "can shapeshift into mist",
      category: "shapeshift",
      threatLevel: 2
    }
  ];
  result.abilities = result.abilities.concat(vampiricAbilities);
  result.tags.push("vampire");
  result.tags.push("undead");
  return result;
}
function modify(species) {
  let result = JSON.parse(JSON.stringify(species));
  let modifierName = "zombie";
  result.name = `${modifierName} ${result.name}`;
  result.pluralName = `${modifierName} ${result.pluralName}`;
  result.adjective = `${modifierName} ${result.adjective}`;
  result.abilities.push(
    {
      name: "self-resurrection",
      description: "can resurrect itself unless the head is destroyed or removed",
      category: "self-resurrection",
      threatLevel: 3
    }
  );
  let newTags = [];
  for (let i = 0; i < result.tags.length; i++) {
    if (result.tags[i] != "sentient") {
      newTags.push(result.tags[i]);
    }
  }
  result.tags = newTags;
  result.abilities.push(
    {
      name: "zombification bite",
      description: "can bite others to transform them into zombies",
      category: "attack",
      threatLevel: 2
    }
  );
  result.tags.push("zombie");
  result.tags.push("undead");
  return result;
}
function byTag(tag, options) {
  let result = [];
  for (let i = 0; i < options.length; i++) {
    if (options[i].tags.includes(tag)) {
      result.push(options[i]);
    }
  }
  return result;
}
function getSkeletonVariants(options) {
  let result = [];
  for (let i = 0; i < options.length; i++) {
    let skeleton = modify$2(options[i]);
    result.push(skeleton);
  }
  return result;
}
function getVampireVariants(options) {
  let result = [];
  for (let i = 0; i < options.length; i++) {
    let vampire = modify$1(options[i]);
    result.push(vampire);
  }
  return result;
}
function getZombieVariants(options) {
  let result = [];
  for (let i = 0; i < options.length; i++) {
    let zombie = modify(options[i]);
    result.push(zombie);
  }
  return result;
}
function randomTraits(species) {
  let traits = [];
  for (let i = 0; i < species.physicalTraitGeneratorConfigs.length; i++) {
    const newTrait = generate$2(species.physicalTraitGeneratorConfigs[i]);
    traits.push(newTrait);
  }
  return traits;
}
function randomUniqueSet(options, count) {
  let result = [];
  options = RND.shuffle(options);
  if (options.length >= count) {
    for (let i = 0; i < count; i++) {
      let item = options.pop();
      if (item !== void 0) {
        result.push(item);
      }
    }
  } else {
    throw new Error("Not enough options to choose from.");
  }
  return result;
}
function randomWeighted(options) {
  return RND.weighted(options);
}
function sentient() {
  return byTag("sentient", all$1);
}
function withCreatureType(creatureType, options) {
  let result = [];
  for (let i = 0; i < options.length; i++) {
    if (options[i].creatureTypes.includes(creatureType)) {
      result.push(options[i]);
    }
  }
  return result;
}
function withoutTag(tag, options) {
  let result = [];
  for (let i = 0; i < options.length; i++) {
    if (!options[i].tags.includes(tag)) {
      result.push(options[i]);
    }
  }
  return result;
}
function all() {
  return [
    {
      name: "aggressiveness",
      score: 0,
      descriptor: "",
      negativeDescriptor: "passive",
      positiveDescriptor: "belligerent"
    },
    { name: "altruism", score: 0, descriptor: "", negativeDescriptor: "selfish", positiveDescriptor: "selfless" },
    { name: "bravery", score: 0, descriptor: "", negativeDescriptor: "cowardly", positiveDescriptor: "brave" },
    {
      name: "competitiveness",
      score: 0,
      descriptor: "",
      negativeDescriptor: "cooperative",
      positiveDescriptor: "competitive"
    },
    { name: "confidence", score: 0, descriptor: "", negativeDescriptor: "uncertain", positiveDescriptor: "confident" },
    {
      name: "creativity",
      score: 0,
      descriptor: "",
      negativeDescriptor: "unimaginative",
      positiveDescriptor: "creative"
    },
    { name: "eloquence", score: 0, descriptor: "", negativeDescriptor: "plain-spoken", positiveDescriptor: "eloquent" },
    { name: "friendliness", score: 0, descriptor: "", negativeDescriptor: "aloof", positiveDescriptor: "friendly" },
    { name: "honesty", score: 0, descriptor: "", negativeDescriptor: "dishonest", positiveDescriptor: "honest" },
    {
      name: "industriousness",
      score: 0,
      descriptor: "",
      negativeDescriptor: "lazy",
      positiveDescriptor: "hard-working"
    },
    { name: "intelligence", score: 0, descriptor: "", negativeDescriptor: "stupid", positiveDescriptor: "smart" },
    { name: "kindness", score: 0, descriptor: "", negativeDescriptor: "cruel", positiveDescriptor: "kind" },
    { name: "loyalty", score: 0, descriptor: "", negativeDescriptor: "disloyal", positiveDescriptor: "loyal" },
    { name: "optimism", score: 0, descriptor: "", negativeDescriptor: "pessimistic", positiveDescriptor: "optimistic" },
    { name: "politeness", score: 0, descriptor: "", negativeDescriptor: "rude", positiveDescriptor: "polite" },
    {
      name: "thoughtfulness",
      score: 0,
      descriptor: "",
      negativeDescriptor: "unthinking",
      positiveDescriptor: "thoughtful"
    },
    { name: "tolerance", score: 0, descriptor: "", negativeDescriptor: "intolerant", positiveDescriptor: "tolerant" },
    { name: "wisdom", score: 0, descriptor: "", negativeDescriptor: "foolish", positiveDescriptor: "wise" }
  ];
}
function generate$1(config) {
  let traits = [];
  RND.shuffle(config.traits);
  for (let i = 0; i < config.numberOfPositiveTraits; i++) {
    let trait = config.traits.pop();
    if (trait === void 0) {
      throw new Error("Personality trait is undefined.");
    }
    trait.score = random.int(1, 50);
    trait.descriptor = trait.positiveDescriptor;
    traits.push(trait);
  }
  for (let i = 0; i < config.numberOfNegativeTraits; i++) {
    let trait = config.traits.pop();
    if (trait === void 0) {
      throw new Error("Personality trait is undefined.");
    }
    trait.score = random.int(-50, -1);
    trait.descriptor = trait.negativeDescriptor;
    traits.push(trait);
  }
  return traits;
}
function getHonorific$1(gender, title) {
  if (gender === "female") {
    return title.femaleHonorific;
  }
  return title.maleHonorific;
}
function describe(character) {
  let description = "";
  const sbj = character.gender.pronouns.subjective;
  const ucSbj = Words.capitalize(sbj);
  const genderNoun = character.ageCategory.noun;
  const height = character.height + " cm (" + inchesToFeetExpression(cmToInches(character.height)) + ")";
  const weight = character.weight + " kg (" + Math.round(kgToPounds(character.weight)) + " lb.)";
  const spPhrase = character.species.adjective + " " + genderNoun;
  const traits = Words.arrayToPhrase(describeTraits(character));
  description = RND.item([
    `${character.firstName} ${character.lastName} is a ${height} tall ${spPhrase}. ${ucSbj} is ${character.age} years old. ${character.firstName} has ${traits}. `,
    `${character.firstName} is ${Words.article(spPhrase)} ${spPhrase} of ${character.age} years. ${ucSbj} is ${height} tall and weighs ${weight}. ${ucSbj} has ${traits}. `
  ]);
  description += describePersonality(character) + ".";
  return description;
}
function describePersonality(character) {
  let traits = [];
  for (let i = 0; i < character.personalityTraits.length; i++) {
    traits.push(character.personalityTraits[i].descriptor);
  }
  let description = Words.capitalize(character.gender.pronouns.subjective) + " is " + Words.arrayToPhrase(traits);
  return description;
}
function describeTraits(character) {
  let traits = [];
  for (let i = 0; i < character.physicalTraits.length; i++) {
    traits.push(character.physicalTraits[i].description);
  }
  return traits;
}
function generate(config) {
  const species = RND.weighted(config.speciesOptions);
  const genderName = RND.item(config.genderNameOptions);
  let gender = species.genders.find((g) => g.name === genderName);
  const ageCategory = randomWeighted$1(config.ageCategoryNames, species.ageCategories);
  let familyNameGenerator = config.familyNameGenerator;
  let femaleNameGenerator = config.femaleNameGenerator;
  let maleNameGenerator = config.maleNameGenerator;
  if (config.useAdaptiveNames) {
    let speciesNameGenerator;
    try {
      speciesNameGenerator = MUN.getSetByName(species.name, MUN.allSets());
    } catch (e) {
      speciesNameGenerator = new MUN.FantasySet();
    }
    familyNameGenerator = speciesNameGenerator.family;
    femaleNameGenerator = speciesNameGenerator.female;
    maleNameGenerator = speciesNameGenerator.male;
  }
  let firstNames = [];
  const lastNames = familyNameGenerator.generate(30);
  if (gender.name === "female") {
    firstNames = femaleNameGenerator.generate(30);
  } else {
    firstNames = maleNameGenerator.generate(30);
  }
  const age = random.int(ageCategory.minAge, ageCategory.maxAge);
  const sizeGeneratorConfig = getSizeConfig(
    gender.name,
    ageCategory.name,
    species.sizeGeneratorConfigMatrix
  );
  const height = random.int(sizeGeneratorConfig.minHeight, sizeGeneratorConfig.maxHeight);
  const weight = random.int(sizeGeneratorConfig.minWeight, sizeGeneratorConfig.maxWeight);
  const personalityTraits = getRandomPersonality();
  let physicalTraits = randomTraits(species);
  if (config.physicalTraitOverrides.length > 0) {
    physicalTraits = config.physicalTraitOverrides;
  }
  const firstName = RND.item(firstNames);
  const lastName = RND.item(lastNames);
  const name = `${firstName} ${lastName}`;
  const titles = [];
  let abilities = species.abilities;
  let threatLevel = species.baseThreatLevel;
  for (let i = 0; i < abilities.length; i++) {
    threatLevel += abilities[i].threatLevel;
  }
  let character = {
    name,
    firstName,
    lastName,
    heraldry: null,
    carried: [],
    threatLevel,
    abilities,
    traits: [],
    titles,
    species,
    age,
    height,
    weight,
    personalityTraits,
    physicalTraits,
    description: "",
    summary: "",
    gender,
    archetype: blank,
    statBlock: null,
    ageCategory,
    status: "alive",
    tags: []
  };
  character.description = describe(character);
  return character;
}
function getDefaultCharacterGeneratorConfig() {
  const nameSet = new MUN.FantasySet();
  return {
    speciesOptions: [],
    ageCategoryNames: ["adult"],
    familyNameGenerator: nameSet.family,
    femaleNameGenerator: nameSet.female,
    maleNameGenerator: nameSet.male,
    genderNameOptions: ["female", "male"],
    useAdaptiveNames: false,
    physicalTraitOverrides: []
  };
}
function getHonorific(character) {
  let primaryTitle = getPrimaryTitle(character);
  if (primaryTitle) {
    return getHonorific$1(character.gender.name, primaryTitle);
  }
  return "";
}
function getPrimaryTitle(character) {
  let highestPrecedence = 100;
  let primaryTitle = null;
  for (let i = 0; i < character.titles.length; i++) {
    if (character.titles[i].precedence < highestPrecedence) {
      highestPrecedence = character.titles[i].precedence;
      primaryTitle = character.titles[i];
    }
  }
  return primaryTitle;
}
function getRandomPersonality() {
  const numberOfPositiveTraits = random.int(1, 2);
  const numberOfNegativeTraits = random.int(0, 1);
  const genConfig = {
    numberOfNegativeTraits,
    numberOfPositiveTraits,
    traits: all()
  };
  return generate$1(genConfig);
}
function getTotalThreatLevel(character) {
  let totalThreatLevel = character.species.baseThreatLevel;
  for (let i = 0; i < character.abilities.length; i++) {
    totalThreatLevel += character.abilities[i].threatLevel;
  }
  return totalThreatLevel;
}
export {
  getVampireVariants as a,
  getZombieVariants as b,
  generate as c,
  getTotalThreatLevel as d,
  all$1 as e,
  byName as f,
  getSkeletonVariants as g,
  withCreatureType as h,
  byTag as i,
  randomUniqueSet as j,
  describe as k,
  human as l,
  getDefaultCharacterGeneratorConfig as m,
  randomWeighted as n,
  getHonorific as o,
  randomTraits as r,
  sentient as s,
  withoutTag as w
};
//# sourceMappingURL=characters.js.map
