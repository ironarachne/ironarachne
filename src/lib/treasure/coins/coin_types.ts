import type { Item } from '$lib/equipment';
import type { CurrencySystem, CurrencyDenomination } from '$lib/currency';

export type CoinGenerationConfig = {
  allowedDenominations?: CurrencyDenomination[];
  minDenomination?: number;
  maxDenomination?: number;
  minValue?: number;
  maxValue?: number;
  coinSystem: CurrencySystem;
};

export type PileOfCoins = Item & {
  denomination: string;
  quantity: number;
};
