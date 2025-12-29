import type { Item } from "$lib/equipment";

export type CoinGenerationConfig = {
  allowedDenominations?: CoinType[];
  minDenomination?: number;
  maxDenomination?: number;
  minValue?: number;
  maxValue?: number;
  coinSystem: CoinSystem;
}

export type CoinSystem = {
  denominations: CoinType[];
}

export type CoinType = {
  name: string;
  value: number;
  weightPerUnit: number;
  rarity?: number; // 1 is common, higher is rarer? Or probability weight? Let's say relative weight. Higher is more common.
}

export type PileOfCoins = Item & {
  denomination: string;
  quantity: number;
}
