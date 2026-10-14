import { describe, expect, it } from 'vitest';
import {
  isFoodSuitability,
  isProductFoodPolicy,
  isImportedFoodDescriptor,
  isRawResourceSnapshot,
} from './food_validation';
import { getBiologicalRawResources, snapshotRawResource } from './raw_biological_catalog';

describe('saved food qualification boundaries', () => {
  it('accepts reviewed raw catalog snapshots and conservative unknown policies', () => {
    for (const raw of getBiologicalRawResources())
      expect(isRawResourceSnapshot(snapshotRawResource(raw))).toBe(true);
    expect(isFoodSuitability({ kind: 'unknown' })).toBe(true);
    expect(isFoodSuitability({ kind: 'not-food' })).toBe(true);
    expect(isProductFoodPolicy({ kind: 'unknown' })).toBe(true);
    expect(isProductFoodPolicy({ kind: 'not-food' })).toBe(true);
  });
  it.each([
    null,
    [],
    {},
    { kind: 'food', preparation: 'ordinary', productKeys: ['bread'] },
    { kind: 'food', preparation: 'recipe-required', productKeys: [] },
    { kind: 'food', preparation: 'recipe-required', productKeys: ['bread', 'bread'] },
    { kind: 'food', preparation: 'cooked', productKeys: [] },
  ])('rejects contradictory or incomplete raw qualification %j', (food) =>
    expect(isFoodSuitability(food)).toBe(false),
  );
  it('requires explicit import identity, food use, review and assumptions', () => {
    const entry = {
      kind: 'product',
      catalogKey: 'bread',
      name: 'Bread',
      use: 'provision',
      food: { kind: 'food', preparation: 'ordinary', productKeys: [] },
      reviewRuleId: 'historical:bread:v1',
      requirements: [],
    };
    expect(isImportedFoodDescriptor(entry)).toBe(true);
    expect(isImportedFoodDescriptor({ ...entry, kind: 'raw' })).toBe(false);
    expect(isImportedFoodDescriptor({ ...entry, food: { kind: 'unknown' } })).toBe(false);
    expect(isImportedFoodDescriptor({ ...entry, reviewRuleId: '' })).toBe(false);
    expect(
      isImportedFoodDescriptor({ ...entry, use: 'ingredient', food: { kind: 'unknown' } }),
    ).toBe(true);
    expect(isImportedFoodDescriptor(null)).toBe(false);
    expect(
      isProductFoodPolicy({
        kind: 'food',
        use: 'provision',
        requirements: [],
        reviewRuleId: 'saved:v1',
      }),
    ).toBe(true);
    expect(
      isProductFoodPolicy({
        kind: 'food',
        use: 'fuel',
        requirements: [],
        reviewRuleId: 'saved:v1',
      }),
    ).toBe(false);
    expect(
      isProductFoodPolicy({
        kind: 'food',
        use: 'provision',
        requirements: ['tools', 'tools'],
        reviewRuleId: 'saved:v1',
      }),
    ).toBe(false);
  });
  it('does not let a nonfood part acquire food status by its display name', () => {
    const raw = snapshotRawResource(
      getBiologicalRawResources().find((entry) => entry.id === 'wheat-grain')!,
    );
    expect(isRawResourceSnapshot({ ...raw, name: '' })).toBe(false);
    expect(isRawResourceSnapshot({ ...raw, uses: ['magic'] })).toBe(false);
    expect(isRawResourceSnapshot({ ...raw, food: { kind: 'not-food' } })).toBe(false);
    expect(
      isRawResourceSnapshot({ ...raw, uses: ['construction'], food: { kind: 'unknown' } }),
    ).toBe(true);
  });
});
