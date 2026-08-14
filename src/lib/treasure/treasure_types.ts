import type { ContainerType } from '$lib/equipment';
import type { PotionGeneratorConfig } from '$lib/potions';

export type TreasureHoardGeneratorConfig = {
  allowedContainerTypes?: ContainerType[];
  artObjectProportion: number;
  coinProportions: number;
  gemProportion: number;
  mundaneItemProportion?: number;
  magicItemProportion?: number;
  potionProportion?: number;
  potionGeneratorConfig?: PotionGeneratorConfig;
  roomDimensions?: { width: number; length: number; height: number };
  targetValue: number;
};
