export type CurrencySystem = {
  name: string;
  description: string;
  denominations: CurrencyDenomination[];
};

export type CurrencyDenomination = {
  name: string;
  symbol?: string;
  value: number; // Value relative to the base unit (usually the smallest unit is 1)
  weight?: number; // Weight per unit in kg
  description?: string;
  rarity?: number; // Relative frequency/rarity for generation
};

export type CurrencyAmount = {
  amount: number;
  denomination: string;
};

export type CurrencyTransaction = {
  from: CurrencyAmount[];
  to: CurrencyAmount[];
  description: string;
};
