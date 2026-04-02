import * as RNG from '@ironarachne/rng';
import * as Words from '@ironarachne/words';
import { getFantasyNameGeneratorSet } from '../../names';
import type Environment from '../../environment/environment.js';
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
  biomeFeatures: string[]
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
    'rectangle': 'chamber',
    'circle': 'circular room',
    'l-shape': 'angled hall',
    'blob': 'cavern'
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
    'tomb': [
      'Dust covers the stone floor.',
      'The air is stale and silent.',
      'Faded carvings line the walls.',
      'Cobwebs hang from the ceiling.'
    ],
    'stronghold': [
      'The stone walls are reinforced and sturdy.',
      'Signs of old patrols are visible.',
      'Weapon racks stand empty in the corners.',
      'The acoustics carry echoes from afar.'
    ],
    'arcane library': [
      'The faint smell of ozone lingers.',
      'Strange markings are burned into the floor.',
      'Broken glass from old vials crunches underfoot.',
      'The air feels unnaturally cold.'
    ],
    'natural caverns': [
      'Moisture drips from stalactites.',
      'The uneven floor is treacherous.',
      'Patches of strange fungi grow in the corners.',
      'A low breeze whistles through cracks in the stone.'
    ]
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
    randomFeature = randomFeature.replace(/There are/g, "There are traces of");
    description += ` ${randomFeature}`;
  }

  return description;
}

export function generateDungeon(config: DungeonGeneratorConfig): EngineeredDungeon {

    // Helper: Find a room on the edge of the map
    function findEdgeRoom(): { room: any; edge: string; ix: number } | null {
      for (let ix = 0; ix < layout.rooms.length; ix++) {
        const room = layout.rooms[ix];
        const { x, y, primitive } = room;
        if (x === 1) return { room, edge: 'west', ix };
        if (y === 1) return { room, edge: 'north', ix };
        if (x + primitive.width === config.width - 1) return { room, edge: 'east', ix };
        if (y + primitive.height === config.height - 1) return { room, edge: 'south', ix };
      }
      return null;
    }
  const rng = new RNG.RNG(config.seed);
  const encounterChance = config.encounterChancePerRoom ?? 0.4;
  const treasureChance = config.treasureChancePerRoom ?? 0.3;

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

  let entrances: DungeonEntrance[] = [];
  const edgeResult = findEdgeRoom();
  let startX: number | undefined;
  let startY: number | undefined;

  if (edgeResult) {
    const { room, edge, ix } = edgeResult;
    let ex = room.x;
    let ey = room.y;
    if (edge === 'west') {
      ex = room.x;
      ey = room.y + Math.floor(room.primitive.height / 2);
    } else if (edge === 'north') {
      ex = room.x + Math.floor(room.primitive.width / 2);
      ey = room.y;
    } else if (edge === 'east') {
      ex = room.x + room.primitive.width - 1;
      ey = room.y + Math.floor(room.primitive.height / 2);
    } else if (edge === 'south') {
      ex = room.x + Math.floor(room.primitive.width / 2);
      ey = room.y + room.primitive.height - 1;
    }
    entrances.push({ x: ex, y: ey, type: 'stairs', roomId: `${ix}` });
    startX = ex;
    startY = ey;
  } else if (layout.rooms.length > 0) {
    const room = layout.rooms[0];
    const ex = room.x + Math.floor(room.primitive.width / 2);
    const ey = room.y + Math.floor(room.primitive.height / 2);
    entrances.push({ x: ex, y: ey, type: 'stairs', roomId: '0' });
    startX = ex;
    startY = ey;
  }

  const keys = distributeKeys(`${config.seed}-keys`, layout, doors, startX, startY);

  // 5. Encounters Preparation (Pre-fetch & Filter by tags!)
  const allTemplates = getAllFantasyEncounterTemplates();
  const validEncounterTemplates = applyTagFilter(allTemplates, {
    includeSomeTags: theme.encounterTags,
  });

  // Fallback if tags match nothing in DB
  const finalTemplatesForEncounters =
    validEncounterTemplates.length > 0 ? validEncounterTemplates : allTemplates;

  // 6. Room Population (Flavor, Monsters, Treasure)
  const populatedRooms: PopulatedRoom[] = layout.rooms.map((room, index) => {
    const roomId = `${index}`;
    const roomSeed = `${config.seed}-room-${roomId}`;
    const roomRng = new RNG.RNG(roomSeed);

    let encounter = undefined;
    let treasure = undefined;

    // Roll for Encounter
    if (roomRng.int(1, 100) <= Math.floor(encounterChance * 100)) {
      encounter = generateEncounter(`${roomSeed}-enc`, {
        possibleTemplates: finalTemplatesForEncounters,
      });
    }

    // Roll for Treasure
    if (roomRng.int(1, 100) <= Math.floor(treasureChance * 100)) {
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

    const purpose = roomRng.item(theme.blueprint.roomPurposes) || 'Chamber';
    let name = purpose;

    // Add a flavor adjective optionally based on room state
    if (encounter) {
      name = `Occupied ${name}`;
    } else if (treasure && treasure.length > 0) {
      name = `Hidden ${name}`;
    } else {
      name = `Abandoned ${name}`;
    }

    let description = generateRoomDescription(
      roomRng,
      room.primitive.width,
      room.primitive.height,
      room.primitive.style,
      theme.blueprint.name,
      purpose,
      theme.environment.biome.features
    );

    if (entrances.some((e) => e.roomId === roomId && e.type === 'stairs')) {
      description += ' A set of stairs leads up to the surface.';
    }

    return {
      ...room, // includes x, y, primitive
      id: roomId,
      name,
      purpose,
      description,
      encounter,
      treasure,
    };
  });

  // Note: The Key distribution logic drops bare coordinates for keys.
  // Usually, you'd merge the Key objects right into the actual container or mob drops here,
  // but leaving them strictly attached to the top-level entity keeps the geometry math clean for now.

  const nameRng = new RNG.RNG(`${config.seed}-dungeon-title`);
  const fantasyNames = getFantasyNameGeneratorSet('human', nameRng);
  const titleWord = Words.title(fantasyNames.town.generate(1)[0]);
  const finalName = `The ${titleWord} ${theme.name}`;

  return {
    name: finalName,
    theme,
    layout,
    rooms: populatedRooms,
    doors,
    keys,
    entrances,
  };
}
