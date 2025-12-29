import type { DensityCategory, Item } from '$lib/equipment/equipment_types';

export type GemGeneratorConfig = {
  allowCutGems: boolean;
  allowUncutGems: boolean;
  allowedCuts?: GemCut[];
  allowedSizes?: GemSize[];
  allowedTypes?: GemType[];
  minimumValue?: number;
  maximumValue?: number;
}

export type GemCut = 'round' | 'oval' | 'cushion' | 'princess' | 'emerald' | 'marquise' | 'pear' | 'radiant' | 'heart' | 'cabochon' | 'rough';

export type GemSize = 'tiny' | 'small' | 'medium' | 'large' | 'huge';

export type Gem = Item & {
  cut: GemCut;
  isCut: boolean;
  size: GemSize;
}

export type GemType = {
  name: string;
  baseValue: number;
  baseWeight: number;
  densityCategory: DensityCategory;
}
