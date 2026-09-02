import { describe, expect, it } from 'vitest';

import { rollDrug, rollDrugSnapshot } from './drug_roll';

describe('rolling a drug', () => {
  it('gives the same drug for the same seed (2.2)', () => {
    // The page drew its seed from `new RNG(Date.now())` twice — at module load and on every press
    // — so the control was honoured and the seed itself was the clock's.
    expect(rollDrug('repeatable')).toEqual(rollDrug('repeatable'));
  });

  it('gives a different drug for a different seed', () => {
    expect(rollDrug('one').name).not.toEqual(rollDrug('two').name);
  });

  it('fills every field', () => {
    const drug = rollDrug('complete');
    for (const value of Object.values(toStrings(drug))) {
      expect(value).not.toEqual('');
    }
  });

  it('takes the method from the form it rolled', () => {
    // The two are related in the generator and independent in the payload; this is the roll's half.
    const drug = rollDrug('method-seed');
    expect(drug.drugType.methods).toContain(drug.method);
  });

  it('takes the effect sentence from the effect type it rolled', () => {
    const drug = rollDrug('effect-seed');
    expect(drug.effectType.effects).toContain(drug.effectDescription);
  });

  it('rolls a snapshot by the same path', () => {
    expect(rollDrugSnapshot('snapshotted').name).toEqual(rollDrug('snapshotted').name);
  });
});

/** The drug's string fields, for the "nothing is blank" check above. */
function toStrings(drug: ReturnType<typeof rollDrug>): Record<string, string> {
  return {
    name: drug.name,
    description: drug.description,
    method: drug.method,
    effectDescription: drug.effectDescription,
    strength: drug.strength,
    color: drug.color,
    duration: drug.duration,
    sideEffect: drug.sideEffect,
    commonality: drug.commonality,
  };
}
