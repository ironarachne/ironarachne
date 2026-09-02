/**
 * A dungeon arranged for reading, and the Markdown and PDF exports written from it.
 *
 * This is what requirement 6.3 asks for, and it is also the whole of the tool's answer to 2.5. The
 * page draws a plan on a canvas; the canvas is an enhancement. What a referee actually runs the
 * dungeon from is the room list — every room's name, purpose and description, what lives in it,
 * what it holds, and which keys are lying in it — and that reads on a machine with no canvas at
 * all, in a text file, and on paper.
 *
 * 6.4 has teeth here, because most rooms are empty of most things. A room with no encounter prints
 * no encounter heading, a room with nothing in it prints its description alone, and a dungeon with
 * no keys prints no key list. Every list in the document model is dropped when it is empty rather
 * than being rendered as a heading over nothing.
 *
 * Presentation works on the **stored** shape rather than the live one. The page holds a live
 * `EngineeredDungeon` and converts it for saving anyway, and the editor holds a snapshot; one model
 * both can print is cheaper than two, and a stored mob already carries the species name a sheet
 * wants to print where a live one carries the whole species.
 */

import { Currency } from '$lib/currency';
import { describeEncounterMob, encounterGroupHeading } from '$lib/encounters';

import type { DungeonSnapshot, StoredPopulatedRoom } from './dungeon_snapshot.js';

/** A titled list inside a section; dropped entirely when it has no items. */
export type DungeonList = {
  heading: string;
  items: string[];
};

/** One room arranged for reading. */
export type DungeonSection = {
  heading: string;
  paragraphs: string[];
  lists: DungeonList[];
};

/** A dungeon arranged for reading, independent of the format it is finally written in. */
export type DungeonDocument = {
  title: string;
  paragraphs: string[];
  sections: DungeonSection[];
};

function isPrintable(value: string): boolean {
  return value.trim() !== '';
}

/** What to head the document with: the dungeon's name, or the kind when it has none. */
export function dungeonDisplayName(dungeon: { name: string }): string {
  const name = dungeon.name.trim();
  return name === '' ? 'Dungeon' : name.trim();
}

/** The heading a room gets: what it is called, and the number the map is labelled with. */
export function dungeonRoomHeading(room: StoredPopulatedRoom): string {
  const name = isPrintable(room.name) ? room.name.trim() : 'Unnamed room';
  return `${name} (room ${room.id})`;
}

/** The line under a room's heading: what it was for, what shape it is, and how big. */
export function dungeonRoomMetaLine(room: StoredPopulatedRoom): string {
  const purpose = isPrintable(room.purpose) ? room.purpose.trim() : 'unknown purpose';
  return `${purpose} — ${room.primitive.style}, ${room.primitive.width}×${room.primitive.height}`;
}

function encounterList(room: StoredPopulatedRoom): DungeonList[] {
  const { encounter } = room;
  if (encounter === undefined) {
    return [];
  }
  const items = encounter.groups.flatMap((group, index) => [
    encounterGroupHeading(group, index),
    ...group.mobs.map((mob) => {
      const line = describeEncounterMob(mob);
      return isPrintable(line.kind) ? `${line.name} — ${line.kind}` : line.name;
    }),
  ]);
  const description = isPrintable(encounter.description) ? [encounter.description.trim()] : [];
  const heading = isPrintable(encounter.name) ? `Encounter: ${encounter.name.trim()}` : 'Encounter';
  const all = [...description, ...items];
  return all.length === 0 ? [] : [{ heading, items: all }];
}

function treasureList(room: StoredPopulatedRoom): DungeonList[] {
  const treasure = room.treasure ?? [];
  if (treasure.length === 0) {
    return [];
  }
  return [
    {
      heading: 'Treasure',
      items: treasure.map(
        (item) =>
          `${item.name} — ${item.description} (${Currency.valueToString(item.value, undefined, true)})`,
      ),
    },
  ];
}

/** Which tiles a room covers, so a key lying on the floor can be attributed to it. */
function roomHolds(room: StoredPopulatedRoom, x: number, y: number): boolean {
  return (
    x >= room.x &&
    x < room.x + room.primitive.width &&
    y >= room.y &&
    y < room.y + room.primitive.height
  );
}

function keyList(snapshot: DungeonSnapshot, room: StoredPopulatedRoom): DungeonList[] {
  const keys = snapshot.keys.filter((key) => roomHolds(room, key.x, key.y));
  return keys.length === 0 ? [] : [{ heading: 'Keys', items: keys.map((key) => key.description) }];
}

function roomSection(snapshot: DungeonSnapshot, room: StoredPopulatedRoom): DungeonSection {
  return {
    heading: dungeonRoomHeading(room),
    paragraphs: [dungeonRoomMetaLine(room), room.description].filter(isPrintable),
    lists: [...encounterList(room), ...treasureList(room), ...keyList(snapshot, room)],
  };
}

/**
 * Arrange a dungeon for reading.
 *
 * The overview paragraphs are the theme's own two sentences — where the place is and what it was
 * built as — and both are dropped when a user has emptied them, which retheming and editing both
 * allow.
 */
export function dungeonToDocument(snapshot: DungeonSnapshot): DungeonDocument {
  return {
    title: dungeonDisplayName(snapshot),
    paragraphs: [
      snapshot.theme.environment.description,
      snapshot.theme.blueprint.description,
    ].filter(isPrintable),
    sections: snapshot.rooms.map((room) => roomSection(snapshot, room)),
  };
}

/** A dungeon as Markdown, for a referee who wants it in their own notes. */
export function dungeonToMarkdown(snapshot: DungeonSnapshot): string {
  const document = dungeonToDocument(snapshot);
  const blocks = [`# ${document.title}`, ...document.paragraphs];

  for (const section of document.sections) {
    blocks.push(`## ${section.heading}`, ...section.paragraphs);
    for (const list of section.lists) {
      blocks.push(`### ${list.heading}`, list.items.map((item) => `- ${item}`).join('\n'));
    }
  }

  return `${blocks.join('\n\n')}\n`;
}

/** The body of the PDF: the same document as plain text, without the title the PDF draws itself. */
export function dungeonToText(snapshot: DungeonSnapshot): string {
  const document = dungeonToDocument(snapshot);
  const blocks = [...document.paragraphs];

  for (const section of document.sections) {
    blocks.push([section.heading.toUpperCase(), ...section.paragraphs].join('\n'));
    for (const list of section.lists) {
      blocks.push([list.heading, ...list.items].join('\n'));
    }
  }

  return blocks.join('\n\n');
}

/**
 * A filename stem for an exported dungeon, reduced to something a filesystem takes.
 *
 * A dungeon with no name of its own gets the bare stem rather than `dungeon-dungeon`: the fallback
 * display name is already the word this prefixes with.
 */
export function dungeonFileStem(dungeon: { name: string }): string {
  const stem = dungeonDisplayName(dungeon)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return stem === '' || stem === 'dungeon' ? 'dungeon' : `dungeon-${stem}`;
}
