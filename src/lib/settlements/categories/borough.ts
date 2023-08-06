"use strict";

import SettlementCategory from "./category.js";

export default class Borough extends SettlementCategory {
  constructor() {
    super();
    this.name = "borough";
    this.minSize = 10000;
    this.maxSize = 19999;
    this.sizeClass = "medium";
    this.possibleDescriptions = [
      "The buildings here are tall and tightly packed together, with narrow streets winding between them.",
      "This borough is divided into several distinct districts, each with its own unique architecture and atmosphere.",
      "The center of this borough is dominated by a massive marketplace, surrounded by a ring of shops and residences.",
      "There are many factories and mills in this borough, with tall chimneys belching smoke into the air.",
      "The buildings here are mostly made of stone or brick, and are quite ornate and impressive.",
      "The streets of this borough are lined with small shops and stalls, selling all manner of goods.",
      "There are many parks and gardens scattered throughout this borough, offering a welcome respite from the hustle and bustle of city life.",
      "The buildings here are a mix of old and new, with modern high-rises standing next to ancient, crumbling ruins.",
      "This borough is known for its grand architecture, with many magnificent cathedrals and government buildings.",
    ];
  }
}
