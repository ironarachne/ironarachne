import type { ContainerType } from '$lib/equipment/equipment_types';

export type TreasureHoardGeneratorConfig = {
  allowedContainerTypes?: ContainerType[];
  artObjectProportion: number;
  coinProportions: number;
  gemProportion: number;
  mundaneItemProportion?: number;
  magicItemProportion?: number;
  roomDimensions?: { width: number; length: number; height: number };
  targetValue: number;
};
