import { getTile } from './grid/grid';
import type { PlacedRoom } from './layout/types';
import type { Door } from './interactive/types';
/**
 * Which wall of this room each door sits in, for the doors that border it at all.
 *
 * A door is on a room's wall when the room's floor lies on exactly one side of it; a door
 * between two rooms therefore belongs to both, once from each side.
 */
export function doorsOnRoomWalls(room: PlacedRoom, doors: Door[]): { door: Door; wall: string }[] {
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
