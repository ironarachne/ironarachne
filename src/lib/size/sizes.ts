import * as Dice from "$lib/dice";
import * as Measurements from "$lib/measurements";
import random from "random";
import type Size from "./size";
import type SizeGeneratorConfig from "./size_generator_config";
import type { SizeMatrix, SizeMatrixRow } from "./size_matrix";

export function generate(config: SizeGeneratorConfig): Size {
  const height = random.int(config.minHeight, config.maxHeight);
  const weight = random.int(config.minWeight, config.maxWeight);
  const length = random.int(config.minLength, config.maxLength);
  const mass = random.int(config.minMass, config.maxMass);

  return {
    height,
    weight,
    length,
    mass,
  };
}

export function getHeightRange(config: SizeGeneratorConfig): string {
  const metricHeightModifier = Math.max(config.maxHeight - config.minHeight, 4);
  const metric = config.minHeight
    + " + "
    + Dice.describeDice(Dice.simplify(Dice.rangeToDiceExpression(metricHeightModifier)))
    + " cm";
  const imperialHeightModifier = Math.max(
    Measurements.cmToInches(config.maxHeight - config.minHeight),
    4,
  );
  const imperial = Measurements.inchesToFeetExpression(Measurements.cmToInches(config.minHeight))
    + " + "
    + Dice.describeDice(Dice.simplify(Dice.rangeToDiceExpression(imperialHeightModifier)))
    + " in.";

  return `${metric} (${imperial})`;
}

export function getHumanVariant(weightModifier: number, heightModifier: number): SizeMatrix {
  const standard: SizeMatrix = humanStandard();
  let variant: SizeMatrix = [];

  for (let i = 0; i < standard.length; i++) {
    let row: SizeMatrixRow = { gender: standard[i].gender, entries: [] };
    for (let j = 0; j < standard[i].entries.length; j++) {
      let entry = standard[i].entries[j];
      let config: SizeGeneratorConfig = {
        minHeight: Math.round(entry.sizeGeneratorConfig.minHeight * heightModifier),
        maxHeight: Math.round(entry.sizeGeneratorConfig.maxHeight * heightModifier),
        minWeight: Math.round(entry.sizeGeneratorConfig.minWeight * weightModifier),
        maxWeight: Math.round(entry.sizeGeneratorConfig.maxWeight * weightModifier),
        minLength: entry.sizeGeneratorConfig.minLength,
        maxLength: entry.sizeGeneratorConfig.maxLength,
        minMass: entry.sizeGeneratorConfig.minMass,
        maxMass: entry.sizeGeneratorConfig.maxMass,
      };
      let name = entry.ageCategoryName;
      if (entry.ageCategoryName == "teenager") {
        name = "young adult";
      }
      row.entries.push({ ageCategoryName: name, sizeGeneratorConfig: config });
    }
    variant.push(row);
  }

  return variant;
}

export function getWeightRange(config: SizeGeneratorConfig): string {
  const metricWeightModifier = Math.max(config.maxWeight - config.minWeight, 4);
  const metric = config.minWeight
    + " + "
    + Dice.describeDice(Dice.simplify(Dice.rangeToDiceExpression(metricWeightModifier)))
    + " kg";
  const imperialWeightModifier = Math.max(
    Math.round(Measurements.kgToPounds(config.maxWeight - config.minWeight)),
    4,
  );
  const imperial = Math.round(Measurements.kgToPounds(config.minWeight))
    + " + "
    + Dice.describeDice(Dice.simplify(Dice.rangeToDiceExpression(imperialWeightModifier)))
    + " lb.";

  return `${metric} (${imperial})`;
}

export function humanStandard(): SizeMatrix {
  return [
    {
      gender: "female",
      entries: [
        {
          ageCategoryName: "infant",
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
          ageCategoryName: "toddler",
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
          ageCategoryName: "young child",
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
          ageCategoryName: "child",
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
          ageCategoryName: "teenager",
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
          ageCategoryName: "adult",
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
          ageCategoryName: "elderly",
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
      gender: "male",
      entries: [
        {
          ageCategoryName: "infant",
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
          ageCategoryName: "toddler",
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
          ageCategoryName: "young child",
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
          ageCategoryName: "child",
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
          ageCategoryName: "teenager",
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
          ageCategoryName: "adult",
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
          ageCategoryName: "elderly",
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
}
