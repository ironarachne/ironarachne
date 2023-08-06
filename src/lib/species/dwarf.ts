"use strict";

import * as MUN from "@ironarachne/made-up-names";
import * as AgeCategories from "../age/agecategories.js";
import type Item from "../equipment/item.js";
import Gender from "../gender.js";
import PhysicalTraitGenerator from "../physicaltraits/generator.js";
import type StatBlock from "../statblock.js";
import type Species from "./species.js";

export default class Dwarf implements Species {
  name: string;
  nameGeneratorSet: MUN.GeneratorSet;
  pluralName: string;
  description: string;
  summary: string;
  adjective: string;
  commonality: number;
  environments: string[];
  carried: Item[];
  statBlock: StatBlock | null;
  creatureTypes: string[];
  physicalTraitGenerators: PhysicalTraitGenerator[];
  genders: Gender[];
  abilities: string[];
  tags: string[];
  threatLevel: number;

  constructor() {
    this.name = "dwarf";
    this.abilities = [];
    this.tags = ["corruptible", "dwarf", "martial", "sentient"];
    this.nameGeneratorSet = new MUN.DwarfSet();
    this.carried = [];
    this.statBlock = null;
    this.pluralName = "dwarves";
    this.adjective = "dwarven";
    this.commonality = 20;
    this.environments = [
      "arctic",
      "coastal",
      "desert",
      "forest",
      "grassland",
      "hill",
      "mountain",
      "urban",
      "underdark",
    ];
    this.creatureTypes = ["humanoid"];
    this.threatLevel = 1;
    this.physicalTraitGenerators = [
      new PhysicalTraitGenerator(
        "hair",
        "hair",
        ["dark", "black", "russet", "brown", "red"],
        ["hair"],
      ),
      new PhysicalTraitGenerator("skin", "skin", ["tan", "bronzed", "ruddy"], ["skin"]),
      new PhysicalTraitGenerator("eyes", "eyes", ["green", "brown", "dark", "amber"], ["eyes"]),
    ];
    this.genders = [
      new Gender(
        "female",
        "she",
        "her",
        "her",
        300,
        AgeCategories.getHumanVariant(3, 0.9, 0.75, "female"),
      ),
      new Gender(
        "male",
        "he",
        "him",
        "his",
        300,
        AgeCategories.getHumanVariant(3, 1, 0.75, "male"),
      ),
    ];
  }
}
