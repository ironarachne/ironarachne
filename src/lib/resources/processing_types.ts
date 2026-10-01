export type ProcessingInputRole = 'material' | 'fuel' | 'water';
export type RecipeInputSelector =
  | { kind: 'raw'; majorType: string; minorTypes: string[]; resourceNames: string[] }
  | { kind: 'product'; productKey: string };
export type RecipeInput = { role: ProcessingInputRole; selector: RecipeInputSelector };
export type ProcessingRecipe = {
  id: string;
  family: string;
  outputKey: string;
  outputName: string;
  technique: string;
  requirements: string[];
  inputs: RecipeInput[];
};
