import { describe, expect, it } from 'vitest';

import {
  removeRoomEncounter,
  removeRoomMob,
  removeRoomTreasureItem,
  setDoorDescription,
  setDungeonBlueprint,
  setDungeonName,
  setKeyDescription,
  setRoomDescription,
  setRoomEncounterDescription,
  setRoomEncounterName,
  setRoomMobName,
  setRoomName,
  setRoomPurpose,
  setRoomTreasureItemName,
} from './dungeon_editing';
import { rollDungeonSnapshot } from './dungeon_roll';
import type { DungeonSnapshot } from './dungeon_snapshot';

/** A dungeon with something in most of its rooms, so the encounter and treasure edits have work. */
const snapshot: DungeonSnapshot = rollDungeonSnapshot('editing-seed', {
  width: 20,
  height: 20,
  blueprintName: 'Tomb',
  biomeName: 'tundra',
  encounterChancePerRoom: 1,
  treasureChancePerRoom: 1,
});

const occupied = snapshot.rooms.findIndex(
  (room) => (room.encounter?.groups[0]?.mobs.length ?? 0) > 0,
);
const stocked = snapshot.rooms.findIndex((room) => (room.treasure?.length ?? 0) > 0);

describe('the fixture these edits are made against', () => {
  it('has a room with a combatant in it and a room with treasure in it', () => {
    expect(occupied).toBeGreaterThanOrEqual(0);
    expect(stocked).toBeGreaterThanOrEqual(0);
    expect(snapshot.keys.length + snapshot.doors.length).toBeGreaterThan(0);
  });
});

describe('editing a dungeon', () => {
  it('renames the dungeon and nothing else', () => {
    const edited = setDungeonName(snapshot, 'The Frozen Vault');
    expect(edited.name).toEqual('The Frozen Vault');
    expect(edited.rooms).toEqual(snapshot.rooms);
  });

  it('leaves the original untouched', () => {
    const before = snapshot.name;
    setDungeonName(snapshot, 'somewhere else');
    expect(snapshot.name).toEqual(before);
  });

  it('rethemes to another blueprint without re-rolling the rooms', () => {
    // 4.2: the edited payload is authoritative. Retheming relabels; it does not rebuild.
    const edited = setDungeonBlueprint(snapshot, 'Stronghold');
    expect(edited.theme.blueprint.name).toEqual('Stronghold');
    expect(edited.theme.name).toContain('Stronghold');
    expect(edited.theme.environment).toEqual(snapshot.theme.environment);
    expect(edited.rooms).toEqual(snapshot.rooms);
  });

  it('ignores a blueprint this build does not have', () => {
    expect(setDungeonBlueprint(snapshot, 'Sunken Ziggurat')).toEqual(snapshot);
  });
});

describe('editing one room', () => {
  it('changes its name, purpose and description without disturbing its neighbours (4.4)', () => {
    const renamed = setRoomName(snapshot, 0, 'The Cold Gate');
    const repurposed = setRoomPurpose(renamed, 0, 'Gatehouse');
    const rewritten = setRoomDescription(repurposed, 0, 'Frost has cracked the lintel.');

    expect(rewritten.rooms[0].name).toEqual('The Cold Gate');
    expect(rewritten.rooms[0].purpose).toEqual('Gatehouse');
    expect(rewritten.rooms[0].description).toEqual('Frost has cracked the lintel.');
    expect(rewritten.rooms.slice(1)).toEqual(snapshot.rooms.slice(1));
  });

  it('ignores a room index that is not there', () => {
    expect(setRoomName(snapshot, 999, 'nowhere')).toEqual(snapshot);
    expect(setRoomName(snapshot, -1, 'nowhere')).toEqual(snapshot);
    expect(setRoomName(snapshot, 1.5, 'nowhere')).toEqual(snapshot);
  });
});

describe("editing a room's encounter", () => {
  it('renames it and rewrites what it is doing there', () => {
    const named = setRoomEncounterName(snapshot, occupied, 'The Honour Guard');
    const described = setRoomEncounterDescription(named, occupied, 'They have not moved in years.');
    expect(described.rooms[occupied].encounter?.name).toEqual('The Honour Guard');
    expect(described.rooms[occupied].encounter?.description).toEqual(
      'They have not moved in years.',
    );
  });

  it('renames one combatant through the encounters library', () => {
    const edited = setRoomMobName(snapshot, occupied, 0, 0, 'Kethra');
    expect(edited.rooms[occupied].encounter?.groups[0].mobs[0].name).toEqual('Kethra');
  });

  it('removes one combatant and leaves the rest', () => {
    const before = snapshot.rooms[occupied].encounter?.groups[0].mobs ?? [];
    const edited = removeRoomMob(snapshot, occupied, 0, 0);
    expect(edited.rooms[occupied].encounter?.groups[0].mobs.length).toEqual(before.length - 1);
  });

  it('empties a room of whatever was living in it, keeping the room', () => {
    const edited = removeRoomEncounter(snapshot, occupied);
    expect(edited.rooms[occupied].encounter).toBeUndefined();
    expect(edited.rooms[occupied].name).toEqual(snapshot.rooms[occupied].name);
  });

  it('does nothing to a room that has no encounter', () => {
    const emptied = removeRoomEncounter(snapshot, occupied);
    expect(setRoomEncounterName(emptied, occupied, 'nobody')).toEqual(emptied);
    expect(removeRoomMob(emptied, occupied, 0, 0)).toEqual(emptied);
  });
});

describe("editing a room's treasure", () => {
  it('renames one item', () => {
    const edited = setRoomTreasureItemName(snapshot, stocked, 0, 'The Barrow Crown');
    expect(edited.rooms[stocked].treasure?.[0].name).toEqual('The Barrow Crown');
  });

  it('removes one item and leaves the rest', () => {
    const before = snapshot.rooms[stocked].treasure ?? [];
    const edited = removeRoomTreasureItem(snapshot, stocked, 0);
    expect(edited.rooms[stocked].treasure?.length).toEqual(before.length - 1);
  });

  it('ignores an item index that is not there', () => {
    expect(setRoomTreasureItemName(snapshot, stocked, 999, 'nothing')).toEqual(snapshot);
    expect(removeRoomTreasureItem(snapshot, stocked, 999)).toEqual(snapshot);
  });
});

describe('editing the doors and the keys', () => {
  it('rewrites a door description', () => {
    const edited = setDoorDescription(snapshot, 0, 'a slab of frost-rimed iron');
    expect(edited.doors[0].description).toEqual('a slab of frost-rimed iron');
    expect(edited.doors.slice(1)).toEqual(snapshot.doors.slice(1));
  });

  it('rewrites a key description', () => {
    // Keys exist only where the layout locked a chokepoint, which a small tomb may not do at all,
    // so the key is supplied here rather than fished out of the roll.
    const keyed = {
      ...snapshot,
      keys: [{ id: 'k1', doorId: 'd1', x: 2, y: 2, description: 'a brass key' }],
    };
    expect(setKeyDescription(keyed, 0, 'a key of black glass').keys[0].description).toEqual(
      'a key of black glass',
    );
  });

  it('ignores a door or key index that is not there', () => {
    expect(setDoorDescription(snapshot, 999, 'nothing')).toEqual(snapshot);
    expect(setKeyDescription(snapshot, 999, 'nothing')).toEqual(snapshot);
  });
});
