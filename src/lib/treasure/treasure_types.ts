import type { Item } from '../equipment/equipment_types';

export type ArtObject = Item & {
  artist: string;
}

export type ArtObjectType = {
  name: string;
  baseValue: number;
}

export type CoinDenomination = 'copper' | 'silver' | 'electrum' | 'gold' | 'platinum';

export type Gem = Item & {
  isCut: boolean;
}

export type GemType = {
  name: string;
  baseValue: number;
}

export type PileOfCoins = Item & {
  denomination: CoinDenomination;
  quantity: number;
}
