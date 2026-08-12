import type { SizeMatrix } from './size_matrix';

/**
 * The baseline human size matrix: height, weight, length and mass ranges per gender and age
 * category. Most species reuse it directly, and `getHumanVariant` scales a fresh copy of it.
 *
 * Shared and read-only. The one place a species' matrix is written to — `averageSizes` in
 * `species/common.ts` — deep-clones it first.
 */
export const HUMAN_STANDARD_SIZE_MATRIX: SizeMatrix = [
  {
    gender: 'female',
    entries: [
      {
        ageCategoryName: 'infant',
        sizeGeneratorConfig: {
          minHeight: 49,
          maxHeight: Math.floor(49 * 1.05),
          minWeight: 2,
          maxWeight: Math.floor(2 * 1.05),
          minLength: 0,
          maxLength: 0,
          minMass: 0,
          maxMass: 0,
        },
      },
      {
        ageCategoryName: 'toddler',
        sizeGeneratorConfig: {
          minHeight: 80,
          maxHeight: Math.floor(80 * 1.05),
          minWeight: 14,
          maxWeight: Math.floor(14 * 1.05),
          minLength: 0,
          maxLength: 0,
          minMass: 0,
          maxMass: 0,
        },
      },
      {
        ageCategoryName: 'young child',
        sizeGeneratorConfig: {
          minHeight: 115,
          maxHeight: Math.floor(115 * 1.05),
          minWeight: 19,
          maxWeight: Math.floor(19 * 1.05),
          minLength: 0,
          maxLength: 0,
          minMass: 0,
          maxMass: 0,
        },
      },
      {
        ageCategoryName: 'child',
        sizeGeneratorConfig: {
          minHeight: 149,
          maxHeight: Math.floor(149 * 1.05),
          minWeight: 20,
          maxWeight: Math.floor(20 * 1.05),
          minLength: 0,
          maxLength: 0,
          minMass: 0,
          maxMass: 0,
        },
      },
      {
        ageCategoryName: 'teenager',
        sizeGeneratorConfig: {
          minHeight: 158,
          maxHeight: Math.floor(158 * 1.05),
          minWeight: 57,
          maxWeight: Math.floor(57 * 1.05),
          minLength: 0,
          maxLength: 0,
          minMass: 0,
          maxMass: 0,
        },
      },
      {
        ageCategoryName: 'adult',
        sizeGeneratorConfig: {
          minHeight: 160,
          maxHeight: Math.floor(160 * 1.05),
          minWeight: 64,
          maxWeight: Math.floor(64 * 1.05),
          minLength: 0,
          maxLength: 0,
          minMass: 0,
          maxMass: 0,
        },
      },
      {
        ageCategoryName: 'elderly',
        sizeGeneratorConfig: {
          minHeight: 155,
          maxHeight: Math.floor(155 * 1.05),
          minWeight: 60,
          maxWeight: Math.floor(60 * 1.05),
          minLength: 0,
          maxLength: 0,
          minMass: 0,
          maxMass: 0,
        },
      },
    ],
  },
  {
    gender: 'male',
    entries: [
      {
        ageCategoryName: 'infant',
        sizeGeneratorConfig: {
          minHeight: 50,
          maxHeight: Math.floor(50 * 1.05),
          minWeight: 2,
          maxWeight: Math.floor(2 * 1.05),
          minLength: 0,
          maxLength: 0,
          minMass: 0,
          maxMass: 0,
        },
      },
      {
        ageCategoryName: 'toddler',
        sizeGeneratorConfig: {
          minHeight: 85,
          maxHeight: Math.floor(85 * 1.05),
          minWeight: 14,
          maxWeight: Math.floor(14 * 1.05),
          minLength: 0,
          maxLength: 0,
          minMass: 0,
          maxMass: 0,
        },
      },
      {
        ageCategoryName: 'young child',
        sizeGeneratorConfig: {
          minHeight: 115,
          maxHeight: Math.floor(115 * 1.05),
          minWeight: 20,
          maxWeight: Math.floor(20 * 1.05),
          minLength: 0,
          maxLength: 0,
          minMass: 0,
          maxMass: 0,
        },
      },
      {
        ageCategoryName: 'child',
        sizeGeneratorConfig: {
          minHeight: 145,
          maxHeight: Math.floor(145 * 1.05),
          minWeight: 36,
          maxWeight: Math.floor(36 * 1.05),
          minLength: 0,
          maxLength: 0,
          minMass: 0,
          maxMass: 0,
        },
      },
      {
        ageCategoryName: 'teenager',
        sizeGeneratorConfig: {
          minHeight: 170,
          maxHeight: Math.floor(170 * 1.05),
          minWeight: 68,
          maxWeight: Math.floor(68 * 1.05),
          minLength: 0,
          maxLength: 0,
          minMass: 0,
          maxMass: 0,
        },
      },
      {
        ageCategoryName: 'adult',
        sizeGeneratorConfig: {
          minHeight: 175,
          maxHeight: Math.floor(175 * 1.05),
          minWeight: 70,
          maxWeight: Math.floor(70 * 1.05),
          minLength: 0,
          maxLength: 0,
          minMass: 0,
          maxMass: 0,
        },
      },
      {
        ageCategoryName: 'elderly',
        sizeGeneratorConfig: {
          minHeight: 170,
          maxHeight: Math.floor(170 * 1.05),
          minWeight: 65,
          maxWeight: Math.floor(65 * 1.05),
          minLength: 0,
          maxLength: 0,
          minMass: 0,
          maxMass: 0,
        },
      },
    ],
  },
];
