import type { Grid, Neighbor } from './types';

/**
 * Creates a new Grid with the specified width and height, filled with the initial value.
 */
export function createGrid<T>(width: number, height: number, initialValue: T): Grid<T> {
  return {
    width,
    height,
    data: Array(width * height).fill(initialValue),
  };
}

/**
 * Creates a new Grid using an initializer function to determine the value of each cell.
 */
export function createGridWith<T>(
  width: number,
  height: number,
  initializer: (x: number, y: number) => T,
): Grid<T> {
  const data: T[] = new Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      data[y * width + x] = initializer(x, y);
    }
  }
  return { width, height, data };
}

/**
 * Checks if the given (x, y) coordinates fall within the grid's boundaries.
 */
export function isInBounds(grid: Grid<unknown>, x: number, y: number): boolean {
  return x >= 0 && x < grid.width && y >= 0 && y < grid.height;
}

/**
 * Converts 2D coordinates into a 1D array index.
 * Note: Does not check bounds. Use `isInBounds` if uncertain.
 */
export function getIndex(grid: Grid<unknown>, x: number, y: number): number {
  return y * grid.width + x;
}

/**
 * Retrieves the value at the specified (x, y) coordinates.
 * Returns undefined if the coordinates are out of bounds.
 */
export function getTile<T>(grid: Grid<T>, x: number, y: number): T | undefined {
  if (!isInBounds(grid, x, y)) return undefined;
  return grid.data[getIndex(grid, x, y)];
}

/**
 * Sets the value at the specified (x, y) coordinates.
 * Mutates the grid data array in-place for procedural generation performance.
 * Does nothing if coordinates are out of bounds.
 */
export function setTile<T>(grid: Grid<T>, x: number, y: number, value: T): void {
  if (!isInBounds(grid, x, y)) return;
  grid.data[getIndex(grid, x, y)] = value;
}

/**
 * Returns an array of neighboring cells (cardinal directions by default).
 * Set `includeDiagonals` to true for all 8 surrounding cells.
 */
export function getNeighbors<T>(
  grid: Grid<T>,
  x: number,
  y: number,
  includeDiagonals = false,
): Neighbor<T>[] {
  const neighbors: Neighbor<T>[] = [];

  const directions = includeDiagonals
    ? [
        [-1, -1],
        [0, -1],
        [1, -1],
        [-1, 0],
        [1, 0],
        [-1, 1],
        [0, 1],
        [1, 1],
      ]
    : [
        [0, -1],
        [-1, 0],
        [1, 0],
        [0, 1],
      ];

  for (const [dx, dy] of directions) {
    const nx = x + dx;
    const ny = y + dy;

    if (isInBounds(grid, nx, ny)) {
      neighbors.push({
        x: nx,
        y: ny,
        value: grid.data[getIndex(grid, nx, ny)],
      });
    }
  }

  return neighbors;
}

/**
 * Iterates over every cell in the grid, executing the provided function.
 */
export function forEachCell<T>(grid: Grid<T>, fn: (x: number, y: number, value: T) => void): void {
  for (let y = 0; y < grid.height; y++) {
    for (let x = 0; x < grid.width; x++) {
      fn(x, y, grid.data[getIndex(grid, x, y)]);
    }
  }
}
