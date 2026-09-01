import { describe, expect, it } from 'vitest';

import { rollArmsManufacturer } from './arms_manufacturer_roll.js';
import {
  armsManufacturerFromSnapshot,
  toArmsManufacturerSnapshot,
} from './arms_manufacturer_snapshot.js';

const manufacturer = rollArmsManufacturer('snapshot-fixture');

describe('the arms manufacturer snapshot', () => {
  /** Requirement 7.2: lossless for everything the page shows. The identity function, tested. */
  it('round-trips a rolled manufacturer', () => {
    expect(armsManufacturerFromSnapshot(toArmsManufacturerSnapshot(manufacturer))).toEqual(
      manufacturer,
    );
  });

  it('round-trips a manufacturer with no models, which is an ordinary state', () => {
    const empty = { name: 'Vex Consolidated', description: '', models: [] };

    expect(armsManufacturerFromSnapshot(toArmsManufacturerSnapshot(empty))).toEqual(empty);
  });

  it('keeps a description a user has changed rather than recomputing it', () => {
    const edited = toArmsManufacturerSnapshot(manufacturer);
    edited.description = 'They make very large guns.';

    expect(armsManufacturerFromSnapshot(edited).description).toBe('They make very large guns.');
  });

  it('is free of the functions IndexedDB refuses', () => {
    expect(() => structuredClone(toArmsManufacturerSnapshot(manufacturer))).not.toThrow();
  });

  it('does not hand out the lists it was given', () => {
    const snapshot = toArmsManufacturerSnapshot(manufacturer);
    snapshot.models[0].name = 'Something else entirely';
    snapshot.models[0].cosmetics.push('a bow on top');
    snapshot.models.pop();

    expect(manufacturer.models[0].name).not.toBe('Something else entirely');
    expect(manufacturer.models[0].cosmetics).not.toContain('a bow on top');
    expect(manufacturer.models.length).toBe(snapshot.models.length + 1);
  });

  it('does not hand a restored value the snapshot’s own lists', () => {
    const snapshot = toArmsManufacturerSnapshot(manufacturer);
    const restored = armsManufacturerFromSnapshot(snapshot);
    restored.models[0].effects.push('fires backwards');

    expect(snapshot.models[0].effects).not.toContain('fires backwards');
  });
});
