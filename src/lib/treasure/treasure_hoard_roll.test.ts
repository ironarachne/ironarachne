import { describe, expect, it } from 'vitest';

import {
  MAXIMUM_HOARD_VALUE,
  MINIMUM_HOARD_VALUE,
  MINIMUM_ROOM_DIMENSION,
  defaultTreasureHoardConfigRecord,
  hoardTargetValue,
  readTreasureHoardConfig,
  rollTreasureHoard,
  rollTreasureHoardSnapshot,
  toTreasureHoardGeneratorConfig,
} from './treasure_hoard_roll';
import { toTreasureHoardSnapshot } from './treasure_hoard_snapshot';

const CONFIG = defaultTreasureHoardConfigRecord();

describe('rollTreasureHoard', () => {
  it('gives the same hoard for the same seed and settings', () => {
    // Requirement 2.2. The generator was already pure; the page reseeded its own RNG from the seed
    // field, twice over.
    expect(toTreasureHoardSnapshot(rollTreasureHoard('fixed', CONFIG), 0)).toEqual(
      toTreasureHoardSnapshot(rollTreasureHoard('fixed', CONFIG), 0),
    );
  });

  it('gives a different hoard for a different seed', () => {
    expect(toTreasureHoardSnapshot(rollTreasureHoard('one', CONFIG), 0)).not.toEqual(
      toTreasureHoardSnapshot(rollTreasureHoard('two', CONFIG), 0),
    );
  });

  it('rolls something at the default settings', () => {
    expect(rollTreasureHoard('defaults', CONFIG).length).toBeGreaterThan(0);
  });

  it('rolls no art objects when the proportion is nothing', () => {
    // What 6.4 is about: a hoard with no art objects is an ordinary hoard, not an error.
    const noArt = rollTreasureHoard('no-art', {
      ...CONFIG,
      artProportion: 0,
      gemsProportion: 0,
      mundaneItemProportion: 0,
      magicItemProportion: 0,
    });

    expect(noArt.some((item) => item.itemMinorType === 'art object')).toBe(false);
  });
});

describe('hoardTargetValue', () => {
  it('converts the page gold field into the copper the generator works in', () => {
    expect(hoardTargetValue({ ...CONFIG, value: 200 })).toBe(20_000);
  });
});

describe('readTreasureHoardConfig', () => {
  it('reads back what the page wrote', () => {
    const written = {
      value: 5000,
      coinsProportion: 40,
      gemsProportion: 20,
      artProportion: 10,
      mundaneItemProportion: 15,
      magicItemProportion: 10,
      potionProportion: 5,
      allowPotionVariations: true,
      allowPotionHomebrew: true,
      roomWidth: 20,
      roomLength: 30,
      roomHeight: 12,
    };

    expect(readTreasureHoardConfig(written)).toEqual(written);
  });

  it('falls back to the defaults for anything that is not a number', () => {
    expect(readTreasureHoardConfig({})).toEqual(CONFIG);
    expect(readTreasureHoardConfig({ value: 'lots' }).value).toBe(CONFIG.value);
    expect(readTreasureHoardConfig({ allowPotionHomebrew: 'yes' }).allowPotionHomebrew).toBe(false);
  });

  it('clamps a number rather than dropping it', () => {
    // A proportion outside the page's own bounds is still a number a roll can honour; a hoard worth
    // nothing is not.
    expect(readTreasureHoardConfig({ value: 0 }).value).toBe(MINIMUM_HOARD_VALUE);
    expect(readTreasureHoardConfig({ value: 9_000_000 }).value).toBe(MAXIMUM_HOARD_VALUE);
    expect(readTreasureHoardConfig({ coinsProportion: 900 }).coinsProportion).toBe(100);
    expect(readTreasureHoardConfig({ gemsProportion: -5 }).gemsProportion).toBe(0);
    expect(readTreasureHoardConfig({ roomWidth: 0 }).roomWidth).toBe(MINIMUM_ROOM_DIMENSION);
  });
});

describe('toTreasureHoardGeneratorConfig', () => {
  it('carries the settings onto the library config', () => {
    const full = toTreasureHoardGeneratorConfig({ ...CONFIG, value: 500, artProportion: 12 });

    expect(full.targetValue).toBe(50_000);
    expect(full.artObjectProportion).toBe(12);
    expect(full.potionGeneratorConfig?.allowHomebrew).toBe(false);
  });

  it('rebuilds the container table rather than expecting it in the record', () => {
    // A provenance carrying eleven container definitions would be storing a table.
    expect(toTreasureHoardGeneratorConfig(CONFIG).allowedContainerTypes?.length).toBeGreaterThan(0);
  });

  it('converts the room from feet to metres', () => {
    const room = toTreasureHoardGeneratorConfig({ ...CONFIG, roomWidth: 10 }).roomDimensions;

    expect(room?.width).toBeGreaterThan(2);
    expect(room?.width).toBeLessThan(4);
  });
});

describe('rollTreasureHoardSnapshot', () => {
  it('is the roller a re-roll takes, and records what it was rolled for', () => {
    const snapshot = rollTreasureHoardSnapshot('seed', { ...CONFIG, value: 500 });

    expect(snapshot.targetValue).toBe(50_000);
    expect(snapshot.items).toEqual(
      toTreasureHoardSnapshot(rollTreasureHoard('seed', { ...CONFIG, value: 500 }), 0).items,
    );
  });

  it('re-rolls the same hoard a stored provenance describes', () => {
    // Requirement 4.3: the destructive command puts the rolled hoard back.
    const provenance = { seed: 'stored', config: { value: 300, artProportion: 20 } };

    expect(
      rollTreasureHoardSnapshot(provenance.seed, readTreasureHoardConfig(provenance.config)),
    ).toEqual(rollTreasureHoardSnapshot('stored', { ...CONFIG, value: 300, artProportion: 20 }));
  });
});
