import { describe, expect, it } from 'vitest';

import * as DrugTypes from './drug_types';
import * as EffectTypes from './effect_types';
import { rollDrug } from './drug_roll';
import {
  drugFromSnapshot,
  drugFromSnapshotWithRng,
  drugTypeFromStoredName,
  effectTypeFromStoredName,
  toDrugSnapshot,
} from './drug_snapshot';

/**
 * Requirement 7.2: `fromSnapshot(toSnapshot(x))` preserves everything that matters.
 *
 * Everything a drug is asked about is a string, and all eleven survive. What is rebuilt rather than
 * copied is the pair of table rows — the drug's form and its effect — which are resolved by name,
 * so those are checked by name rather than by identity.
 */
const drug = rollDrug('round-trip-seed');

describe('a drug snapshot', () => {
  const snapshot = toDrugSnapshot(drug);
  const restored = drugFromSnapshot(snapshot);

  it('comes back exactly as it went in', () => {
    expect(restored).toEqual(drug);
  });

  it('stores the two table rows by name rather than whole', () => {
    expect(snapshot.drugTypeName).toEqual(drug.drugType.name);
    expect(snapshot.effectTypeName).toEqual(drug.effectType.name);
    expect('drugType' in snapshot).toBe(false);
    expect('effectType' in snapshot).toBe(false);
  });

  it('is eleven strings and nothing else', () => {
    // The claim the kind's validator rests on, and the reason this payload needs no conversion.
    expect(Object.values(snapshot).every((value) => typeof value === 'string')).toBe(true);
    expect(Object.keys(snapshot)).toHaveLength(11);
  });

  it('carries no functions into storage', () => {
    expect(() => structuredClone(snapshot)).not.toThrow();
  });

  it('reads back through the codec signature without drawing from the RNG', () => {
    // A drug is finished when it is stored; drawing from a seed on the way back would regenerate
    // over an edit.
    expect(drugFromSnapshotWithRng(snapshot, undefined)).toEqual(restored);
  });
});

describe('resolving a stored table row', () => {
  it('finds one this build has', () => {
    const known = DrugTypes.all()[0];
    expect(drugTypeFromStoredName(known.name)).toEqual(known);
    const effect = EffectTypes.all()[0];
    expect(effectTypeFromStoredName(effect.name)).toEqual(effect);
  });

  it('gives an inert row for one it does not, rather than refusing', () => {
    // The same rule an unknown species gets: the method a drug is taken by is a field of its own
    // and survives regardless, so losing the row costs the label alone.
    expect(drugTypeFromStoredName('nanite paste')).toEqual({ name: 'nanite paste', methods: [] });
    expect(effectTypeFromStoredName('empathogen')).toEqual({ name: 'empathogen', effects: [] });
  });

  it('round-trips a drug whose form this build has dropped', () => {
    const snapshot = { ...toDrugSnapshot(drug), drugTypeName: 'nanite paste' };
    expect(drugFromSnapshot(snapshot).drugType.name).toEqual('nanite paste');
  });
});
