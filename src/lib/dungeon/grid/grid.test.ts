import { describe, it, expect } from 'vitest';
import {
  createGrid,
  createGridWith,
  isInBounds,
  getIndex,
  getTile,
  setTile,
  getNeighbors,
  forEachCell,
} from './grid';

describe('Dungeon Grid Manager', () => {
  describe('createGrid', () => {
    it('should create a grid with the correct dimensions and initial values', () => {
      const grid = createGrid(10, 5, 0);
      expect(grid.width).toBe(10);
      expect(grid.height).toBe(5);
      expect(grid.data.length).toBe(50);
      expect(grid.data.every((val) => val === 0)).toBe(true);
    });
  });

  describe('createGridWith', () => {
    it('should create a grid using the initializer function', () => {
      const grid = createGridWith(3, 3, (x, y) => x + y);
      expect(grid.data).toEqual([
        0,
        1,
        2, // y = 0
        1,
        2,
        3, // y = 1
        2,
        3,
        4, // y = 2
      ]);
    });
  });

  describe('isInBounds', () => {
    it('should correctly identify coordinates within the grid', () => {
      const grid = createGrid(5, 5, 0);
      expect(isInBounds(grid, 0, 0)).toBe(true);
      expect(isInBounds(grid, 4, 4)).toBe(true);
      expect(isInBounds(grid, 2, 3)).toBe(true);
    });

    it('should correctly identify coordinates outside the grid', () => {
      const grid = createGrid(5, 5, 0);
      expect(isInBounds(grid, -1, 0)).toBe(false);
      expect(isInBounds(grid, 0, -1)).toBe(false);
      expect(isInBounds(grid, 5, 0)).toBe(false);
      expect(isInBounds(grid, 0, 5)).toBe(false);
    });
  });

  describe('getIndex', () => {
    it('should convert 2D coordinates to 1D index correctly', () => {
      const grid = createGrid(10, 10, 0);
      expect(getIndex(grid, 0, 0)).toBe(0);
      expect(getIndex(grid, 5, 0)).toBe(5);
      expect(getIndex(grid, 0, 1)).toBe(10);
      expect(getIndex(grid, 5, 5)).toBe(55);
    });
  });

  describe('getTile and setTile', () => {
    it('should set and get values correctly', () => {
      const grid = createGrid<number>(10, 10, 0);
      setTile(grid, 2, 3, 42);
      expect(getTile(grid, 2, 3)).toBe(42);
      expect(getTile(grid, 0, 0)).toBe(0); // Should remain unchanged
    });

    it('should handle out of bounds gracefully', () => {
      const grid = createGrid<number>(10, 10, 0);
      setTile(grid, -1, 0, 42); // Should not throw
      setTile(grid, 10, 10, 42); // Should not throw
      expect(getTile(grid, -1, 0)).toBeUndefined();
      expect(getTile(grid, 10, 10)).toBeUndefined();
    });
  });

  describe('getNeighbors', () => {
    it('should get cardinal neighbors correctly', () => {
      const grid = createGridWith(3, 3, (x, y) => `${x},${y}`);
      // Center cell
      const neighbors = getNeighbors(grid, 1, 1);
      expect(neighbors.length).toBe(4);
      const values = neighbors.map((n) => n.value);
      expect(values).toContain('1,0'); // Top
      expect(values).toContain('0,1'); // Left
      expect(values).toContain('2,1'); // Right
      expect(values).toContain('1,2'); // Bottom
      expect(values).not.toContain('0,0'); // Top-Left (diagonal)
    });

    it('should get diagonal neighbors when requested', () => {
      const grid = createGridWith(3, 3, (x, y) => `${x},${y}`);
      const neighbors = getNeighbors(grid, 1, 1, true);
      expect(neighbors.length).toBe(8);
    });

    it('should only return in-bounds neighbors for edge cells', () => {
      const grid = createGrid(3, 3, 0);
      const neighbors = getNeighbors(grid, 0, 0, true);
      expect(neighbors.length).toBe(3); // Right, Bottom, Bottom-Right
    });
  });

  describe('forEachCell', () => {
    it('should iterate over all cells', () => {
      const grid = createGrid(2, 2, 0);
      let count = 0;
      let sumX = 0;
      let sumY = 0;

      forEachCell(grid, (x, y, value) => {
        count++;
        sumX += x;
        sumY += y;
        expect(value).toBe(0);
      });

      expect(count).toBe(4);
      // x coordinates: 0, 1, 0, 1 = 2
      expect(sumX).toBe(2);
      // y coordinates: 0, 0, 1, 1 = 2
      expect(sumY).toBe(2);
    });
  });
});
