import { generateDungeon, type DungeonGeneratorConfig } from "../src/lib/dungeon/generator/generator";
import { generate as generateEnvironment, getDefaultConfig as getDefaultEnvironmentConfig } from "../src/lib/environment/environments";
import { type Mob } from "../src/lib/mobs";

function renderDungeonTerminal() {
  const environmentConfig = getDefaultEnvironmentConfig();
  const environment = generateEnvironment(environmentConfig);

  const config: DungeonGeneratorConfig = {
    seed: `dungeon-test-${Date.now()}`,
    width: 60,
    height: 40,
    environment: environment,
    blueprintName: 'Tomb',
    encounterChancePerRoom: 0.8,
    treasureChancePerRoom: 0.5
  };

  console.log(`Generating Dungeon... Seed: ${config.seed}`);
  const dungeon = generateDungeon(config);

  console.log(`\n=== MAP ===\n`);

  // Build a map of room locations so we can print their IDs (numbers)
  const roomPositions = new Map<string, string>(); // coordinate string -> roomId

  dungeon.rooms.forEach(room => {
    // Find the center of the room to place the ID digit
    const cx = Math.floor(room.x + room.primitive.width / 2);
    const cy = Math.floor(room.y + room.primitive.height / 2);
    roomPositions.set(`${cx},${cy}`, room.id);
  });

  let mapOutput = "";
  for (let y = 0; y < config.height; y++) {
    let row = "";
    for (let x = 0; x < config.width; x++) {
      const coordKey = `${x},${y}`;
      if (roomPositions.has(coordKey)) {
        // Limit ID to a single character if possible for alignment, or use last digit
        const rId = roomPositions.get(coordKey)!;
        const char = rId.length > 1 ? rId.slice(-1) : rId;
        row += ` ${char}`;
      } else {
        const tileIndex = y * config.width + x;
        const isFloor = dungeon.layout.grid.data[tileIndex];

        if (isFloor) {
          let typeStr = ".."; // floor
          // Check doors
          const isDoor = dungeon.doors.find(d => d.x === x && d.y === y);
          if (isDoor) {
            typeStr = isDoor.state == "locked" ? "LL" : (isDoor.type == "secret" ? "SS" : "DD");
          }
          const isKey = dungeon.keys.find(k => k.x === x && k.y === y);
          if (isKey) {
            typeStr = "KK";
          }
          row += typeStr;
        } else {
          row += "██"; // wall
        }
      }
    }
    mapOutput += row + "\n";
  }

  console.log(mapOutput);

  console.log(`\n=== ROOMS ===\n`);

  dungeon.rooms.forEach(room => {
    console.log(`Room [${room.id}] - ${room.name} (${room.primitive.style})`);
    console.log(`Dimensions: ${room.primitive.width}x${room.primitive.height}`);
    console.log(`Description:\n  ${room.description}`);

    if (room.encounter) {
      console.log(`\nEncounter:`);
      console.log(`  - Difficulty: ${room.encounter.difficulty}`);
      console.log(`  - Description: ${room.encounter.description}`);
      if (room.encounter.groups && room.encounter.groups.length > 0) {
        console.log(`  - Mobs:`);
        room.encounter.groups.forEach(g => {
          if (g.name) console.log(`    Group: ${g.name}`);
          g.mobs.forEach((m: Mob) => {
            console.log(`    * ${m.name} - ${m.shortDescription || m.description || 'No description'}`);
          });
        });
      }
    } else {
      console.log(`\nEncounter: None`);
    }

    if (room.treasure && room.treasure.length > 0) {
      console.log(`\nTreasure:`);
      const totalValue = room.treasure.reduce((sum, item) => sum + item.value, 0);
      console.log(`  - Total Value: ${totalValue} cp`);
      room.treasure.forEach(item => {
        console.log(`  * ${item.name} (${item.value} cp)`);
      });
    } else {
      console.log(`\nTreasure: None`);
    }

    console.log(`\n------------------------------------------------------------\n`);
  });
}

renderDungeonTerminal();
