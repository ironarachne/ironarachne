import { describe, expect, it } from 'vitest';

import {
  ITEM_MAJOR_TYPE_CHOICES,
  defaultEquipmentGeneratorConfig,
  itemSeed,
  readEquipmentGeneratorConfig,
  rollItem,
  rollItemSnapshot,
  rollItems,
  toEquipmentGenerationConfig,
} from './item_roll';
import { toItemSnapshot } from './item_snapshot';

const CONFIG = defaultEquipmentGeneratorConfig();

describe('rollItem', () => {
  it('gives the same item for the same seed and settings', () => {
    // Requirement 2.2. `generateItem` was already pure; what was not was the page around it.
    expect(toItemSnapshot(rollItem('fixed', CONFIG))).toEqual(
      toItemSnapshot(rollItem('fixed', CONFIG)),
    );
  });

  it('gives a different item for a different seed', () => {
    expect(toItemSnapshot(rollItem('one', CONFIG))).not.toEqual(
      toItemSnapshot(rollItem('two', CONFIG)),
    );
  });

  it('honours the major type', () => {
    for (const majorType of ['weapon', 'armor'] as const) {
      expect(rollItem('typed', { ...CONFIG, itemMajorType: majorType }).itemMajorType).toBe(
        majorType,
      );
    }
  });

  it('adds no parts the settings switched off', () => {
    const plain = rollItem('plain-seed', {
      itemMajorType: 'any',
      useRefine: false,
      useEnchant: false,
      useDecorate: false,
    });

    expect(plain.refinement).toBeUndefined();
    expect(plain.enchantment).toBeUndefined();
    expect(plain.decoration).toBeUndefined();
    // The foundry always runs, so a material is not optional in practice.
    expect(plain.material).toBeDefined();
  });
});

describe('itemSeed', () => {
  it('gives each item of a press its own seed', () => {
    expect(itemSeed('press', 0)).not.toBe(itemSeed('press', 1));
    expect(itemSeed('press', 3)).toBe('press-item-3');
  });

  it('is what a saved card re-rolls from', () => {
    // The whole point of deriving rather than drawing: saving the third sword records a seed that
    // rolls the third sword, not the list it arrived in.
    const items = rollItems('press', 5, CONFIG);

    for (const [index, item] of items.entries()) {
      expect(toItemSnapshot(rollItem(itemSeed('press', index), CONFIG))).toEqual(
        toItemSnapshot(item),
      );
    }
  });
});

describe('rollItems', () => {
  it('rolls the count asked for, from one seed', () => {
    expect(rollItems('press', 7, CONFIG)).toHaveLength(7);
    expect(rollItems('press', 0, CONFIG)).toEqual([]);
  });

  it('gives the same list twice for the same seed', () => {
    expect(rollItems('press', 4, CONFIG).map(toItemSnapshot)).toEqual(
      rollItems('press', 4, CONFIG).map(toItemSnapshot),
    );
  });
});

describe('rollItemSnapshot', () => {
  it('is the roller a re-roll takes, and matches the page', () => {
    expect(rollItemSnapshot('seed', CONFIG)).toEqual(toItemSnapshot(rollItem('seed', CONFIG)));
  });
});

describe('readEquipmentGeneratorConfig', () => {
  it('reads back what the page wrote', () => {
    const written = {
      itemMajorType: 'armor',
      useRefine: false,
      useEnchant: true,
      useDecorate: false,
    };

    expect(readEquipmentGeneratorConfig(written)).toEqual(written);
  });

  it('falls back to the defaults for anything it does not recognise', () => {
    // A config written by a build that spelled these differently should re-roll the ordinary way
    // rather than from a field it misread.
    expect(readEquipmentGeneratorConfig({})).toEqual(CONFIG);
    expect(readEquipmentGeneratorConfig({ itemMajorType: 'trebuchet' }).itemMajorType).toBe('any');
    expect(readEquipmentGeneratorConfig({ useRefine: 'yes' }).useRefine).toBe(true);
  });

  it('accepts every major type the page offers', () => {
    for (const itemMajorType of ITEM_MAJOR_TYPE_CHOICES) {
      expect(readEquipmentGeneratorConfig({ itemMajorType }).itemMajorType).toBe(itemMajorType);
    }
  });
});

describe('toEquipmentGenerationConfig', () => {
  it('carries the four settings onto the library config', () => {
    const full = toEquipmentGenerationConfig({
      itemMajorType: 'weapon',
      useRefine: false,
      useEnchant: false,
      useDecorate: true,
    });

    expect(full.itemMajorType).toBe('weapon');
    expect(full.useRefine).toBe(false);
    expect(full.useEnchant).toBe(false);
    expect(full.useDecorate).toBe(true);
    // The tables come from the library, not from the page.
    expect(full.materials.length).toBeGreaterThan(0);
    expect(full.enchantments.length).toBeGreaterThan(0);
  });
});
