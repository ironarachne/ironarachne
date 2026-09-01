import { describe, expect, it } from 'vitest';

import {
  addArmsManufacturerModel,
  removeArmsManufacturerModel,
  setArmsManufacturerModelText,
  setArmsManufacturerText,
} from './arms_manufacturer_editing.js';
import { rollArmsManufacturerSnapshot } from './arms_manufacturer_roll.js';

/** Every roll has at least three models, so "one at a time" is always worth asserting. */
const manufacturer = rollArmsManufacturerSnapshot('editing-fixture');

describe('editing an arms manufacturer', () => {
  /** Requirement 4.4: one field at a time, and nothing else moves. */
  it('renames the company and leaves the catalogue alone', () => {
    const edited = setArmsManufacturerText(manufacturer, 'name', 'Vex Heavy Industries');

    expect(edited.name).toBe('Vex Heavy Industries');
    expect(edited.description).toBe(manufacturer.description);
    expect(edited.models).toEqual(manufacturer.models);
  });

  /** 4.2: the name and the prose are separate decisions, and neither drags the other. */
  it('does not rewrite a description that opens with the old name', () => {
    const edited = setArmsManufacturerText(manufacturer, 'name', 'Renamed');

    expect(edited.description.startsWith(manufacturer.name)).toBe(true);
  });

  it('edits the description, which is the user’s and not a table’s', () => {
    const edited = setArmsManufacturerText(manufacturer, 'description', 'They make big guns.');

    expect(edited.description).toBe('They make big guns.');
    expect(edited.name).toBe(manufacturer.name);
  });

  it('changes one model and leaves the others alone', () => {
    const edited = setArmsManufacturerModelText(manufacturer, 0, 'name', 'XR-7 Laser Rifle');

    expect(edited.models[0].name).toBe('XR-7 Laser Rifle');
    expect(edited.models[0].description).toBe(manufacturer.models[0].description);
    expect(edited.models.slice(1)).toEqual(manufacturer.models.slice(1));
  });

  it('edits a model’s damage type and description', () => {
    const damage = setArmsManufacturerModelText(manufacturer, 1, 'damage', 'plasma');
    const described = setArmsManufacturerModelText(damage, 1, 'description', 'It melts.');

    expect(described.models[1].damage).toBe('plasma');
    expect(described.models[1].description).toBe('It melts.');
    expect(described.models[1].name).toBe(manufacturer.models[1].name);
  });

  it('never writes into the snapshot it was given', () => {
    const before = structuredClone(manufacturer);
    setArmsManufacturerText(manufacturer, 'name', 'Other');
    setArmsManufacturerModelText(manufacturer, 0, 'name', 'Other');
    addArmsManufacturerModel(manufacturer);
    removeArmsManufacturerModel(manufacturer, 0);

    expect(manufacturer).toEqual(before);
  });

  it('adds a blank model made by the company', () => {
    const added = addArmsManufacturerModel(manufacturer);
    const last = added.models[added.models.length - 1];

    expect(added.models).toHaveLength(manufacturer.models.length + 1);
    expect(last).toEqual({
      name: '',
      maker: manufacturer.name,
      damage: '',
      cosmetics: [],
      effects: [],
      description: '',
    });
  });

  it('removes a model and leaves the rest in order', () => {
    const removed = removeArmsManufacturerModel(manufacturer, 0);

    expect(removed.models).toEqual(manufacturer.models.slice(1));
  });

  it('can empty the catalogue, which is an ordinary state', () => {
    let current = manufacturer;
    while (current.models.length > 0) {
      current = removeArmsManufacturerModel(current, 0);
    }

    expect(current.models).toEqual([]);
    expect(current.name).toBe(manufacturer.name);
  });

  /** An index nothing is at is a no-op, not a throw: the editor is driven by a live list. */
  it('ignores an index that is not there', () => {
    expect(setArmsManufacturerModelText(manufacturer, 99, 'name', 'XR-7')).toBe(manufacturer);
    expect(setArmsManufacturerModelText(manufacturer, -1, 'name', 'XR-7')).toBe(manufacturer);
    expect(setArmsManufacturerModelText(manufacturer, 0.5, 'name', 'XR-7')).toBe(manufacturer);
    expect(removeArmsManufacturerModel(manufacturer, 99)).toBe(manufacturer);
  });
});
