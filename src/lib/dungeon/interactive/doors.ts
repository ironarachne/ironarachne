import * as RNG from '@ironarachne/rng';
import { getTile, getNeighbors } from '../grid/grid';
import type { DungeonLayout, PlacedRoom } from '../layout/types';
import type { Door, DoorType, DoorState } from './types';

/**
 * Checks if a specific tile is a valid chokepoint/doorway.
 * Valid doorways must have walls on exactly two opposite sides,
 * and floor on the other two opposite sides.
 */
function isValidDoorwayPoint(layout: DungeonLayout, x: number, y: number): boolean {
  const isFloor = getTile(layout.grid, x, y);
  if (!isFloor) return false;

  // Treat out-of-bounds as walls (false)
  const n = getTile(layout.grid, x, y - 1) ?? false;
  const s = getTile(layout.grid, x, y + 1) ?? false;
  const e = getTile(layout.grid, x + 1, y) ?? false;
  const w = getTile(layout.grid, x - 1, y) ?? false;

  // Horizontal hallway: walls north/south, floors east/west
  const isHorizontalChoke = !n && !s && e && w;
  // Vertical hallway: walls east/west, floors north/south
  const isVerticalChoke = !e && !w && n && s;

  return isHorizontalChoke || isVerticalChoke;
}

/**
 * Sweeps the perimeter of every room to find valid doorway spots.
 */
function findPotentialDoorways(layout: DungeonLayout): { x: number; y: number }[] {
  const doorwayCandidates = new Set<string>();
  const candidatesStr: { x: number; y: number }[] = [];

  // Check a 1-tile padded aura around each room where a corridor might have punched through
  for (const room of layout.rooms) {
    // Expand bounds by 1 to catch exits
    const startX = room.x - 1;
    const startY = room.y - 1;
    const endX = room.x + room.primitive.width;
    const endY = room.y + room.primitive.height;

    for (let y = startY; y <= endY; y++) {
      for (let x = startX; x <= endX; x++) {
        if (isValidDoorwayPoint(layout, x, y)) {
          const key = `${x},${y}`;
          if (!doorwayCandidates.has(key)) {
            doorwayCandidates.add(key);
            candidatesStr.push({ x, y });
          }
        }
      }
    }
  }

  return candidatesStr;
}

export type DoorGenerationOptions = {
  doorDensity: number; // 0.0 to 1.0 (Percentage of valid doorways that get doors)
  secretPercentage: number; // 0.0 to 1.0 (Percentage of generated doors that are hidden)
  lockedPercentage: number; // 0.0 to 1.0 (Percentage of generated doors that are locked)
};

/**
 * Places doors at valid chokepoints between rooms and corridors.
 */
export function generateDoors(
  seed: string,
  layout: DungeonLayout,
  options: DoorGenerationOptions,
): Door[] {
  const rng = new RNG.RNG(seed);
  const doors: Door[] = [];

  // Find all valid structural bottlenecks
  const potentialSpots = findPotentialDoorways(layout);

  if (potentialSpots.length === 0) return doors;

  // Shuffle spots consistently
  const shuffledSpots = potentialSpots.sort((a, b) => {
    // Pseudo-random sort based on seeded numeric evaluation of coordinates
    const valA = rng.int(1, 100) * a.x + a.y;
    const valB = rng.int(1, 100) * b.x + b.y;
    return valA - valB;
  });

  const numDoorsToSpawn = Math.floor(shuffledSpots.length * options.doorDensity);

  for (let i = 0; i < numDoorsToSpawn; i++) {
    const spot = shuffledSpots[i];

    // Determine properties
    const isSecret = rng.int(1, 100) <= options.secretPercentage * 100;
    const isLocked = rng.int(1, 100) <= options.lockedPercentage * 100;

    const type: DoorType = isSecret ? 'secret' : 'regular';
    let state: DoorState = 'closed';

    // A locked door must be closed
    if (isLocked) {
      state = 'locked';
    } else if (!isSecret && rng.int(1, 100) <= 20) {
      // Unlocked regular doors have a 20% chance to be propped open
      state = 'open';
    }

    doors.push({
      id: `door-${i}`,
      x: spot.x,
      y: spot.y,
      type,
      state,
    });
  }

  return doors;
}
