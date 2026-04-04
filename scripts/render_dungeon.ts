import {
  generateDungeon,
  type DungeonGeneratorConfig,
} from '../src/lib/dungeon/generator/generator';
import {
  generate as generateEnvironment,
  getDefaultConfig as getDefaultEnvironmentConfig,
} from '../src/lib/environment/environments';
import { parseArgs } from 'node:util';
import { RNG } from '@ironarachne/rng';
import { BLUEPRINTS } from '../src/lib/dungeon/theme/theme';
import type { Mob } from '../src/lib/mobs/mob_types';
import { getRandomMaterial } from '../src/lib/equipment/materials';

function renderDungeonTerminal() {
  const { values } = parseArgs({
    options: {
      seed: { type: 'string', short: 's' },
      width: { type: 'string', short: 'w' },
      height: { type: 'string', short: 'h' },
      blueprint: { type: 'string', short: 'b' },
      encounterChance: { type: 'string', short: 'e' },
      treasureChance: { type: 'string', short: 't' },
    },
    strict: false,
  });

  const passedSeed = typeof values.seed === 'string' ? values.seed : `dungeon-test-${Date.now()}`;
  const seedRng = new RNG(passedSeed);

  const environmentConfig = getDefaultEnvironmentConfig();
  const environment = generateEnvironment(environmentConfig);

  const availableBlueprints = BLUEPRINTS.map((b) => b.name);
  let resolvedBlueprint = typeof values.blueprint === 'string' ? values.blueprint : undefined;

  if (!resolvedBlueprint || !availableBlueprints.includes(resolvedBlueprint)) {
    resolvedBlueprint = seedRng.item(availableBlueprints);
  }

  const config: DungeonGeneratorConfig = {
    seed: passedSeed,
    width: typeof values.width === 'string' ? parseInt(values.width, 10) : 60,
    height: typeof values.height === 'string' ? parseInt(values.height, 10) : 40,
    environment: environment,
    blueprintName: resolvedBlueprint as string,
    encounterChancePerRoom:
      typeof values.encounterChance === 'string' ? parseFloat(values.encounterChance) : 0.8,
    treasureChancePerRoom:
      typeof values.treasureChance === 'string' ? parseFloat(values.treasureChance) : 0.5,
  };

  console.log(`Generating Dungeon...`);
  console.log(`Seed: ${config.seed}`);
  console.log(`Blueprint: ${config.blueprintName}`);
  console.log(`Dimensions: ${config.width}x${config.height}`);
  console.log(
    `Encounters: ${config.encounterChancePerRoom} | Treasure: ${config.treasureChancePerRoom}`,
  );
  const dungeon = generateDungeon(config);

  console.log(`\n=== MAP ===\n`);

  // Build a map of room locations so we can print their IDs (numbers)
  const roomPositions = new Map<string, string>(); // coordinate string -> roomId
  dungeon.rooms.forEach((room) => {
    const cx = Math.floor(room.x + room.primitive.width / 2);
    const cy = Math.floor(room.y + room.primitive.height / 2);
    roomPositions.set(`${cx},${cy}`, room.id);
  });

  // Mark entrances for map rendering
  const entranceCoords = new Set<string>();
  dungeon.entrances?.forEach((e) => entranceCoords.add(`${e.x},${e.y}`));

  let mapOutput = '';
  for (let y = 0; y < config.height; y++) {
    let row = '';
    for (let x = 0; x < config.width; x++) {
      const coordKey = `${x},${y}`;
      if (entranceCoords.has(coordKey)) {
        row += 'EN';
      } else if (roomPositions.has(coordKey)) {
        // Limit ID to a single character if possible for alignment, or use last digit
        const rId = roomPositions.get(coordKey)!;
        const char = rId.length > 1 ? rId.slice(-1) : rId;
        row += ` ${char}`;
      } else {
        const tileIndex = y * config.width + x;
        const isFloor = dungeon.layout.grid.data[tileIndex];

        if (isFloor) {
          let typeStr = '..'; // floor
          // Check doors
          const isDoor = dungeon.doors.find((d) => d.x === x && d.y === y);
          if (isDoor) {
            typeStr = isDoor.state == 'locked' ? 'LL' : isDoor.type == 'secret' ? 'SS' : 'DD';
          }
          const isKey = dungeon.keys.find((k) => k.x === x && k.y === y);
          if (isKey) {
            typeStr = 'KK';
          }
          row += typeStr;
        } else {
          row += '██'; // wall
        }
      }
      if (dungeon.entrances && dungeon.entrances.length > 0) {
        console.log(`\n=== ENTRANCE(S) ===\n`);
        dungeon.entrances.forEach((e) => {
          console.log(`Entrance at (${e.x},${e.y}) in room [${e.roomId}] - type: ${e.type}`);
        });
      }
    }
    mapOutput += row + '\n';
  }

  console.log(mapOutput);

  console.log(`\n=== ROOMS ===\n`);

  dungeon.rooms.forEach((room) => {
    console.log(`Room [${room.id}] - ${room.name} (${room.primitive.style})`);
    console.log(`Dimensions: ${room.primitive.width}x${room.primitive.height}`);
    console.log(`Description:\n  ${room.description}`);

    if (room.encounter) {
      console.log(`\nEncounter:`);
      console.log(`  - Difficulty: ${room.encounter.difficulty}`);
      console.log(`  - Description: ${room.encounter.description}`);
      if (room.encounter.groups && room.encounter.groups.length > 0) {
        console.log(`  - Mobs:`);
        room.encounter.groups.forEach((g) => {
          if (g.name) console.log(`    Group: ${g.name}`);
          g.mobs.forEach((m: Mob) => {
            console.log(
              `    * ${m.name} - ${m.shortDescription || m.description || 'No description'}`,
            );
          });
        });
      }
    } else {
      console.log(`\nEncounter: None`);
    }

    // Find keys in this room
    const keysHere = dungeon.keys.filter((k) => {
      // Key is in this room if its (x, y) is within the room bounds
      return (
        k.x >= room.x &&
        k.x < room.x + room.primitive.width &&
        k.y >= room.y &&
        k.y < room.y + room.primitive.height
      );
    });

    if ((room.treasure && room.treasure.length > 0) || keysHere.length > 0) {
      console.log(`\nTreasure:`);
      if (room.treasure && room.treasure.length > 0) {
        const totalValue = room.treasure.reduce((sum, item) => sum + item.value, 0);
        console.log(`  - Total Value: ${totalValue} cp`);
        room.treasure.forEach((item) => {
          console.log(`  * ${item.name} (${item.value} cp)`);
        });
      }
      // Add key descriptions
      keysHere.forEach((key) => {
        // Find the door this key unlocks
        const door = dungeon.doors.find((d) => d.id === key.doorId);
        // Pick a random material and condition
        const rng = new RNG(`${config.seed}-keydesc-${key.id}`);
        const material = getRandomMaterial(rng);
        const conditions = [
          'tarnished',
          'shiny',
          'ancient',
          'corroded',
          'ornate',
          'heavy',
          'delicate',
          'engraved',
          'bent',
          'gleaming',
          'rusty',
          'well-oiled',
          'mysterious',
          'jagged',
          'twisted',
          'filigreed',
          'sturdy',
          'weathered',
          'gilded',
          'blackened',
        ];
        const appearances = [
          'with a bow shaped like a serpent',
          'with a handle wrapped in faded leather',
          'with intricate runes along the shaft',
          'with a head shaped like a lion',
          'with a gemstone set in the grip',
          'with a spiral pattern',
          'with a square-cut bit',
          'with a ring for a chain',
          'with a twisted stem',
          'with a sunburst motif',
          'with a tiny bell attached',
          'with a feather charm',
          'with a dragon motif',
          'with a chipped edge',
          'with a faint magical glow',
          'with a leaf-shaped bow',
          'with a wolf’s head pommel',
          'with a mosaic of colored enamel',
          'with a spiral of silver wire',
          'with a cracked handle',
        ];
        const condition = rng.item(conditions);
        const appearance = rng.item(appearances);
        let unlocks = 'an unknown door';
        if (door) {
          unlocks = `the ${door.type === 'secret' ? 'secret' : 'locked'} door at (${door.x},${door.y})`;
        }
        const desc = `A ${condition} ${material.name} key ${appearance}, which unlocks ${unlocks}.`;
        console.log(`  * ${desc}`);
      });
    } else {
      console.log(`\nTreasure: None`);
    }

    console.log(`\n------------------------------------------------------------\n`);
  });
}

renderDungeonTerminal();
