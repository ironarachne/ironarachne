import * as RNG from '@ironarachne/rng';
import { getTile, getNeighbors } from '../grid/grid';
import type { DungeonLayout, PlacedRoom } from '../layout/types';
import type { Door, Key } from './types';

function getRoomCenter(room: PlacedRoom): [number, number] {
  return [
    room.x + Math.floor(room.primitive.width / 2),
    room.y + Math.floor(room.primitive.height / 2),
  ];
}

/**
 * Ensures keys are distributed dynamically such that a key for a specific door
 * is always mathematically obtainable *before* needing to pass through that locked door.
 * Relies on a BFS iterative expansion zone strategy from a root designated entrance.
 */
export function distributeKeys(
  seed: string,
  layout: DungeonLayout,
  doors: Door[],
  startX?: number,
  startY?: number,
): Key[] {
  const rng = new RNG.RNG(seed);
  const keys: Key[] = [];

  // Create lookup map for fast door positional checking
  const doorMap = new Map<string, Door>();
  for (const d of doors) {
    doorMap.set(`${d.x},${d.y}`, d);
  }

  const lockedDoors = doors.filter((d) => d.state === 'locked');
  if (lockedDoors.length === 0 || layout.rooms.length === 0) return keys;

  // Simulation states
  const visited = new Set<string>();
  const frontierDoors = new Map<string, Door>();
  const unlockedLogically = new Set<string>();
  const queue: [number, number][] = [];

  // Either use the provided start coordinates or arbitrarily designate Room 0.
  let sx: number;
  let sy: number;
  if (startX !== undefined && startY !== undefined) {
    sx = startX;
    sy = startY;
  } else {
    const startRoom = layout.rooms[0];
    const center = getRoomCenter(startRoom);
    sx = center[0];
    sy = center[1];
  }
  queue.push([sx, sy]);
  visited.add(`${sx},${sy}`);

  while (queue.length > 0 || frontierDoors.size > 0) {
    // Expand BFS as far as currently logical without keys
    while (queue.length > 0) {
      const [cx, cy] = queue.shift()!;
      const neighbors = getNeighbors(layout.grid, cx, cy);

      for (const n of neighbors) {
        if (n.value === true) {
          const coordKey = `${n.x},${n.y}`;

          if (!visited.has(coordKey)) {
            const door = doorMap.get(coordKey);

            // Hit a locked door during expansion?
            if (door && door.state === 'locked' && !unlockedLogically.has(door.id)) {
              // Queue it at the literal boundary logic and block expansion until key is solved
              frontierDoors.set(door.id, door);
              continue;
            }

            visited.add(coordKey);
            queue.push([n.x, n.y]);
          }
        }
      }
    }

    // Progression gets mathematically blocked by the frontier
    // Solve one door using the currently physically accessible floorspace!
    if (frontierDoors.size > 0) {
      const frontierArray = Array.from(frontierDoors.values());
      // Randomly select which lock block to solve next
      const targetDoor = frontierArray[rng.int(0, frontierArray.length - 1)];
      frontierDoors.delete(targetDoor.id);

      // Harvest all viable key stash locations inside actual rooms
      // (We enforce keys dropping inside rooms rather than boring corridors)
      const validKeySpots: { x: number; y: number }[] = [];

      for (const room of layout.rooms) {
        for (let ry = 0; ry < room.primitive.height; ry++) {
          for (let rx = 0; rx < room.primitive.width; rx++) {
            if (getTile(room.primitive.shape, rx, ry)) {
              const gx = room.x + rx;
              const gy = room.y + ry;
              if (visited.has(`${gx},${gy}`)) {
                validKeySpots.push({ x: gx, y: gy });
              }
            }
          }
        }
      }

      if (validKeySpots.length > 0) {
        // Drop the key cleanly into our safe zone!
        const selectedSpot = validKeySpots[rng.int(0, validKeySpots.length - 1)];
        const keyId = `key-${targetDoor.id}`;

        const keyMaterials = ['iron', 'brass', 'copper', 'steel', 'silver', 'bone'];
        const keyMaterial = keyMaterials[rng.int(0, keyMaterials.length - 1)];
        const keyAdjectives = ['tarnished', 'heavy', 'intricate', 'simple', 'rusted'];
        const keyAdjective = keyAdjectives[rng.int(0, keyAdjectives.length - 1)];

        keys.push({
          id: keyId,
          doorId: targetDoor.id,
          x: selectedSpot.x,
          y: selectedSpot.y,
          description: `A ${keyAdjective} ${keyMaterial} key.`,
        });

        // Mutate the original door to reference it
        targetDoor.keyId = keyId;

        // Logically unlock the door and recommence BFS expansion
        unlockedLogically.add(targetDoor.id);
        visited.add(`${targetDoor.x},${targetDoor.y}`);
        queue.push([targetDoor.x, targetDoor.y]);
      } else {
        // Failsafe catch logic (mathematically very rare but good practice)
        unlockedLogically.add(targetDoor.id);
        visited.add(`${targetDoor.x},${targetDoor.y}`);
        queue.push([targetDoor.x, targetDoor.y]);
      }
    }
  }

  return keys;
}
