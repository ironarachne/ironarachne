"use strict";

import SettlementCategory from "./category.js";

export default class City extends SettlementCategory {
  constructor() {
    super();
    this.name = "city";
    this.minSize = 20000;
    this.maxSize = 49999;
    this.sizeClass = "large";
    this.possibleDescriptions = [
      "This city is built around a grand castle, with towers that pierce the sky and walls that have withstood the test of time.",
      "The streets of this city are lined with buildings of every shape and size, from towering spires to humble cottages.",
      "This city is a marvel of engineering, with aqueducts, bridges, and tunnels that connect its various districts.",
      "The buildings in this city are a testament to the skill and artistry of its craftsmen, with intricate carvings and decorations adorning their facades.",
      "This city is surrounded by a sturdy wall, with guard towers and gates that keep out unwanted visitors.",
      "The center of this city is dominated by a grand cathedral, with stained-glass windows and soaring arches that inspire awe in all who see them.",
      "The main square of this city is a bustling hub of activity, with market stalls and street performers vying for attention.",
      "The winding alleys of this city are lit by lanterns at night, creating a mysterious and romantic atmosphere.",
      "This city is a patchwork of different architectural styles, with each district showcasing its own unique character and flair.",
    ];
  }
}
