import * as Dice from '$lib/dice';
import * as Measurements from '$lib/measurements';
import { RNG } from '@ironarachne/rng';
import type Size from './size';
import type SizeGeneratorConfig from './size_generator_config';
import type { SizeMatrix, SizeMatrixRow } from './size_matrix';
import { HUMAN_STANDARD_SIZE_MATRIX } from './human_size_data';

export function rollSizeDimension(rng: RNG, min: number, max: number): number {
  if (Number.isInteger(min) && Number.isInteger(max)) return rng.int(min, max);
  return rng.float(min, max);
}

export function generate(seed: string, config: SizeGeneratorConfig): Size {
  const rng = new RNG(seed);
  const height = rollSizeDimension(rng, config.minHeight, config.maxHeight);
  const weight = rollSizeDimension(rng, config.minWeight, config.maxWeight);
  const length = rollSizeDimension(rng, config.minLength, config.maxLength);
  const mass = rollSizeDimension(rng, config.minMass, config.maxMass);

  return {
    height,
    weight,
    length,
    mass,
  };
}

export function getHeightRange(config: SizeGeneratorConfig): string {
  const metricHeightModifier = Math.max(config.maxHeight - config.minHeight, 4);
  const metric =
    config.minHeight +
    ' + ' +
    Dice.describeDice(Dice.simplify(Dice.rangeToDiceExpression(metricHeightModifier))) +
    ' cm';
  const imperialHeightModifier = Math.max(
    Measurements.cmToInches(config.maxHeight - config.minHeight),
    4,
  );
  const imperial =
    Measurements.inchesToFeetExpression(Measurements.cmToInches(config.minHeight)) +
    ' + ' +
    Dice.describeDice(Dice.simplify(Dice.rangeToDiceExpression(imperialHeightModifier))) +
    ' in.';

  return `${metric} (${imperial})`;
}

export function getHumanVariant(weightModifier: number, heightModifier: number): SizeMatrix {
  const standard: SizeMatrix = humanStandard();
  const variant: SizeMatrix = [];

  for (let i = 0; i < standard.length; i++) {
    const row: SizeMatrixRow = { gender: standard[i].gender, entries: [] };
    for (let j = 0; j < standard[i].entries.length; j++) {
      const entry = standard[i].entries[j];
      const config: SizeGeneratorConfig = {
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
      if (entry.ageCategoryName == 'teenager') {
        name = 'young adult';
      }
      row.entries.push({ ageCategoryName: name, sizeGeneratorConfig: config });
    }
    variant.push(row);
  }

  return variant;
}

export function getWeightRange(config: SizeGeneratorConfig): string {
  const metricWeightModifier = Math.max(config.maxWeight - config.minWeight, 4);
  const metric =
    config.minWeight +
    ' + ' +
    Dice.describeDice(Dice.simplify(Dice.rangeToDiceExpression(metricWeightModifier))) +
    ' kg';
  const imperialWeightModifier = Math.max(
    Math.round(Measurements.kgToPounds(config.maxWeight - config.minWeight)),
    4,
  );
  const imperial =
    Math.round(Measurements.kgToPounds(config.minWeight)) +
    ' + ' +
    Dice.describeDice(Dice.simplify(Dice.rangeToDiceExpression(imperialWeightModifier))) +
    ' lb.';

  return `${metric} (${imperial})`;
}

/**
 * The baseline human size matrix. The returned matrix is shared and must not be mutated.
 */
export function humanStandard(): SizeMatrix {
  return HUMAN_STANDARD_SIZE_MATRIX;
}

export { dragonTrueWyrmSizeMatrix } from './dragon_sizes';
export { bodySizeMatrix } from './body_sizes';
