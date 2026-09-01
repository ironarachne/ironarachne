import { describe, expect, it } from 'vitest';

import { defaultHeraldryGeneratorOptions } from './heraldry_snapshot.js';
import {
  chargesForTag,
  readHeraldryGeneratorConfig,
  rollHeraldry,
  rollHeraldrySnapshot,
} from './heraldry_roll.js';

describe('rollHeraldry', () => {
  /** Requirement 2.2, and the defect this module was written to fix. */
  it('gives the same arms for the same seed', () => {
    expect(rollHeraldry('a-fixed-seed').arms).toEqual(rollHeraldry('a-fixed-seed').arms);
  });

  it('gives different arms for a different seed', () => {
    expect(rollHeraldry('one-seed').arms.blazon).not.toBe(rollHeraldry('another-seed').arms.blazon);
  });

  it('records the options it rolled with, filled in', () => {
    const { generatorOptions } = rollHeraldry('recorded-seed', {
      heraldryTag: 'any',
      chargeTinctureName: 'any',
      numberOfChargesOption: 'any',
      chargePosition: 'normal',
      lockSeed: false,
    });

    // The three fields a version 1 record predates are present, because a re-roll reads them.
    expect(generatorOptions.fieldDivisionOption).toBeDefined();
    expect(generatorOptions.variationSlotOptions).toBeDefined();
    expect(generatorOptions.variationTinctureOptions).toBeDefined();
  });

  it('honours a pinned number of charges', () => {
    for (const [option, count] of [
      ['none', 0],
      ['one', 1],
      ['three', 3],
    ] as const) {
      const { arms } = rollHeraldry('counted-seed', {
        ...defaultHeraldryGeneratorOptions(),
        numberOfChargesOption: option,
      });
      const charges = arms.device.chargeGroups.reduce(
        (total, group) => total + group.numberOfCharges,
        0,
      );
      expect(charges).toBe(count);
    }
  });

  it('honours a pinned charge tincture', () => {
    const { arms } = rollHeraldry('tinctured-seed', {
      ...defaultHeraldryGeneratorOptions(),
      numberOfChargesOption: 'one',
      chargeTinctureName: 'Or',
    });

    expect(arms.device.chargeGroups[0].charge.tincture.name).toBe('Or');
  });

  it('honours a pinned field division', () => {
    const { arms } = rollHeraldry('divided-seed', {
      ...defaultHeraldryGeneratorOptions(),
      fieldDivisionOption: 'fess',
    });

    expect(arms.device.field.name).toBe('fess');
  });

  /**
   * The charge list is copied on the way out, and this is what that copy protects: `generateHeraldry`
   * writes the drawn tincture onto the charge it picked, so a shared list would leave every later
   * coat of arms' idea of that charge tinted by the last one to use it.
   */
  it('does not tint the shared charge tables', () => {
    const before = chargesForTag('any')[0].tincture.name;
    rollHeraldry('tinting-seed', {
      ...defaultHeraldryGeneratorOptions(),
      numberOfChargesOption: 'one',
      chargeTinctureName: 'gules',
    });

    expect(chargesForTag('any')[0].tincture.name).toBe(before);
  });

  it('rolls a snapshot carrying the seed and the options', () => {
    const snapshot = rollHeraldrySnapshot('snapshot-seed');

    expect(snapshot.seed).toBe('snapshot-seed');
    expect(snapshot.blazon).not.toBe('');
    expect(snapshot.device.fieldName).not.toBe('');
    expect(snapshot.generatorOptions.fieldDivisionOption).toBeDefined();
  });
});

describe('readHeraldryGeneratorConfig', () => {
  it('reads back what the generator recorded', () => {
    const config = readHeraldryGeneratorConfig({
      heraldryTag: 'animal',
      chargeTinctureName: 'Or',
      numberOfChargesOption: 'three',
      chargePosition: 'in chief',
      lockSeed: true,
      fieldDivisionOption: 'fess',
      variationSlotOptions: ['plain', 'barry'],
      variationTinctureOptions: [['gules', 'any']],
    });

    expect(config.heraldryTag).toBe('animal');
    expect(config.chargePosition).toBe('in chief');
    expect(config.lockSeed).toBe(true);
    expect(config.fieldDivisionOption).toBe('fess');
    expect(config.variationSlotOptions).toEqual(['plain', 'barry']);
  });

  /** Provenance is `Record<string, unknown>`: this is the boundary where that becomes typed. */
  it('falls back to the defaults for anything it does not recognise', () => {
    const config = readHeraldryGeneratorConfig({
      heraldryTag: 42,
      variationSlotOptions: 'plain',
      variationTinctureOptions: ['gules'],
    });
    const defaults = defaultHeraldryGeneratorOptions();

    expect(config).toEqual(defaults);
  });

  /** A version 1 record has no field-division fields at all, and reads as the defaults. */
  it('fills in the three options a version 1 record predates', () => {
    const config = readHeraldryGeneratorConfig({
      heraldryTag: 'any',
      chargeTinctureName: 'any',
      numberOfChargesOption: 'any',
      chargePosition: 'normal',
      lockSeed: false,
    });

    expect(config.fieldDivisionOption).toBe('any');
    expect(config.variationSlotOptions).toEqual(['any', 'any', 'any']);
    expect(config.variationTinctureOptions?.length).toBe(3);
  });
});

describe('chargesForTag', () => {
  it('gives every charge for `any`, and fewer for a tag', () => {
    const all = chargesForTag('any');
    const animals = chargesForTag('animal');

    expect(all.length).toBeGreaterThan(0);
    expect(animals.length).toBeGreaterThan(0);
    expect(animals.length).toBeLessThan(all.length);
  });

  it('gives every charge a tincture to start from', () => {
    expect(chargesForTag('any').every((charge) => charge.tincture.name !== '')).toBe(true);
  });
});
