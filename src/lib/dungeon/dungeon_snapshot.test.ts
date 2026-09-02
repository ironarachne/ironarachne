import { describe, expect, it } from 'vitest';

import { rollDungeon } from './dungeon_roll';
import { dungeonFromSnapshot } from './dungeon_rehydrate';
import {
  describeDungeonSize,
  dungeonSnapshotByteSize,
  toDungeonSnapshot,
} from './dungeon_snapshot';

/**
 * Requirement 7.2: `fromSnapshot(toSnapshot(x))` preserves everything that matters.
 *
 * "Everything that matters" for a dungeon is the blueprint — the geometry, the words, and what is
 * in the rooms. What deliberately does not survive is the live `Species` object behind each
 * combatant, which `$lib/creatures` rebuilds from its name; the assertions below check the name
 * rather than the object for that reason.
 */
const SEED = 'round-trip-seed';
const SMALL = {
  width: 20,
  height: 20,
  blueprintName: 'Tomb',
  biomeName: 'temperate deciduous forest',
};

describe('a dungeon snapshot', () => {
  const dungeon = rollDungeon(SEED, SMALL);
  const snapshot = toDungeonSnapshot(dungeon);
  const restored = dungeonFromSnapshot(snapshot);

  it('keeps the name, the theme and the geometry', () => {
    expect(restored.name).toEqual(dungeon.name);
    expect(restored.theme).toEqual(dungeon.theme);
    expect(restored.layout).toEqual(dungeon.layout);
    expect(restored.entrances).toEqual(dungeon.entrances);
  });

  it('keeps every door and key exactly as they were placed', () => {
    expect(restored.doors).toEqual(dungeon.doors);
    expect(restored.keys).toEqual(dungeon.keys);
  });

  it('keeps every room, its words and its treasure', () => {
    expect(restored.rooms.length).toEqual(dungeon.rooms.length);
    for (const [index, room] of dungeon.rooms.entries()) {
      const back = restored.rooms[index];
      expect(back.id).toEqual(room.id);
      expect(back.name).toEqual(room.name);
      expect(back.purpose).toEqual(room.purpose);
      expect(back.description).toEqual(room.description);
      expect(back.primitive).toEqual(room.primitive);
      expect(back.treasure).toEqual(room.treasure);
    }
  });

  it('keeps every combatant in every room that had one', () => {
    const occupied = dungeon.rooms.filter((room) => room.encounter !== undefined);
    // A guard, not decoration: the assertions below pass vacuously on a dungeon that rolled empty.
    expect(occupied.length).toBeGreaterThan(0);

    for (const [index, room] of dungeon.rooms.entries()) {
      const back = restored.rooms[index].encounter;
      if (room.encounter === undefined) {
        expect(back).toBeUndefined();
        continue;
      }
      expect(back?.name).toEqual(room.encounter.name);
      expect(back?.difficulty).toEqual(room.encounter.difficulty);
      expect(back?.groups.map((group) => group.mobs.map((mob) => mob.name))).toEqual(
        room.encounter.groups.map((group) => group.mobs.map((mob) => mob.name)),
      );
    }
  });

  it('carries no functions into storage', () => {
    expect(() => structuredClone(snapshot)).not.toThrow();
  });

  it('is a fraction of the size of the dungeon it was taken from', () => {
    // The measurement decision 7 of docs/tool-readiness.md asked #59 to take, pinned as a test so a
    // change that puts a whole `Species` back into a payload fails here rather than in a quota
    // warning. A live 20×20 dungeon is over a megabyte; its snapshot is tens of kilobytes.
    const live = new TextEncoder().encode(JSON.stringify(dungeon)).length;
    const stored = dungeonSnapshotByteSize(snapshot);
    expect(stored).toBeGreaterThan(0);
    expect(stored * 5).toBeLessThan(live);
  });
});

describe('describing a dungeon payload size', () => {
  it('reads in kilobytes below a megabyte', () => {
    expect(describeDungeonSize(300 * 1024)).toEqual('300 KB');
  });

  it('never rounds a payload that exists down to nothing', () => {
    expect(describeDungeonSize(12)).toEqual('1 KB');
  });

  it('reads in megabytes above one', () => {
    expect(describeDungeonSize(2.5 * 1024 * 1024)).toEqual('2.5 MB');
  });
});

describe('sizing a payload that will not serialize', () => {
  it('answers zero rather than throwing', () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    expect(dungeonSnapshotByteSize(circular as never)).toEqual(0);
  });
});
