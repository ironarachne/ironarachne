"use strict";

import * as MUN from "@ironarachne/made-up-names";
import * as AgeCategories from "../age/agecategories.js";
import type Item from "../equipment/item.js";
import Gender from "../gender.js";
import PhysicalTraitGenerator from "../physicaltraits/generator.js";
import type StatBlock from "../statblock.js";
import type Species from "./species.js";

export default class Halfling implements Species {
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
    this.name = "halfling";
    this.abilities = [];
    this.tags = ["halfling", "sentient"];
    this.nameGeneratorSet = new MUN.HalflingSet();
    this.carried = [];
    this.statBlock = null;
    this.pluralName = "halflings";
    this.adjective = "halfling";
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
        ["black", "blonde", "brown", "dark", "light", "red", "russet"],
        ["hair"],
      ),
      new PhysicalTraitGenerator(
        "skin",
        "skin",
        ["bronzed", "light", "pale", "tan", "white"],
        ["skin"],
      ),
      new PhysicalTraitGenerator(
        "eyes",
        "eyes",
        ["amber", "blue", "brown", "dark", "green"],
        ["eyes"],
      ),
    ];
    this.genders = [
      new Gender(
        "female",
        "she",
        "her",
        "her",
        150,
        AgeCategories.getHumanVariant(1.5, 0.5, 0.6, "female"),
      ),
      new Gender(
        "male",
        "he",
        "him",
        "his",
        150,
        AgeCategories.getHumanVariant(1.5, 0.5, 0.6, "male"),
      ),
    ];
  }
}
