"use strict";

import * as MUN from "@ironarachne/made-up-names";
import * as AgeCategories from "../age/agecategories.js";
import type Item from "../equipment/item.js";
import Gender from "../gender.js";
import PhysicalTraitGenerator from "../physicaltraits/generator.js";
import type StatBlock from "../statblock.js";
import type Species from "./species.js";

export default class Gnome implements Species {
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
    this.name = "gnome";
    this.abilities = [];
    this.tags = ["corruptible", "gnome", "sentient", "magic"];
    this.nameGeneratorSet = new MUN.GnomeSet();
    this.carried = [];
    this.statBlock = null;
    this.pluralName = "gnomes";
    this.adjective = "gnomish";
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
        500,
        AgeCategories.getHumanVariant(5, 0.4, 0.4, "female"),
      ),
      new Gender(
        "male",
        "he",
        "him",
        "his",
        500,
        AgeCategories.getHumanVariant(5, 0.5, 0.4, "male"),
      ),
    ];
  }
}
