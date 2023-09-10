import type AgeCategory from "$lib/age/age_category";
import type SizeGeneratorConfig from "./size_generator_config";
import * as Sizes from "./sizes";

export type SizeMatrix = SizeMatrixRow[];

export type SizeMatrixRow = {
  gender: string;
  entries: SizeMatrixEntry[];
};

export type SizeMatrixEntry = {
  ageCategoryName: string;
  sizeGeneratorConfig: SizeGeneratorConfig;
};

export type SizeAgeSummary = {
  genderName: string;
  ageCategoryName: string;
  minAge: number;
  maxAge: number;
  minHeight: number;
  maxHeight: number;
  heightRange: string;
  minWeight: number;
  maxWeight: number;
  weightRange: string;
};

export function convertMatrixToSummary(
  matrix: SizeMatrix,
  ageCategories: AgeCategory[],
  gender: string,
): SizeAgeSummary[] {
  let result = [];

  for (let i = 0; i < matrix.length; i++) {
    if (matrix[i].gender == gender) {
      for (let j = 0; j < matrix[i].entries.length; j++) {
        let minAge;
        let maxAge;

        for (let x = 0; x < ageCategories.length; x++) {
          if (ageCategories[x].name == matrix[i].entries[j].ageCategoryName) {
            minAge = ageCategories[x].minAge;
            maxAge = ageCategories[x].maxAge;
          }
        }
        result.push({
          genderName: gender,
          ageCategoryName: matrix[i].entries[j].ageCategoryName,
          minAge: minAge || 0,
          maxAge: maxAge || 0,
          minHeight: matrix[i].entries[j].sizeGeneratorConfig.minHeight,
          maxHeight: matrix[i].entries[j].sizeGeneratorConfig.maxHeight,
          heightRange: Sizes.getHeightRange(matrix[i].entries[j].sizeGeneratorConfig),
          minWeight: matrix[i].entries[j].sizeGeneratorConfig.minWeight,
          maxWeight: matrix[i].entries[j].sizeGeneratorConfig.maxWeight,
          weightRange: Sizes.getWeightRange(matrix[i].entries[j].sizeGeneratorConfig),
        });
      }
    }
  }

  return result;
}

export function getSizeConfig(gender: string, ageCategory: string, sizeMatrix: SizeMatrix): SizeGeneratorConfig {
  for (let i = 0; i < sizeMatrix.length; i++) {
    if (sizeMatrix[i].gender == gender) {
      for (let j = 0; j < sizeMatrix[i].entries.length; j++) {
        if (sizeMatrix[i].entries[j].ageCategoryName == ageCategory) {
          return sizeMatrix[i].entries[j].sizeGeneratorConfig;
        }
      }
    }
  }

  throw new Error(`Failed to find size config for ${gender} and ${ageCategory}`);
}
