"use strict";

import SettlementCategory from "./category";

export default class Village extends SettlementCategory {
  constructor() {
    super();
    this.name = "village";
    this.minSize = 50;
    this.maxSize = 499;
    this.sizeClass = "small";
    this.possibleDescriptions = [
      "There is a single inn, a blacksmith, and a few houses in town, with farms surrounding it.",
      "This is a dense collection of farms with a number of communal buildings in the center.",
      "A knot of communal buildings marks the center of this village, with farms radiating out in a rough circle around it.",
    ];
  }
}
