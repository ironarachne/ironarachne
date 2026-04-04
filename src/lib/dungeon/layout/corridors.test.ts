import { describe, it, expect } from 'vitest';
import { generateLayout } from './architect';
import { connectRooms } from './corridors';
import { getTile, getNeighbors } from '../grid/grid';

describe('Layout Corridors Linker', () => {
  it('should connect all rooms so that every floor tile is accessible from any other (flood fill test)', () => {
    const layout = generateLayout('layout-seed-corridors', 40, 40, 0.2, ['rectangle']);
    connectRooms('corridor-seed', layout);

    expect(layout.rooms.length).toBeGreaterThan(1);

    // Find the first floor tile
    let startX = -1;
    let startY = -1;

    for (let y = 0; y < layout.height; y++) {
      for (let x = 0; x < layout.width; x++) {
        if (getTile(layout.grid, x, y)) {
          startX = x;
          startY = y;
          break;
        }
      }
      if (startX !== -1) break;
    }

    expect(startX).not.toBe(-1);

    // Perform a flood fill starting from (startX, startY)
    const visited = new Set<string>();
    const queue: [number, number][] = [[startX, startY]];
    visited.add(`${startX},${startY}`);

    let floorReachableCount = 0;

    while (queue.length > 0) {
      const [cx, cy] = queue.shift()!;
      floorReachableCount++;

      const neighbors = getNeighbors(layout.grid, cx, cy);
      for (const n of neighbors) {
        if (n.value === true && !visited.has(`${n.x},${n.y}`)) {
          visited.add(`${n.x},${n.y}`);
          queue.push([n.x, n.y]);
        }
      }
    }

    // Count total floor tiles in the whole grid
    let totalFloorTiles = 0;
    for (let y = 0; y < layout.height; y++) {
      for (let x = 0; x < layout.width; x++) {
        if (getTile(layout.grid, x, y)) {
          totalFloorTiles++;
        }
      }
    }

    // The number of reachable floor tiles should exactly equal the total floor tiles
    expect(floorReachableCount).toBe(totalFloorTiles);
  });
});
