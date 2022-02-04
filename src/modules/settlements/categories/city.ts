"use strict";

import SettlementCategory from "./category";

export default class City extends SettlementCategory {
  constructor() {
    super();
    this.name = "city";
    this.minSize = 20000;
    this.maxSize = 49999;
    this.sizeClass = "large";
    this.possibleDescriptions = [
      "This city is organized like a wheel, with a central hub of community buildings, and shops and residences radiating out from there.",
      "The walls of this city create a formidable barrier between it and the rest of the world.",
      "The buildings in this city are larger and more ornate in the center, with smaller residences and shops surrounding it.",
      "There are multiple districts here with clearly defined purposes.",
    ];
  }
}
