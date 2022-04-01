'use strict';

export default class Ingredient {
  name: string;
  dominantFlavor: string;
  supportingFlavor: string;
  ingredientType: string;

  constructor(name: string, dominantFlavor: string, supportingFlavor: string, ingredientType: string) {
    this.name = name;
    this.dominantFlavor = dominantFlavor;
    this.supportingFlavor = supportingFlavor;
    this.ingredientType = ingredientType;
  }
}
