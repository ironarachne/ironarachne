"use strict";

import SettlementCategory from "./category";

export default class Metropolis extends SettlementCategory {
  constructor() {
    super();
    this.name = "metropolis";
    this.minSize = 50000;
    this.maxSize = 3000000;
    this.sizeClass = "large";
    this.possibleDescriptions = [
      "This metropolis is vast and sprawling, with many different districts of varying prosperity and character.",
      "The outer districts of this metropolis are filled with inns and taverns of all descriptions and traders are constantly arriving.",
      "Despite the vast size of this metropolis, it's comprised of many smaller, tight-knit communities that each have their own character and customs.",
    ];
  }
}
