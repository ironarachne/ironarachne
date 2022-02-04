"use strict";

import SettlementCategory from "./category";

export default class Town extends SettlementCategory {
  constructor() {
    super();
    this.name = "town";
    this.minSize = 500;
    this.maxSize = 9999;
    this.sizeClass = "medium";
    this.possibleDescriptions = [
      "There are multiple inns and taverns here. Several merchants have permanent stores.",
      "There is a city hall, a town square, and a number of stores and shops.",
      "Many farms surround a dense core of community buildings here.",
    ];
  }
}
