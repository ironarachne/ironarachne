import * as RNG from '@ironarachne/rng';
import * as Words from '@ironarachne/words';
import { getFantasyNameGeneratorSet } from '../../names';
import type Environment from '../../environment/environment.js';
import { getTile } from '../grid/grid';
import type { DungeonLayout, PlacedRoom } from '../layout/types';
import type { Door } from '../interactive/types';
import { buildTheme } from '../theme/theme';
import { generateLayout } from '../layout/architect';
import { connectRooms } from '../layout/corridors';
import { generateDoors } from '../interactive/doors';
import { distributeKeys } from '../interactive/keys';
import { getAllFantasyEncounterTemplates } from '../../encounters/encounter_templates';
import { generateEncounter } from '../../encounters/encounter_generation';
import { generateRandomTreasureHoard } from '../../treasure/treasure_hoard';
import { applyTagFilter } from '../../tags/tags';
import type { EngineeredDungeon, PopulatedRoom, DungeonEntrance } from './types';
import type { DungeonTheme } from '../theme/types';
import type { Encounter, EncounterTemplate } from '../../encounters/encounter_types';
import type { Item } from '../../equipment';

export type DungeonGeneratorConfig = {
  seed: string;
  width: number;
  height: number;
  environment: Environment;
  blueprintName: string; // e.g. 'Tomb', 'Stronghold'

  // Probabilities (0.0 to 1.0)
  encounterChancePerRoom?: number;
  treasureChancePerRoom?: number;
};

function generateRoomDescription(
  rng: RNG.RNG,
  width: number,
  height: number,
  style: string,
  blueprintName: string,
  purpose: string,
  biomeFeatures: string[],
): string {
  const area = width * height;
  let sizeAdjectives: string[] = [];

  if (area <= 25) {
    sizeAdjectives = ['small', 'cramped', 'tight', 'narrow', 'claustrophobic'];
  } else if (area <= 64) {
    sizeAdjectives = ['modest', 'average-sized', 'standard', 'fair-sized'];
  } else if (area <= 144) {
    sizeAdjectives = ['large', 'spacious', 'roomy', 'broad'];
  } else {
    sizeAdjectives = ['cavernous', 'vast', 'enormous', 'massive', 'colossal'];
  }

  const size = rng.item(sizeAdjectives);

  const roomTypes: Record<string, string> = {
    rectangle: 'chamber',
    circle: 'circular room',
    'l-shape': 'angled hall',
    blob: 'cavern',
  };

  const roomType = roomTypes[style] || 'room';
  const article = Words.article(size);
  const capitalizedArticle = article.charAt(0).toUpperCase() + article.slice(1);
  let description = '';
  if (blueprintName.toLowerCase() === 'natural caverns') {
    description = `${capitalizedArticle} ${size} ${roomType} known as the ${purpose.toLowerCase()}.`;
  } else {
    description = `${capitalizedArticle} ${size} ${roomType}, originally designed as a ${purpose.toLowerCase()}.`;
  }

  const flavors: Record<string, string[]> = {
    tomb: [
      'Dust covers the stone floor.',
      'The air is stale and silent.',
      'Faded carvings line the walls.',
      'Cobwebs hang from the ceiling.',
    ],
    stronghold: [
      'The stone walls are reinforced and sturdy.',
      'Signs of old patrols are visible.',
      'Weapon racks stand empty in the corners.',
      'The acoustics carry echoes from afar.',
    ],
    'arcane library': [
      'The faint smell of ozone lingers.',
      'Strange markings are burned into the floor.',
      'Broken glass from old vials crunches underfoot.',
      'The air feels unnaturally cold.',
    ],
    'natural caverns': [
      'Moisture drips from stalactites.',
      'The uneven floor is treacherous.',
      'Patches of strange fungi grow in the corners.',
      'A low breeze whistles through cracks in the stone.',
    ],
  };

  const blueprintKey = blueprintName.toLowerCase();
  if (flavors[blueprintKey]) {
    description += ` ${rng.item(flavors[blueprintKey])}`;
  }

  // Occasionally mix in a biome feature (which is already a complete sentence)
  if (biomeFeatures.length > 0 && rng.float(0, 1) > 0.5) {
    let randomFeature = rng.item(biomeFeatures);
    // Adjust outward-facing biome text to make sense inside a room
    randomFeature = randomFeature.replace(/The area is/g, `The ${roomType} is`);
    randomFeature = randomFeature.replace(/There are/g, 'There are traces of');
    description += ` ${randomFeature}`;
  }

  return description;
}

/** The first room touching the map border, and which border it touches. */
function findEdgeRoom(
  layout: DungeonLayout,
  width: number,
  height: number,
): { room: PlacedRoom; edge: string; ix: number } | null {
  for (let ix = 0; ix < layout.rooms.length; ix++) {
    const room = layout.rooms[ix];
    const { x, y, primitive } = room;
    if (x === 1) return { room, edge: 'west', ix };
    if (y === 1) return { room, edge: 'north', ix };
    if (x + primitive.width === width - 1) return { room, edge: 'east', ix };
    if (y + primitive.height === height - 1) return { room, edge: 'south', ix };
  }
  return null;
}

/** The point on an edge room's outer wall where the stairs surface. */
function entrancePointOnEdge(room: PlacedRoom, edge: string): { x: number; y: number } {
  if (edge === 'west') {
    return { x: room.x, y: room.y + Math.floor(room.primitive.height / 2) };
  }

  if (edge === 'north') {
    return { x: room.x + Math.floor(room.primitive.width / 2), y: room.y };
  }

  if (edge === 'east') {
    return {
      x: room.x + room.primitive.width - 1,
      y: room.y + Math.floor(room.primitive.height / 2),
    };
  }

  if (edge === 'south') {
    return {
      x: room.x + Math.floor(room.primitive.width / 2),
      y: room.y + room.primitive.height - 1,
    };
  }

  return { x: room.x, y: room.y };
}

/**
 * Puts the way in on the wall of a room that reaches the map border, so the stairs come up
 * outside the dungeon rather than in the middle of it. A layout with no edge room at all falls
 * back to the centre of the first room.
 */
function placeEntrance(
  layout: DungeonLayout,
  width: number,
  height: number,
): { entrances: DungeonEntrance[]; startX: number | undefined; startY: number | undefined } {
  const edgeResult = findEdgeRoom(layout, width, height);

  if (edgeResult) {
    const { room, edge, ix } = edgeResult;
    const point = entrancePointOnEdge(room, edge);

    return {
      entrances: [{ x: point.x, y: point.y, type: 'stairs', roomId: `${ix}` }],
      startX: point.x,
      startY: point.y,
    };
  }

  if (layout.rooms.length > 0) {
    const room = layout.rooms[0];
    const x = room.x + Math.floor(room.primitive.width / 2);
    const y = room.y + Math.floor(room.primitive.height / 2);

    return { entrances: [{ x, y, type: 'stairs', roomId: '0' }], startX: x, startY: y };
  }

  return { entrances: [], startX: undefined, startY: undefined };
}

/**
 * The encounter templates this dungeon's theme allows, or the whole set when the theme's tags
 * match nothing — an empty pool would leave every room unoccupied.
 */
function selectEncounterTemplates(theme: DungeonTheme): EncounterTemplate[] {
  const allTemplates = getAllFantasyEncounterTemplates();
  const validEncounterTemplates = applyTagFilter(allTemplates, {
    includeSomeTags: theme.encounterTags,
  });

  return validEncounterTemplates.length > 0 ? validEncounterTemplates : allTemplates;
}

/**
 * Which wall of this room each door sits in, for the doors that border it at all.
 *
 * A door is on a room's wall when the room's floor lies on exactly one side of it; a door
 * between two rooms therefore belongs to both, once from each side.
 */
function doorsOnRoomWalls(room: PlacedRoom, doors: Door[]): { door: Door; wall: string }[] {
  const inRoom = (x: number, y: number) => {
    const rx = x - room.x;
    const ry = y - room.y;
    if (rx >= 0 && rx < room.primitive.width && ry >= 0 && ry < room.primitive.height) {
      return getTile(room.primitive.shape, rx, ry);
    }
    return false;
  };

  const roomDoors: { door: Door; wall: string }[] = [];

  for (const door of doors) {
    let wall = '';
    if (inRoom(door.x, door.y + 1) && !inRoom(door.x, door.y - 1)) {
      wall = 'north';
    } else if (inRoom(door.x, door.y - 1) && !inRoom(door.x, door.y + 1)) {
      wall = 'south';
    } else if (inRoom(door.x + 1, door.y) && !inRoom(door.x - 1, door.y)) {
      wall = 'west';
    } else if (inRoom(door.x - 1, door.y) && !inRoom(door.x + 1, door.y)) {
      wall = 'east';
    }

    if (wall) {
      roomDoors.push({ door, wall });
    }
  }

  return roomDoors;
}

/**
 * What a room is called, given what ended up in it.
 *
 * Exported because composition re-derives it: dropping a saved encounter into a room the roll left
 * empty would otherwise leave it labelled "Abandoned Crypt" with a guard standing in it.
 */
export function roomName(
  purpose: string,
  encounter: Encounter | undefined,
  treasure: Item[] | undefined,
) {
  if (encounter) {
    return `Occupied ${purpose}`;
  }

  if (treasure && treasure.length > 0) {
    return `Hidden ${purpose}`;
  }

  return `Abandoned ${purpose}`;
}

/** Everything room population needs that is settled once for the whole dungeon. */
type RoomPopulationContext = {
  seed: string;
  theme: DungeonTheme;
  doors: Door[];
  entrances: DungeonEntrance[];
  encounterChance: number;
  treasureChance: number;
  encounterTemplates: EncounterTemplate[];
};

/**
 * Fills one room in: what lives there, what it holds, and how it reads.
 *
 * The room's own RNG is seeded from the dungeon seed and the room's index, so a room's contents
 * depend on nothing but the room — changing one room's roll cannot shift another's.
 */
function populateRoom(
  room: PlacedRoom,
  index: number,
  context: RoomPopulationContext,
): PopulatedRoom {
  const roomId = `${index}`;
  const roomSeed = `${context.seed}-room-${roomId}`;
  const roomRng = new RNG.RNG(roomSeed);

  let encounter = undefined;
  let treasure = undefined;

  if (roomRng.int(1, 100) <= Math.floor(context.encounterChance * 100)) {
    encounter = generateEncounter(`${roomSeed}-enc`, {
      possibleTemplates: context.encounterTemplates,
    });
  }

  if (roomRng.int(1, 100) <= Math.floor(context.treasureChance * 100)) {
    // Give higher value treasures to rooms that also have encounters
    const baseValue = roomRng.int(100, 1000);
    const valueMulti = encounter ? 2.5 : 1.0;

    treasure = generateRandomTreasureHoard(`${roomSeed}-trs`, {
      artObjectProportion: 0.2,
      coinProportions: 0.6,
      gemProportion: 0.2,
      magicItemProportion: 0.05,
      mundaneItemProportion: 0.1,
      targetValue: Math.floor(baseValue * valueMulti),
    });
  }

  const purpose = roomRng.item(context.theme.blueprint.roomPurposes) || 'Chamber';

  let description = generateRoomDescription(
    roomRng,
    room.primitive.width,
    room.primitive.height,
    room.primitive.style,
    context.theme.blueprint.name,
    purpose,
    context.theme.environment.biome.features,
  );

  if (context.entrances.some((e) => e.roomId === roomId && e.type === 'stairs')) {
    description += ' A set of stairs leads up to the surface.';
  }

  const doorDescs = doorsOnRoomWalls(room, context.doors).map(({ door, wall }) => {
    // `door.description` already conveys secrecy for secret doors; see buildDoor.
    return `There is ${door.description} on the ${wall} wall. It is ${door.state}.`;
  });

  if (doorDescs.length > 0) {
    description += ' ' + doorDescs.join(' ');
  }

  return {
    ...room, // includes x, y, primitive
    id: roomId,
    name: roomName(purpose, encounter, treasure),
    purpose,
    description,
    encounter,
    treasure,
  };
}

function generateDungeonName(seed: string, theme: DungeonTheme): string {
  const nameRng = new RNG.RNG(`${seed}-dungeon-title`);
  const fantasyNames = getFantasyNameGeneratorSet('tiefling', nameRng);
  const titleWord = Words.title(fantasyNames.town.generate(1)[0]);

  return `The ${titleWord} ${theme.name}`;
}

export function generateDungeon(config: DungeonGeneratorConfig): EngineeredDungeon {
  // 1. Theme Evaluation
  const theme = buildTheme(config.environment, config.blueprintName);

  // 2. Blueprint Construction Phase
  const layout = generateLayout(
    `${config.seed}-layout`,
    config.width,
    config.height,
    theme.blueprint.targetDensity,
    theme.blueprint.allowedRoomStyles,
  );

  // 3. Corridor Connectivity Graph
  connectRooms(`${config.seed}-corridors`, layout);

  // 4. Interactive Chokepoints (Locks & Keys, and Entrances)
  const doors = generateDoors(`${config.seed}-doors`, layout, theme.blueprint.doorOptions);

  const { entrances, startX, startY } = placeEntrance(layout, config.width, config.height);

  // Note: The Key distribution logic drops bare coordinates for keys.
  // Usually, you'd merge the Key objects right into the actual container or mob drops here,
  // but leaving them strictly attached to the top-level entity keeps the geometry math clean for now.
  const keys = distributeKeys(`${config.seed}-keys`, layout, doors, startX, startY);

  // 5. Room Population (Flavor, Monsters, Treasure)
  const context: RoomPopulationContext = {
    seed: config.seed,
    theme,
    doors,
    entrances,
    encounterChance: config.encounterChancePerRoom ?? 0.4,
    treasureChance: config.treasureChancePerRoom ?? 0.3,
    encounterTemplates: selectEncounterTemplates(theme),
  };

  const populatedRooms = layout.rooms.map((room, index) => populateRoom(room, index, context));

  return {
    name: generateDungeonName(config.seed, theme),
    theme,
    layout,
    rooms: populatedRooms,
    doors,
    keys,
    entrances,
  };
}
