import type { CurrencyRules } from '../ruleset_types';
import { DND_5E_SRD_SOURCE } from './source_manifest';

type SourcedDenomination = CurrencyRules['definition']['denominations'][number] & {
  sourceIds: string[];
};

/** SRD 5.1 page 61 exchange rates in copper-piece units; fifty coins weigh one pound. */
export const DND_5E_CURRENCY_ROWS: readonly SourcedDenomination[] = [
  {
    id: 'copper',
    name: 'copper piece',
    symbol: 'cp',
    value: 1,
    weight: 0.02,
    sourceIds: [DND_5E_SRD_SOURCE.id],
  },
  {
    id: 'silver',
    name: 'silver piece',
    symbol: 'sp',
    value: 10,
    weight: 0.02,
    sourceIds: [DND_5E_SRD_SOURCE.id],
  },
  {
    id: 'electrum',
    name: 'electrum piece',
    symbol: 'ep',
    value: 50,
    weight: 0.02,
    sourceIds: [DND_5E_SRD_SOURCE.id],
  },
  {
    id: 'gold',
    name: 'gold piece',
    symbol: 'gp',
    value: 100,
    weight: 0.02,
    sourceIds: [DND_5E_SRD_SOURCE.id],
  },
  {
    id: 'platinum',
    name: 'platinum piece',
    symbol: 'pp',
    value: 1_000,
    weight: 0.02,
    sourceIds: [DND_5E_SRD_SOURCE.id],
  },
];

export const DND_5E_CURRENCY_RULES: CurrencyRules = {
  definition: {
    baseDenominationId: 'copper',
    denominations: DND_5E_CURRENCY_ROWS.map(({ sourceIds: _sourceIds, ...row }) => ({ ...row })),
  },
  format: (amount, denominationId) => {
    const denomination = DND_5E_CURRENCY_ROWS.find((row) => row.id === denominationId);
    return `${new Intl.NumberFormat().format(amount)} ${denomination?.symbol ?? denominationId}`;
  },
};
