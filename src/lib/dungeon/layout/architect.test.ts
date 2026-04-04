import { describe, it, expect } from 'vitest';
import { generateLayout } from './architect';
import { getTile } from '../grid/grid';

describe('Layout Architect Generator', () => {
  it('should generate a bounded dungeon layout mapping rooms onto it', () => {
    const layout = generateLayout('layout-seed-1', 40, 40, 0.2, ['rectangle', 'circle']);

    expect(layout.width).toBe(40);
    expect(layout.height).toBe(40);
    expect(layout.rooms.length).toBeGreaterThan(0);

    // Assert the returned layout matches internal density appropriately.
    // It should stop at or near 0.2 of 1600 (approx 320 tiles).
    let totalFloorTiles = 0;
    for (let y = 0; y < layout.height; y++) {
      for (let x = 0; x < layout.width; x++) {
        if (getTile(layout.grid, x, y)) {
          totalFloorTiles++;
        }
      }
    }

    // Since placing the next room might just push it slightly above, check rough proximity.
    const actualDensity = totalFloorTiles / (40 * 40);
    expect(actualDensity).toBeGreaterThan(0);
    // We'll safely expect it to not massively overshoot density
    expect(actualDensity).toBeLessThan(0.4);
  });

  it('should place room primitives such that none directly overlap or touch', () => {
    const layout = generateLayout('layout-seed-overlap-check', 30, 30, 0.3, ['rectangle']);

    // Check for correct stamping and spacing offsets in the resulting layout
    const masterGrid = layout.grid;

    for (const pr of layout.rooms) {
      let foundInaccessibleLocalTiles = 0;

      for (let ry = 0; ry < pr.primitive.height; ry++) {
        for (let rx = 0; rx < pr.primitive.width; rx++) {
          const localFloor = getTile(pr.primitive.shape, rx, ry);
          const globalFloor = getTile(masterGrid, pr.x + rx, pr.y + ry);

          if (localFloor) {
            expect(globalFloor).toBe(true);
          } else if (!localFloor && globalFloor) {
            // Some other room's tile may be here technically,
            // but because of 1-tile gap constraints they shouldn't even be adjacent.
            foundInaccessibleLocalTiles++;
          }
        }
      }

      // By 1-tile gap logic, we shouldn't have other rooms rendering
      // completely inside its negated primitive bounds.
      expect(foundInaccessibleLocalTiles).toBe(0);
    }
  });
});
