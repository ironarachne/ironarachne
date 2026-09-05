import type { CurrencyRules } from '../ruleset_types';
import { ADND_2E_OPEN_RULES_SOURCE } from './source_manifest';

type SourcedDenomination = CurrencyRules['definition']['denominations'][number] & {
  sourceIds: string[];
};

/**
 * Chapter 6's coin relationships, expressed in copper-piece units. Each production row carries
 * the exact source id before the registry-facing definition strips the audit-only field.
 */
export const ADND_2E_CURRENCY_ROWS: readonly SourcedDenomination[] = [
  {
    id: 'copper',
    name: 'copper piece',
    symbol: 'cp',
    value: 1,
    weight: 0.02,
    sourceIds: [ADND_2E_OPEN_RULES_SOURCE.id],
  },
  {
    id: 'silver',
    name: 'silver piece',
    symbol: 'sp',
    value: 10,
    weight: 0.02,
    sourceIds: [ADND_2E_OPEN_RULES_SOURCE.id],
  },
  {
    id: 'electrum',
    name: 'electrum piece',
    symbol: 'ep',
    value: 50,
    weight: 0.02,
    sourceIds: [ADND_2E_OPEN_RULES_SOURCE.id],
  },
  {
    id: 'gold',
    name: 'gold piece',
    symbol: 'gp',
    value: 100,
    weight: 0.02,
    sourceIds: [ADND_2E_OPEN_RULES_SOURCE.id],
  },
  {
    id: 'platinum',
    name: 'platinum piece',
    symbol: 'pp',
    value: 500,
    weight: 0.02,
    sourceIds: [ADND_2E_OPEN_RULES_SOURCE.id],
  },
];

export const ADND_2E_CURRENCY_RULES: CurrencyRules = {
  definition: {
    baseDenominationId: 'copper',
    denominations: ADND_2E_CURRENCY_ROWS.map(({ sourceIds: _sourceIds, ...row }) => ({ ...row })),
  },
  format: (amount, denominationId) => {
    const denomination = ADND_2E_CURRENCY_ROWS.find((row) => row.id === denominationId);
    return `${new Intl.NumberFormat().format(amount)} ${denomination?.symbol ?? denominationId}`;
  },
};
