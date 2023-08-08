"use strict";

import * as MUN from "@ironarachne/made-up-names";
import * as AgeCategories from "../age/agecategories.js";
import type Item from "../equipment/item.js";
import Gender from "../gender.js";
import PhysicalTraitGenerator from "../physicaltraits/generator.js";
import type StatBlock from "../statblock.js";
import type Species from "./species.js";

export default class HighElf implements Species {
  name: string;
  nameGeneratorSet: MUN.GeneratorSet;
  pluralName: string;
  adjective: string;
  description: string;
  summary: string;
  commonality: number;
  carried: Item[];
  statBlock: StatBlock | null;
  environments: string[];
  creatureTypes: string[];
  physicalTraitGenerators: PhysicalTraitGenerator[];
  genders: Gender[];
  abilities: string[];
  tags: string[];
  threatLevel: number;

  constructor() {
    this.name = "elf";
    this.abilities = [];
    this.tags = ["high elf", "elf", "martial", "magic", "sentient"];
    this.nameGeneratorSet = new MUN.ElfSet();
    this.description = "";
    this.summary = "";
    this.carried = [];
    this.statBlock = null;
    this.pluralName = "high elves";
    this.adjective = "high elven";
    this.commonality = 30;
    this.environments = [
      "arctic",
      "coastal",
      "desert",
      "forest",
      "grassland",
      "hill",
      "mountain",
      "urban",
    ];
    this.creatureTypes = ["humanoid"];
    this.threatLevel = 1;
    this.physicalTraitGenerators = [
      new PhysicalTraitGenerator(
        "hair",
        "hair",
        ["black", "blonde", "brown", "dark", "light", "red", "russet"],
        ["hair"],
      ),
      new PhysicalTraitGenerator(
        "skin",
        "skin",
        ["tan", "light", "bronzed", "white", "pale"],
        ["skin"],
      ),
      new PhysicalTraitGenerator(
        "eyes",
        "eyes",
        ["blue", "green", "brown", "dark", "amber", "grey"],
        ["eyes"],
      ),
    ];
    this.genders = [
      new Gender(
        "female",
        "she",
        "her",
        "her",
        700,
        AgeCategories.getHumanVariant(7, 0.6, 0.9, "female"),
      ),
      new Gender(
        "male",
        "he",
        "him",
        "his",
        700,
        AgeCategories.getHumanVariant(7, 0.6, 0.95, "male"),
      ),
    ];
  }
}
