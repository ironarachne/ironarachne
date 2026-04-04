import { describe, it, expect } from 'vitest';
import { generateRoom } from './generator';
import { getTile } from '../grid/grid';

describe('Room Primitive Generator', () => {
  it('should generate a rectangle room taking bounds into account', () => {
    const room = generateRoom('seed1', 5, 5, 'rectangle');

    expect(room.style).toBe('rectangle');
    expect(room.width).toBeLessThanOrEqual(5);
    expect(room.height).toBeLessThanOrEqual(5);
    expect(room.width).toBeGreaterThanOrEqual(3);
    expect(room.height).toBeGreaterThanOrEqual(3);

    // Every tile should be true (floor) for a generated rectangle
    let allTrue = true;
    for (let y = 0; y < room.height; y++) {
      for (let x = 0; x < room.width; x++) {
        if (getTile(room.shape, x, y) !== true) {
          allTrue = false;
        }
      }
    }
    expect(allTrue).toBe(true);
  });

  it('should generate a circular room', () => {
    const room = generateRoom('seed2', 6, 6, 'circle');
    expect(room.style).toBe('circle');

    // At least the center should be true
    const cx = Math.floor(room.width / 2);
    const cy = Math.floor(room.height / 2);
    expect(getTile(room.shape, cx, cy)).toBe(true);
  });

  it('should generate an l-shape room', () => {
    const room = generateRoom('seed3', 7, 7, 'l-shape');
    expect(room.style).toBe('l-shape');

    // An L-shape will have some missing (false) corner tiles
    let falseCount = 0;
    for (let y = 0; y < room.height; y++) {
      for (let x = 0; x < room.width; x++) {
        if (getTile(room.shape, x, y) === false) {
          falseCount++;
        }
      }
    }
    // If room is large enough, there should be at least one false tile
    if (room.width >= 3 && room.height >= 3) {
      expect(falseCount).toBeGreaterThan(0);
    }
  });

  it('should generate a blob room', () => {
    const room = generateRoom('seed4', 8, 8, 'blob');
    expect(room.style).toBe('blob');

    // Blobs use ~60% space of their internal bounding box.
    let trueCount = 0;
    for (let y = 0; y < room.height; y++) {
      for (let x = 0; x < room.width; x++) {
        if (getTile(room.shape, x, y) === true) {
          trueCount++;
        }
      }
    }
    expect(trueCount).toBeGreaterThan(0);
    const ratio = trueCount / (room.width * room.height);
    expect(ratio).toBeGreaterThanOrEqual(0.5); // Using rough approximation since bounds shift
  });
});
