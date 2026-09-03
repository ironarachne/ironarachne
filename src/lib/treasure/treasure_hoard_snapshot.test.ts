import { describe, expect, it } from 'vitest';

import { defaultTreasureHoardConfigRecord, rollTreasureHoard } from './treasure_hoard_roll';
import {
  toHoardItemSnapshot,
  toTreasureHoardSnapshot,
  treasureHoardFromSnapshot,
} from './treasure_hoard_snapshot';
import { isGem, isPileOfCoins } from './treasure_predicates';
import type { Item } from '$lib/equipment';

const CONFIG = { ...defaultTreasureHoardConfigRecord(), value: 500, potionProportion: 10 };
const ITEMS = rollTreasureHoard('snapshot-seed', CONFIG);
const SNAPSHOT = toTreasureHoardSnapshot(ITEMS, 50_000);

describe('toTreasureHoardSnapshot', () => {
  it('embeds the items rather than referencing them', () => {
    // Decision 3 of docs/readiness-objects.md: a hoard is read out as a unit, and forty artifacts
    // per hoard is a vault nobody can browse.
    expect(SNAPSHOT.items.length).toBeGreaterThan(0);
    expect(SNAPSHOT.items.length).toBe(ITEMS.length);
    expect(SNAPSHOT.targetValue).toBe(50_000);
  });

  it('keeps the capacity a container has and what it holds', () => {
    // `ItemSnapshot` drops `contents` and `containerId` because "the container is not part of this
    // artifact". In a hoard it is.
    const containers = SNAPSHOT.items.filter((item) => Array.isArray(item.contents));

    expect(containers.length).toBeGreaterThan(0);
    for (const container of containers) {
      expect(container.maxVolume).toBeTypeOf('number');
      expect(container.currentWeight).toBeTypeOf('number');
    }
  });

  it('keeps the pairing between a chest and what is in it', () => {
    const ids = new Set(SNAPSHOT.items.map((item) => item.id));
    const packed = SNAPSHOT.items.flatMap((item) => item.contents ?? []);

    expect(packed.length).toBeGreaterThan(0);
    for (const id of packed) {
      expect(ids.has(id), id).toBe(true);
    }
  });

  it('keeps the fields each kind of loot adds to an item', () => {
    // Dropping them would leave "12 gems" where "12 cushion-cut emeralds" was rolled.
    const gem = SNAPSHOT.items.find((item) => isGem(item as unknown as Item));
    const coins = SNAPSHOT.items.find((item) => isPileOfCoins(item as unknown as Item));

    expect(gem?.cut).toBeTypeOf('string');
    expect(gem?.size).toBeTypeOf('string');
    expect(coins?.denomination).toBeTypeOf('string');
    expect(coins?.quantity).toBeTypeOf('number');
  });

  it('omits an extra the item does not have rather than storing it undefined', () => {
    const gem = SNAPSHOT.items.find((item) => isGem(item as unknown as Item));

    expect(gem).toBeDefined();
    expect('contents' in (gem ?? {})).toBe(false);
    expect('denomination' in (gem ?? {})).toBe(false);
  });
});

describe('treasureHoardFromSnapshot', () => {
  it('round-trips everything that matters', () => {
    // Requirement 7.2.
    expect(treasureHoardFromSnapshot(SNAPSHOT)).toEqual(SNAPSHOT);
    expect(treasureHoardFromSnapshot(treasureHoardFromSnapshot(SNAPSHOT))).toEqual(SNAPSHOT);
  });

  it('survives a trip through JSON, which is what storage is', () => {
    expect(treasureHoardFromSnapshot(JSON.parse(JSON.stringify(SNAPSHOT)))).toEqual(SNAPSHOT);
  });

  it('copies deeply enough that an editor cannot reach the stored record', () => {
    const read = treasureHoardFromSnapshot(SNAPSHOT);
    const container = read.items.find((item) => Array.isArray(item.contents));

    container?.contents?.push('tampered');
    read.items[0].properties.push('tampered');

    const stored = SNAPSHOT.items.find((item) => item.id === container?.id);
    expect(stored?.contents).not.toContain('tampered');
    expect(SNAPSHOT.items[0].properties).not.toContain('tampered');
  });

  it('recomputes nothing on read', () => {
    // 4.2: a value a referee set by hand is the hoard's value, not an input to an arithmetic that
    // runs again every time the artifact is opened.
    const edited = {
      ...SNAPSHOT,
      items: SNAPSHOT.items.map((item, index) => (index === 0 ? { ...item, value: 1 } : item)),
    };

    expect(treasureHoardFromSnapshot(edited).items[0].value).toBe(1);
  });
});

describe('toHoardItemSnapshot', () => {
  it('drops an extra that is not the right type rather than storing it', () => {
    const odd = { ...ITEMS[0], quantity: 'lots', contents: [1, 'a'] } as unknown as Item;
    const snapshot = toHoardItemSnapshot(odd);

    expect('quantity' in snapshot).toBe(false);
    expect(snapshot.contents).toEqual(['a']);
  });
});
