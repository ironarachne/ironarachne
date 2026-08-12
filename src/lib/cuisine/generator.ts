import type { Cuisine } from './cuisine.js';
import type { CuisineGeneratorConfig } from './generatorconfig.js';

export function generate(_config: CuisineGeneratorConfig): Cuisine {
  // TODO: Generate cuisine from the config
  return {
    commonDishes: [],
    commonSeasonings: [],
    commonVegetables: [],
    commonMainComponents: [],
    commonCookingMethods: [],
    commonDrinks: [],
  };
}
