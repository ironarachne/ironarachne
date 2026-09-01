import { describe, expect, it } from 'vitest';

import { rollArmsManufacturer, rollArmsManufacturerSnapshot } from './arms_manufacturer_roll.js';

describe('rollArmsManufacturer', () => {
  /** Requirement 2.2. */
  it('gives the same manufacturer for the same seed', () => {
    expect(rollArmsManufacturer('a-fixed-seed')).toEqual(rollArmsManufacturer('a-fixed-seed'));
  });

  it('gives a different manufacturer for a different seed', () => {
    const seeds = ['one', 'two', 'three', 'four', 'five'].map((seed) =>
      JSON.stringify(rollArmsManufacturer(seed)),
    );

    expect(new Set(seeds).size).toBeGreaterThan(1);
  });

  it('gives the manufacturer a name, a description and a catalogue', () => {
    const manufacturer = rollArmsManufacturer('fields-seed');

    expect(manufacturer.name).not.toBe('');
    expect(manufacturer.description).not.toBe('');
    expect(manufacturer.models.length).toBeGreaterThan(0);
    for (const model of manufacturer.models) {
      expect(model.name).not.toBe('');
      expect(model.description).not.toBe('');
    }
  });

  it('rolls a snapshot from the same seed', () => {
    expect(rollArmsManufacturerSnapshot('reroll-seed')).toEqual(
      rollArmsManufacturer('reroll-seed'),
    );
  });
});
