import { describe, expect, it } from 'vitest';
import { isRecipeInputSelector, processingSelectorSatisfies } from './processing_selector';

describe('explicit imported material specifications', () => {
  it('validates every selector variant and rejects empty or malformed identities', () => {
    for (const value of [
      null,
      3,
      {},
      { kind: 'product', productKey: '' },
      { kind: 'raw-resource', rawResourceIds: [] },
      { kind: 'raw-resource', rawResourceIds: ['x', 'x'] },
      { kind: 'raw', majorType: 'wood', minorTypes: null, resourceNames: [] },
      { kind: 'raw', majorType: '', minorTypes: [], resourceNames: [] },
    ])
      expect(isRecipeInputSelector(value)).toBe(false);
    for (const value of [
      { kind: 'raw', majorType: 'wood', minorTypes: [], resourceNames: [] },
      { kind: 'raw-resource', rawResourceIds: ['flax'] },
      { kind: 'product', productKey: 'thread' },
      { kind: 'settlement-water' },
    ])
      expect(isRecipeInputSelector(value)).toBe(true);
  });
  it('requires specifications to be at least as narrow as recipe requirements', () => {
    const flax = {
      kind: 'raw' as const,
      majorType: 'plant-fiber',
      minorTypes: ['textile'],
      resourceNames: ['flax stems'],
    };
    expect(processingSelectorSatisfies(flax, flax)).toBe(true);
    expect(processingSelectorSatisfies(flax, { ...flax, minorTypes: [], resourceNames: [] })).toBe(
      true,
    );
    expect(processingSelectorSatisfies({ ...flax, minorTypes: [] }, flax)).toBe(false);
    expect(processingSelectorSatisfies({ ...flax, resourceNames: [] }, flax)).toBe(false);
    expect(processingSelectorSatisfies({ ...flax, resourceNames: ['reed'] }, flax)).toBe(false);
    expect(processingSelectorSatisfies({ ...flax, majorType: 'wood' }, flax)).toBe(false);
    expect(
      processingSelectorSatisfies(
        { kind: 'product', productKey: 'thread' },
        { kind: 'product', productKey: 'thread' },
      ),
    ).toBe(true);
    expect(
      processingSelectorSatisfies(
        { kind: 'product', productKey: 'wood' },
        { kind: 'product', productKey: 'thread' },
      ),
    ).toBe(false);
    expect(
      processingSelectorSatisfies(
        { kind: 'raw-resource', rawResourceIds: ['a'] },
        { kind: 'raw-resource', rawResourceIds: ['a', 'b'] },
      ),
    ).toBe(true);
    expect(
      processingSelectorSatisfies(
        { kind: 'raw-resource', rawResourceIds: ['c'] },
        { kind: 'raw-resource', rawResourceIds: ['a'] },
      ),
    ).toBe(false);
    expect(
      processingSelectorSatisfies({ kind: 'settlement-water' }, { kind: 'settlement-water' }),
    ).toBe(true);
    expect(processingSelectorSatisfies(flax, { kind: 'settlement-water' })).toBe(false);
  });
});
