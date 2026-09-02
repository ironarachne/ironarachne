import { describe, expect, it } from 'vitest';

import {
  removeRoomEncounter,
  removeRoomTreasureItem,
  setDungeonName,
  setRoomDescription,
  setRoomName,
  setRoomPurpose,
} from './dungeon_editing';
import {
  dungeonDisplayName,
  dungeonFileStem,
  dungeonRoomHeading,
  dungeonRoomMetaLine,
  dungeonToDocument,
  dungeonToMarkdown,
  dungeonToText,
} from './dungeon_presentation';
import { rollDungeonSnapshot } from './dungeon_roll';

const snapshot = rollDungeonSnapshot('presentation-seed', {
  width: 20,
  height: 20,
  blueprintName: 'Tomb',
  biomeName: 'tundra',
  encounterChancePerRoom: 1,
  treasureChancePerRoom: 1,
});

const occupied = snapshot.rooms.findIndex((room) => room.encounter !== undefined);

describe('arranging a dungeon for reading', () => {
  const document = dungeonToDocument(snapshot);

  it('is headed by the dungeon and opens with where it is and what it was built as', () => {
    expect(document.title).toEqual(snapshot.name);
    expect(document.paragraphs).toEqual([
      snapshot.theme.environment.description,
      snapshot.theme.blueprint.description,
    ]);
  });

  it('gives every room a section', () => {
    expect(document.sections.length).toEqual(snapshot.rooms.length);
  });

  it('heads a room with its name and the number on the map', () => {
    expect(dungeonRoomHeading(snapshot.rooms[0])).toContain(`(room ${snapshot.rooms[0].id})`);
  });

  it('says what a room was for, what shape it is and how big', () => {
    const room = snapshot.rooms[0];
    expect(dungeonRoomMetaLine(room)).toContain(`${room.primitive.width}×${room.primitive.height}`);
    expect(dungeonRoomMetaLine(room)).toContain(room.primitive.style);
  });

  it('lists what is living in an occupied room', () => {
    const section = document.sections[occupied];
    const encounter = section.lists.find((list) => list.heading.startsWith('Encounter'));
    expect(encounter?.items.length).toBeGreaterThan(0);
  });
});

describe('dropping what is empty (6.4)', () => {
  it('prints no encounter list for a room that has nobody in it', () => {
    const emptied = removeRoomEncounter(snapshot, occupied);
    const section = dungeonToDocument(emptied).sections[occupied];
    expect(section.lists.some((list) => list.heading.startsWith('Encounter'))).toBe(false);
  });

  it('prints no treasure list once the last item is taken', () => {
    let stripped = snapshot;
    const room = snapshot.rooms[occupied];
    for (let index = (room.treasure?.length ?? 0) - 1; index >= 0; index--) {
      stripped = removeRoomTreasureItem(stripped, occupied, index);
    }
    const section = dungeonToDocument(stripped).sections[occupied];
    expect(section.lists.some((list) => list.heading === 'Treasure')).toBe(false);
  });

  it('prints no blank paragraph for a room whose description has been emptied', () => {
    const blanked = setRoomDescription(snapshot, 0, '   ');
    const section = dungeonToDocument(blanked).sections[0];
    expect(section.paragraphs.every((paragraph) => paragraph.trim() !== '')).toBe(true);
  });

  it('still gives a room with nothing in it a heading', () => {
    const bare = removeRoomEncounter(setRoomDescription(snapshot, occupied, ''), occupied);
    expect(dungeonToDocument(bare).sections[occupied].heading).not.toEqual('');
  });

  it('names a room that has been left nameless', () => {
    expect(dungeonRoomHeading({ ...snapshot.rooms[0], name: '  ' })).toContain('Unnamed room');
  });

  it('says a room has an unknown purpose rather than printing an empty dash', () => {
    const meta = dungeonRoomMetaLine({ ...snapshot.rooms[0], purpose: '' });
    expect(meta).toContain('unknown purpose');
  });
});

describe('the keys lying in a room', () => {
  it('are listed under the room that holds them', () => {
    // Keys exist only where the layout locked a chokepoint, which a small tomb may not do, so one
    // is placed here on the first room's own floor rather than fished out of the roll.
    const room = snapshot.rooms[0];
    const keyed = {
      ...snapshot,
      keys: [{ id: 'k1', doorId: 'd1', x: room.x, y: room.y, description: 'a brass key' }],
    };
    const document = dungeonToDocument(keyed);
    expect(document.sections[0].lists.find((list) => list.heading === 'Keys')?.items).toEqual([
      'a brass key',
    ]);
    // And under that room alone: a key on one floor is not in every room.
    expect(
      document.sections
        .slice(1)
        .some((section) => section.lists.some((list) => list.heading === 'Keys')),
    ).toBe(false);
  });

  it('are not listed at all for a dungeon with no keys', () => {
    expect(
      dungeonToDocument({ ...snapshot, keys: [] }).sections.some((section) =>
        section.lists.some((list) => list.heading === 'Keys'),
      ),
    ).toBe(false);
  });
});

describe('exporting a dungeon (6.3)', () => {
  it('writes Markdown a referee can drop into their notes', () => {
    const markdown = dungeonToMarkdown(snapshot);
    expect(markdown).toContain(`# ${snapshot.name}`);
    expect(markdown).toContain(`## ${dungeonRoomHeading(snapshot.rooms[0])}`);
    expect(markdown.endsWith('\n')).toBe(true);
  });

  it('writes the same document as plain text, without repeating the title', () => {
    const text = dungeonToText(snapshot);
    expect(text).toContain(dungeonRoomHeading(snapshot.rooms[0]).toUpperCase());
    expect(text.startsWith(snapshot.name)).toBe(false);
  });

  it('never leaves a blank line where a room had nothing to say', () => {
    const emptied = removeRoomEncounter(setRoomDescription(snapshot, occupied, ''), occupied);
    expect(dungeonToMarkdown(emptied)).not.toContain('\n\n\n');
    expect(dungeonToText(emptied)).not.toContain('\n\n\n');
  });

  it('carries an edited room straight into the export', () => {
    const edited = setRoomPurpose(setRoomName(snapshot, 0, 'The Cold Gate'), 0, 'Gatehouse');
    const markdown = dungeonToMarkdown(edited);
    expect(markdown).toContain('The Cold Gate');
    expect(markdown).toContain('Gatehouse');
  });
});

describe('naming a dungeon for a file and a heading', () => {
  it('uses the dungeon name', () => {
    expect(dungeonDisplayName(snapshot)).toEqual(snapshot.name);
    expect(dungeonFileStem({ name: 'The Frozen Vault' })).toEqual('dungeon-the-frozen-vault');
  });

  it('falls back to the kind for a dungeon with no name', () => {
    expect(dungeonDisplayName(setDungeonName(snapshot, '  '))).toEqual('Dungeon');
    expect(dungeonFileStem({ name: '' })).toEqual('dungeon');
  });

  it('reduces punctuation a filesystem would not take', () => {
    expect(dungeonFileStem({ name: '!!The Tomb of Yth!!' })).toEqual('dungeon-the-tomb-of-yth');
  });
});
