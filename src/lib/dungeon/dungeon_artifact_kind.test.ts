import { describe, expect, it } from 'vitest';

import {
  DUNGEON_ARTIFACT_KIND,
  DUNGEON_PAYLOAD_VERSION,
  dungeonArtifactKind,
  migrateDungeonSnapshot,
  validateDungeonSnapshot,
} from './dungeon_artifact_kind';
import { rollDungeonSnapshot } from './dungeon_roll';
import type { DungeonSnapshot } from './dungeon_snapshot';

const snapshot = rollDungeonSnapshot('kind-seed', { width: 20, height: 20 });

/** A copy of the good payload with one part replaced, for the rejection cases. */
function broken(changes: Record<string, unknown>): unknown {
  return { ...(snapshot as unknown as Record<string, unknown>), ...changes };
}

describe('the fixture this file rejects mutations of', () => {
  it('has the rooms, doors and keys the rejection cases mutate', () => {
    // Without this the mutation cases below pass vacuously: replacing entry zero of an empty list
    // changes nothing, and an unchanged payload validates.
    expect(snapshot.rooms.length).toBeGreaterThan(0);
    expect(snapshot.doors.length).toBeGreaterThan(0);
  });
});

describe('the dungeon artifact kind', () => {
  it('is registered under a stable, unqualified id', () => {
    expect(dungeonArtifactKind.kind).toEqual(DUNGEON_ARTIFACT_KIND);
    expect(DUNGEON_ARTIFACT_KIND).toEqual('dungeon');
  });

  it('declares the payload version it writes', () => {
    expect(dungeonArtifactKind.payloadVersion).toEqual(DUNGEON_PAYLOAD_VERSION);
  });

  it('names a saved dungeon by its own name', () => {
    expect(dungeonArtifactKind.nameOf(snapshot)).toEqual(snapshot.name);
  });

  it('falls back to the kind when the name has been emptied', () => {
    expect(dungeonArtifactKind.nameOf({ ...snapshot, name: '   ' })).toEqual('Dungeon');
  });

  it('round-trips through its own codec', async () => {
    const codec = await dungeonArtifactKind.loadCodec();
    const back = codec.toSnapshot(codec.fromSnapshot(snapshot, undefined as never));
    expect(back.rooms.map((room) => room.name)).toEqual(snapshot.rooms.map((room) => room.name));
  });
});

describe('validating a stored dungeon', () => {
  it('accepts what the generator wrote', () => {
    const result = validateDungeonSnapshot(snapshot);
    expect(result.ok).toBe(true);
  });

  it('accepts a dungeon a user has emptied of rooms', () => {
    // An editing decision, not a broken artifact: 3.3 asks for a well-defined empty result.
    const result = validateDungeonSnapshot(broken({ rooms: [] }));
    expect(result.ok).toBe(true);
  });

  it('rejects something that is not an object at all', () => {
    const result = validateDungeonSnapshot('a dungeon');
    expect(result).toMatchObject({ ok: false, reason: 'invalid-payload' });
  });

  it('rejects a payload with no name', () => {
    const { name: _name, ...rest } = snapshot as unknown as Record<string, unknown>;
    expect(validateDungeonSnapshot(rest)).toMatchObject({ ok: false });
  });

  it('rejects a theme with no blueprint', () => {
    expect(
      validateDungeonSnapshot(broken({ theme: { ...snapshot.theme, blueprint: undefined } })),
    ).toMatchObject({ ok: false, reason: 'invalid-payload' });
  });

  it('rejects a grid whose tiles do not fill its dimensions', () => {
    // The case a length check exists for: a short grid is not a smaller dungeon, it is one whose
    // renderer reads past the end of the array.
    const layout = {
      ...snapshot.layout,
      grid: { ...snapshot.layout.grid, data: snapshot.layout.grid.data.slice(0, 4) },
    };
    expect(validateDungeonSnapshot(broken({ layout }))).toMatchObject({ ok: false });
  });

  it('rejects a room with no description', () => {
    const rooms = snapshot.rooms.map((room, index) =>
      index === 0 ? { ...room, description: undefined } : room,
    );
    expect(validateDungeonSnapshot(broken({ rooms }))).toMatchObject({ ok: false });
  });

  it('rejects a room whose encounter is not one', () => {
    const rooms = snapshot.rooms.map((room, index) =>
      index === 0 ? { ...room, encounter: { name: 'wolves' } } : room,
    );
    expect(validateDungeonSnapshot(broken({ rooms }))).toMatchObject({ ok: false });
  });

  it('rejects a door with no state', () => {
    const doors = snapshot.doors.map((door, index) =>
      index === 0 ? { ...door, state: undefined } : door,
    );
    expect(validateDungeonSnapshot(broken({ doors }))).toMatchObject({ ok: false });
  });

  it('rejects a key that unlocks nothing', () => {
    const keys = [{ id: 'k', x: 1, y: 1, description: 'a key' }];
    expect(validateDungeonSnapshot(broken({ keys }))).toMatchObject({ ok: false });
  });

  it('rejects an entrance with no position', () => {
    const entrances = [{ type: 'stairs', roomId: '0' }];
    expect(validateDungeonSnapshot(broken({ entrances }))).toMatchObject({ ok: false });
  });

  it('rejects lists that are not lists', () => {
    for (const field of ['rooms', 'doors', 'keys', 'entrances']) {
      expect(validateDungeonSnapshot(broken({ [field]: 'none' }))).toMatchObject({ ok: false });
    }
  });
});

describe('migrating a stored dungeon (7.3)', () => {
  it('rejects every version, because version 1 is the only shape there has been', () => {
    // The whole of this kind's migration story today, asserted so that the day a version 2 lands
    // this test is what has to change rather than something that silently drops a user's dungeon.
    const result = migrateDungeonSnapshot(snapshot as unknown as DungeonSnapshot, 0);
    expect(result).toMatchObject({ ok: false, reason: 'unsupported-version' });
    expect(result.ok ? '' : result.message).toContain('version 0');
  });
});
