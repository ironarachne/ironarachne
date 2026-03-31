import * as RNG from '@ironarachne/rng';
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
import type { EngineeredDungeon, PopulatedRoom } from './types';

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
  style: string,
  blueprintName: string,
  purpose: string,
  biomeFeatures: string[]
): string {
  const sizeAdjectives = ['small', 'large', 'cramped', 'spacious', 'cavernous', 'narrow'];
  const size = rng.item(sizeAdjectives);

  const roomTypes: Record<string, string> = {
    'rectangle': 'chamber',
    'circle': 'circular room',
    'l-shape': 'angled hall',
    'blob': 'cavern'
  };

  const roomType = roomTypes[style] || 'room';
  let description = `A ${size} ${roomType}, originally designed as a ${purpose.toLowerCase()}.`;

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

  // 4. Interactive Chokepoints (Locks & Keys)
  const doors = generateDoors(`${config.seed}-doors`, layout, theme.blueprint.doorOptions);
  const keys = distributeKeys(`${config.seed}-keys`, layout, doors);

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

    const description = generateRoomDescription(
      roomRng,
      room.primitive.style,
      theme.blueprint.name,
      purpose,
      theme.environment.biome.features
    );

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

  const finalName = `The ${rng.randomString(5).toUpperCase()} ${theme.name}`;

  return {
    name: finalName,
    theme,
    layout,
    rooms: populatedRooms,
    doors,
    keys,
  };
}
