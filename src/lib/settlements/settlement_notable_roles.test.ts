import { describe, expect, it } from 'vitest';
import { getSettlementNotableRolePool } from './settlement_notable_roles';
import Hamlet from './categories/hamlet';
import City from './categories/city';

describe('getSettlementNotableRolePool', () => {
  it('includes reeve for hamlets but not mayor', () => {
    const pool = getSettlementNotableRolePool({
      population: 40,
      category: Hamlet,
      settlementTags: ['rural'],
    });
    expect(pool.some((r) => r.id === 'reeve')).toBe(true);
    expect(pool.some((r) => r.id === 'mayor')).toBe(false);
  });

  it('includes mayor for larger urban categories', () => {
    const pool = getSettlementNotableRolePool({
      population: 12000,
      category: City,
      settlementTags: ['urban_core', 'coastal'],
    });
    expect(pool.some((r) => r.id === 'mayor')).toBe(true);
    expect(pool.some((r) => r.id === 'harbor_master')).toBe(true);
  });
});
