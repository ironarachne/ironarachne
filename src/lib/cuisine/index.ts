export { default as Cuisine } from './cuisine';
export { default as CuisineGenerator } from './generator';
export { default as CuisineGeneratorConfig } from './generatorconfig';
export { default as DrinkType } from './drinktype';
export { default as FoodComponent } from './component';
export * from './drink';
export * from './food';
// Both tables export `all`, so neither can be starred without the other name disappearing.
export * as components from './components';
export * as drinkTypes from './drinktypes';
