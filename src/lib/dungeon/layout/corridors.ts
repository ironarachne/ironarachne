import * as RNG from '@ironarachne/rng';
import { setTile, getTile } from '../grid/grid';
import type { DungeonLayout, PlacedRoom } from './types';

function getRoomCenter(room: PlacedRoom): [number, number] {
  const cx = Math.floor(room.x + room.primitive.width / 2);
  const cy = Math.floor(room.y + room.primitive.height / 2);
  return [cx, cy];
}

function distance(p1: [number, number], p2: [number, number]): number {
  return Math.abs(p1[0] - p2[0]) + Math.abs(p1[1] - p2[1]);
}

/**
 * Connects all rooms in a dungeon layout using minimum spanning tree logic
 * to ensure every room is mutually accessible, carving L-shaped corridors.
 */
export function connectRooms(seed: string, layout: DungeonLayout): void {
  if (layout.rooms.length < 2) return;

  const rng = new RNG.RNG(seed);
  const connected = new Set<number>([0]);
  const unconnected = new Set<number>();

  for (let i = 1; i < layout.rooms.length; i++) {
    unconnected.add(i);
  }

  const { grid } = layout;

  // Helper to carve a line between two points
  const carveCorridor = (x1: number, y1: number, x2: number, y2: number) => {
    // Randomly choose whether to go horizontal first or vertical first
    const horizontalFirst = rng.int(0, 1) === 0;

    let curX = x1;
    let curY = y1;

    if (horizontalFirst) {
      while (curX !== x2) {
        setTile(grid, curX, curY, true);
        curX += curX < x2 ? 1 : -1;
      }
      while (curY !== y2) {
        setTile(grid, curX, curY, true);
        curY += curY < y2 ? 1 : -1;
      }
    } else {
      while (curY !== y2) {
        setTile(grid, curX, curY, true);
        curY += curY < y2 ? 1 : -1;
      }
      while (curX !== x2) {
        setTile(grid, curX, curY, true);
        curX += curX < x2 ? 1 : -1;
      }
    }
    // Ensure final point is set
    setTile(grid, x2, y2, true);
  };

  // Prim's algorithm approach to ensure fully connected graph
  while (unconnected.size > 0) {
    let bestDist = Infinity;
    let bestConnected = -1;
    let bestUnconnected = -1;

    for (const c of connected) {
      const centerC = getRoomCenter(layout.rooms[c]);
      for (const u of unconnected) {
        const centerU = getRoomCenter(layout.rooms[u]);
        const dist = distance(centerC, centerU);

        if (dist < bestDist) {
          bestDist = dist;
          bestConnected = c;
          bestUnconnected = u;
        }
      }
    }

    // Connect them
    const p1 = getRoomCenter(layout.rooms[bestConnected]);
    const p2 = getRoomCenter(layout.rooms[bestUnconnected]);
    carveCorridor(p1[0], p1[1], p2[0], p2[1]);

    connected.add(bestUnconnected);
    unconnected.delete(bestUnconnected);

    // Add occasional loops (15% chance to connect to another random connected room) to prevent it from being strictly a tree
    if (connected.size > 2 && rng.int(1, 100) <= 15) {
      const extraConnected = Array.from(connected)[rng.int(0, connected.size - 1)];
      if (extraConnected !== bestConnected && extraConnected !== bestUnconnected) {
        const p3 = getRoomCenter(layout.rooms[extraConnected]);
        carveCorridor(p2[0], p2[1], p3[0], p3[1]);
      }
    }
  }
}
