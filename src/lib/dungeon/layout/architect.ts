import * as RNG from '@ironarachne/rng';
import { createGrid, getTile, setTile, isInBounds } from '../grid/grid';
import { generateRoom } from '../room/generator';
import type { Grid } from '../grid/types';
import type { RoomPrimitive, RoomStyle } from '../room/types';
import type { DungeonLayout, PlacedRoom } from './types';

/**
 * Validates whether a room primitive can be stamped onto the master grid at (startX, startY).
 * Ensures the room fits within the map bounds and does not overlap directly or adjacently with existing terrain.
 */
function canPlaceRoom(
  masterGrid: Grid<boolean>,
  room: RoomPrimitive,
  startX: number,
  startY: number,
): boolean {
  if (
    !isInBounds(masterGrid, startX, startY) ||
    !isInBounds(masterGrid, startX + room.width - 1, startY + room.height - 1)
  ) {
    return false;
  }

  for (let ry = 0; ry < room.height; ry++) {
    for (let rx = 0; rx < room.width; rx++) {
      if (getTile(room.shape, rx, ry)) {
        const gx = startX + rx;
        const gy = startY + ry;

        // Reject if the cell itself or any of its 4 ordinal neighbors are already floor,
        // keeping a 1-tile gap minimum between independently placed rooms.
        if (
          getTile(masterGrid, gx, gy) ||
          getTile(masterGrid, gx - 1, gy) ||
          getTile(masterGrid, gx + 1, gy) ||
          getTile(masterGrid, gx, gy - 1) ||
          getTile(masterGrid, gx, gy + 1)
        ) {
          return false;
        }
      }
    }
  }

  return true;
}

/**
 * Architect subsystem that generates a high-level layout placing arbitrary room primitives
 * randomly until a specific architectural density is reached.
 *
 * @param seed - The random seed
 * @param width - The full layout map width
 * @param height - The full layout map height
 * @param density - Represented as a target floor space percentage (e.g. 0.3 for 30%)
 * @param styles - Available styles mapping to RoomStyles
 */
export function generateLayout(
  seed: string,
  width: number,
  height: number,
  density: number,
  styles: string[],
): DungeonLayout {
  const rng = new RNG.RNG(seed);
  const layoutGrid = createGrid<boolean>(width, height, false);
  const rooms: PlacedRoom[] = [];

  // Target floorspace footprint
  const targetArea = Math.floor(width * height * density);
  let currentArea = 0;

  const maxAttempts = 1500;
  let attempts = 0;

  while (currentArea < targetArea && attempts < maxAttempts) {
    attempts++;

    const styleIdx = rng.int(0, styles.length - 1);
    const style = styles[styleIdx] as RoomStyle;

    // Bounding sizes for the room based on the layout's full size
    const minW = 4;
    const minH = 4;
    const maxRoomW = Math.min(20, Math.max(minW, Math.floor(width / 3)));
    const maxRoomH = Math.min(20, Math.max(minH, Math.floor(height / 3)));

    // Guarantee deterministic local seeds derived from the master seed and attempts loop
    const roomSeed = `${seed}-room-${attempts}`;

    // Use generator constraints
    const roomW = rng.int(minW, maxRoomW);
    const roomH = rng.int(minH, maxRoomH);

    const room = generateRoom(roomSeed, roomW, roomH, style);

    // Try placing at a random layout (x,y)
    const startX = rng.int(1, width - room.width - 1);
    const startY = rng.int(1, height - room.height - 1);

    if (canPlaceRoom(layoutGrid, room, startX, startY)) {
      rooms.push({ x: startX, y: startY, primitive: room });

      let roomArea = 0;
      for (let ry = 0; ry < room.height; ry++) {
        for (let rx = 0; rx < room.width; rx++) {
          if (getTile(room.shape, rx, ry)) {
            setTile(layoutGrid, startX + rx, startY + ry, true);
            roomArea++;
          }
        }
      }
      currentArea += roomArea;
    }
  }

  return {
    width,
    height,
    grid: layoutGrid,
    rooms,
  };
}
