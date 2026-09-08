import * as RNG from '@ironarachne/rng';
import type Vertex from './vertex.js';
import type { PoissonDiskOptions } from './poisson_types';
import { distance } from './geometry.js';

/**
 * Generates points using Bridson's Poisson Disk Sampling algorithm.
 * This provides uniformly, semi-randomly distributed points across a 2D area.
 *
 * @param {number} width The width of the sample area
 * @param {number} height The height of the sample area
 * @param {number} radius The minimum distance between any two points
 * @param {RNG.RNG} rng An RNG instance for repeatable generation
 * @param {number} k The number of samples to attempt around an active point (default: 30)
 * @param {PoissonDiskOptions} options Optional output predicate and accepted-point budget
 * @returns {Vertex[]} An array of evenly distributed accepted points
 *
 * Rejected points remain in the background grid and active list, but never in the result. This
 * lets sampling reach disconnected accepted regions without guessing starting points in them.
 * The budget limits returned points, not the internal scaffold; work still scales with area/radius².
 * Omitting options preserves the existing rectangle sampling and RNG sequence.
 */
export function generatePoissonDisk(
  width: number,
  height: number,
  radius: number,
  rng: RNG.RNG,
  k: number = 30,
  options: PoissonDiskOptions = {},
): Vertex[] {
  const budget = Math.floor(options.maxPoints ?? Infinity);
  if (![width, height, radius].every((value) => Number.isFinite(value) && value > 0)) return [];
  if (!(budget > 0) || !(k > 0) || !Number.isFinite(k)) return [];
  const accept = options.accept ?? (() => true);
  const cellSize = radius / Math.SQRT2;
  const cols = Math.ceil(width / cellSize);
  const rows = Math.ceil(height / cellSize);

  const grid: (Vertex | null)[] = new Array(cols * rows).fill(null);
  const activeList: Vertex[] = [];
  const points: Vertex[] = [];

  // Add initial point
  const initialPoint: Vertex = { x: rng.float(0, width), y: rng.float(0, height) };

  const initialCol = Math.floor(initialPoint.x / cellSize);
  const initialRow = Math.floor(initialPoint.y / cellSize);

  grid[initialCol + initialRow * cols] = initialPoint;
  activeList.push(initialPoint);
  if (accept(initialPoint)) points.push(initialPoint);

  while (activeList.length > 0 && points.length < budget) {
    const activeIndex = rng.int(0, activeList.length - 1);
    const point = activeList[activeIndex];
    let found = false;

    // Generate up to k points around it
    for (let i = 0; i < k; i++) {
      const angle = rng.float(0, Math.PI * 2);
      const r = rng.float(radius, radius * 2);

      const newPoint: Vertex = {
        x: point.x + Math.cos(angle) * r,
        y: point.y + Math.sin(angle) * r,
      };

      // Check bounds
      if (newPoint.x >= 0 && newPoint.x < width && newPoint.y >= 0 && newPoint.y < height) {
        const col = Math.floor(newPoint.x / cellSize);
        const row = Math.floor(newPoint.y / cellSize);

        let ok = true;
        // Check neighboring cells
        for (let i = -2; i <= 2; i++) {
          for (let j = -2; j <= 2; j++) {
            const neighborCol = col + i;
            const neighborRow = row + j;
            if (neighborCol >= 0 && neighborCol < cols && neighborRow >= 0 && neighborRow < rows) {
              const neighbor = grid[neighborCol + neighborRow * cols];
              if (neighbor) {
                const d = distance(newPoint, neighbor);
                if (d < radius) {
                  ok = false;
                }
              }
            }
          }
        }

        if (ok) {
          found = true;
          grid[col + row * cols] = newPoint;
          activeList.push(newPoint);
          if (accept(newPoint)) points.push(newPoint);
          break; // Try an active point immediately (could also continue trying this one if we want denser packing, but Bridson's breaks here typically depending on implementation)
        }
      }
    }

    if (!found) {
      activeList.splice(activeIndex, 1);
    }
  }

  return points;
}
