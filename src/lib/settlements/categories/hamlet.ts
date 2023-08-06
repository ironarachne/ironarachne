"use strict";

import SettlementCategory from "./category.js";

export default class Hamlet extends SettlementCategory {
  constructor() {
    super();
    this.name = "hamlet";
    this.minSize = 10;
    this.maxSize = 49;
    this.sizeClass = "small";
    this.possibleDescriptions = [
      "Buildings here are scattered and small, with thatched roofs and walls of rough-hewn timber.",
      "The farms here are clustered together, their fields carefully tended and surrounded by low stone walls.",
      "There are only a handful of farms scattered around a single community building here, which serves as the center of local life.",
      "The hamlet is surrounded by wilderness, with a few clearings where buildings and fields have been established.",
      "The buildings in the hamlet are simple but sturdy, with chimneys belching smoke into the crisp morning air.",
      "This hamlet is situated on a hilltop, with commanding views of the surrounding countryside.",
      "The hamlet consists of a small cluster of houses and barns, with a narrow dirt road leading off into the distance.",
      "There is a small stream running through the hamlet, providing water for the villagers and their crops.",
    ];
  }
}
