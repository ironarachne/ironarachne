import FoodComponent from "./component.js";

export default class CuisineGeneratorConfig {
  possibleSeasonings: FoodComponent[];
  possibleComplements: FoodComponent[];
  possibleMainComponents: FoodComponent[];
  possibleCookingMethods: string[];
  possibleDrinks: string[];

  constructor() {
    this.possibleSeasonings = [];
    this.possibleComplements = [];
    this.possibleMainComponents = [];
    this.possibleCookingMethods = [];
    this.possibleDrinks = [];

    // TODO: Populate the above using components.ts
  }
}
