import type SizeGeneratorConfig from './size_generator_config';
import type { SizeMatrix, SizeMatrixEntry } from './size_matrix';

function entry(ageCategoryName: string, cfg: SizeGeneratorConfig): SizeMatrixEntry {
  return { ageCategoryName, sizeGeneratorConfig: cfg };
}

/**
 * True dragons: height = shoulder / torso (cm), length = snout to tail (cm), weight = kg.
 * Same curve for all chromatic, metallic, gem, and typical "other" wyrms.
 * Each band's minimums sit above the prior band's maximums so random rolls stay ordered.
 */
export function dragonTrueWyrmSizeMatrix(): SizeMatrix {
  const wyrmling: SizeGeneratorConfig = {
    minHeight: 85,
    maxHeight: 145,
    minWeight: 85,
    maxWeight: 280,
    minLength: 210,
    maxLength: 360,
    minMass: 85,
    maxMass: 280,
  };

  const young: SizeGeneratorConfig = {
    minHeight: 150,
    maxHeight: 320,
    minWeight: 300,
    maxWeight: 4000,
    minLength: 380,
    maxLength: 750,
    minMass: 300,
    maxMass: 4000,
  };

  const adult: SizeGeneratorConfig = {
    minHeight: 330,
    maxHeight: 560,
    minWeight: 4200,
    maxWeight: 22000,
    minLength: 780,
    maxLength: 1500,
    minMass: 4200,
    maxMass: 22000,
  };

  const ancient: SizeGeneratorConfig = {
    minHeight: 570,
    maxHeight: 820,
    minWeight: 22500,
    maxWeight: 72000,
    minLength: 1520,
    maxLength: 3500,
    minMass: 22500,
    maxMass: 72000,
  };

  const greatWyrm: SizeGeneratorConfig = {
    minHeight: 830,
    maxHeight: 1250,
    minWeight: 73000,
    maxWeight: 195000,
    minLength: 3600,
    maxLength: 9200,
    minMass: 73000,
    maxMass: 195000,
  };

  const entries: SizeMatrixEntry[] = [
    entry('wyrmling', wyrmling),
    entry('young', young),
    entry('adult', adult),
    entry('ancient', ancient),
    entry('great_wyrm', greatWyrm),
  ];

  return [
    { gender: 'female', entries },
    { gender: 'male', entries },
  ];
}
