import type { CurrencySystem } from './currency_types';

export const STANDARD_FANTASY: CurrencySystem = {
  name: 'Standard Fantasy',
  description: 'A standard fantasy currency system based on D&D 5e.',
  denominations: [
    { name: 'copper', symbol: 'cp', value: 1, weight: 0.01, rarity: 20 },
    { name: 'silver', symbol: 'sp', value: 10, weight: 0.01, rarity: 10 },
    { name: 'electrum', symbol: 'ep', value: 50, weight: 0.01, rarity: 1 },
    { name: 'gold', symbol: 'gp', value: 100, weight: 0.01, rarity: 15 },
    { name: 'platinum', symbol: 'pp', value: 1000, weight: 0.01, rarity: 5 },
  ],
};

export const COMMON_FANTASY: CurrencySystem = {
  name: 'Common Fantasy',
  description: 'A simplified fantasy currency system.',
  denominations: [
    { name: 'copper', symbol: 'cp', value: 1, weight: 0.01, rarity: 20 },
    { name: 'silver', symbol: 'sp', value: 10, weight: 0.01, rarity: 10 },
    { name: 'gold', symbol: 'gp', value: 100, weight: 0.01, rarity: 15 },
  ],
};

export const IMPERIAL_CREDITS: CurrencySystem = {
  name: 'Imperial Credits',
  description: 'A sci-fi currency system.',
  denominations: [{ name: 'credit', symbol: 'cr', value: 1, weight: 0 }],
};

export const HISTORICAL_BRITISH: CurrencySystem = {
  name: 'Historical British',
  description: 'Pre-decimal British currency.',
  denominations: [
    { name: 'farthing', value: 0.25, weight: 0.0028 },
    { name: 'penny', symbol: 'd', value: 1, weight: 0.009 },
    { name: 'shilling', symbol: 's', value: 12, weight: 0.005 },
    { name: 'pound', symbol: '£', value: 240, weight: 0 }, // Paper note or gold sovereign
    { name: 'guinea', value: 252, weight: 0.008 },
  ],
};
