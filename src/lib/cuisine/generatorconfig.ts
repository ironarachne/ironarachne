import type { FoodComponent } from './component.js';

export type CuisineGeneratorConfig = {
  possibleSeasonings: FoodComponent[];
  possibleComplements: FoodComponent[];
  possibleMainComponents: FoodComponent[];
  possibleCookingMethods: string[];
  possibleDrinks: string[];
};

export function getDefaultConfig(): CuisineGeneratorConfig {
  // TODO: Populate the below using components.ts
  return {
    possibleSeasonings: [],
    possibleComplements: [],
    possibleMainComponents: [],
    possibleCookingMethods: [],
    possibleDrinks: [],
  };
}
