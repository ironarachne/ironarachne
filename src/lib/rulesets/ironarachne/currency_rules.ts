import type { CurrencyRules } from '../ruleset_types';
import { STANDARD_FANTASY } from './currency_systems';

export const IRONARACHNE_CURRENCY_RULES: CurrencyRules = {
  definition: {
    baseDenominationId: STANDARD_FANTASY.denominations[0].name,
    denominations: STANDARD_FANTASY.denominations.map((denomination) => ({
      id: denomination.name,
      name: denomination.name,
      ...(denomination.symbol === undefined ? {} : { symbol: denomination.symbol }),
      value: denomination.value,
      ...(denomination.weight === undefined ? {} : { weight: denomination.weight }),
    })),
  },
  format: (amount, denominationId) => {
    const denomination = STANDARD_FANTASY.denominations.find(
      (candidate) => candidate.name === denominationId,
    );
    const label = denomination?.symbol ?? denomination?.name ?? denominationId;
    return `${new Intl.NumberFormat().format(amount)} ${label}`;
  },
};
