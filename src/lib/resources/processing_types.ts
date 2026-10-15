import type { FoodInputUse, ProductFoodPolicy } from './raw_source_types';
export type ProcessingInputRole = 'material' | 'fuel' | 'water';
export type RecipeInputSelector =
  | { kind: 'raw'; majorType: string; minorTypes: string[]; resourceNames: string[] }
  | { kind: 'product'; productKey: string }
  | { kind: 'raw-resource'; rawResourceIds: string[] }
  | { kind: 'settlement-water' };
export type RecipeInput = {
  role: ProcessingInputRole;
  foodUse?: FoodInputUse;
  selector: RecipeInputSelector;
};
export type ProcessingRecipe = {
  id: string;
  food?: ProductFoodPolicy;
  context?: ProductContext;
  reviewRefs?: string[];
  reviewNote?: string;
  family: string;
  outputKey: string;
  outputName: string;
  technique: string;
  requirements: string[];
  inputs: RecipeInput[];
};

export type ProcessingProductUse =
  | 'cloth'
  | 'thread'
  | 'cordage'
  | 'leather'
  | 'wood-construction'
  | 'masonry'
  | 'roofing'
  | 'container'
  | 'furniture'
  | 'fuel'
  | 'hand-tool'
  | 'weapon-component'
  | 'armor-component'
  | 'cookware'
  | 'writing-material'
  | 'lighting'
  | 'cleaning'
  | 'pigment'
  | 'dye'
  | 'ornament'
  | 'preserved-food'
  | 'prepared-food'
  | 'beverage'
  | 'food-ingredient';
export type ProductContext = { uses: ProcessingProductUse[]; craftLabel: string | null };
export type ProcessingTechniqueDefinition = {
  technique: string;
  reviewRefs: string[];
  reviewNote: string;
};
