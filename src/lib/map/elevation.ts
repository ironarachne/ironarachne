import type { RegionMap, MapNode, MapCorner } from './map_graph.js';
import { createSimplexNoise2D } from '../noise/simplex.js';

/**
 * Configuration options for the elevation generator.
 */
export interface ElevationConfig {
  seed: string;
  islandShape:
    | 'radial'
    | 'square'
    | 'blob'
    | 'none'
    | 'coast-north'
    | 'coast-south'
    | 'coast-east'
    | 'coast-west'
    | 'coast-nw'
    | 'coast-sw'
    | 'coast-ne'
    | 'coast-se';
  frequency: number; // The zoom/scale of the noise (e.g. 2.5)
  hasMountainRange?: boolean; // Whether the map generates an organized mountain spine
}

/**
 * Calculates a basic distance mask value between 0 and 1 for forming island shapes.
 * 1 means land (center), 0 means ocean (edge).
 */
const getMaskValue = (
  x: number,
  y: number,
  width: number,
  height: number,
  shape: string,
): number => {
  const nx = 2 * (x / width) - 1;
  const ny = 2 * (y / height) - 1;

  if (shape === 'radial') {
    return 1 - Math.min(1, Math.sqrt(nx * nx + ny * ny));
  } else if (shape === 'square') {
    return 1 - Math.max(Math.abs(nx), Math.abs(ny));
  } else if (shape === 'blob') {
    const angle = Math.atan2(ny, nx);
    // Add small angular variation
    const baseRadius = 0.5 + 0.4 * Math.sin(angle * 5 + 1.2);
    const dist = Math.sqrt(nx * nx + ny * ny);
    return Math.max(0, 1 - dist / baseRadius);
  } else if (shape.startsWith('coast-')) {
    // Generate a strong linear gradient that pulls down one or two edges forming a huge ocean
    let mask = 1;
    if (shape.includes('north')) mask = Math.min(mask, 1 - (ny < 0 ? Math.abs(ny) : 0));
    if (shape.includes('south')) mask = Math.min(mask, 1 - (ny > 0 ? ny : 0));
    if (shape.includes('west')) mask = Math.min(mask, 1 - (nx < 0 ? Math.abs(nx) : 0));
    if (shape.includes('east')) mask = Math.min(mask, 1 - (nx > 0 ? nx : 0));
    // The mask goes from 1.0 (inland) to 0.0 (coast).
    // Square it to make the coast sheerer and inland flatter
    mask = Math.max(0, mask);
    return mask * mask;
  }

  return 1; // 'none' meaning noise is the only factor
};

/**
 * Pure function that generates a new RegionMap with assigned elevations computed from Simplex Noise.
 * Elevation is computed per-corner and averaged per node.
 *
 * @param {RegionMap} map The base map graph
 * @param {ElevationConfig} config The elevation configuration parameters
 * @returns {RegionMap} A new RegionMap object with updated elevation data
 */
export function assignElevation(map: RegionMap, config: ElevationConfig): RegionMap {
  // Deep clone to follow functional programming paradigm
  const newMap: RegionMap = structuredClone(map);
  const { width, height } = newMap;

  const noise2D = createSimplexNoise2D(config.seed);
  const mountainNoise = createSimplexNoise2D(config.seed + 'mtn');
  const freq = config.frequency;

  // Setup basic mountain line (e.g. going roughly diagonal or vertical)
  // To keep it functional, we just use a seeded orientation
  const mAngle = (noise2D(0, 0) + 1) * Math.PI; // random angle based on seed
  const mDx = Math.cos(mAngle);
  const mDy = Math.sin(mAngle);

  // Center of map
  const cx = width / 2;
  const cy = height / 2;

  // 1. Assign Elevation to Corners
  for (let i = 0; i < newMap.corners.length; i++) {
    const c = newMap.corners[i];

    // Evaluate noise (scale coordinates by frequency, remap bounds [-1,1] to [0,1])
    const nx = (c.point.x / width) * freq;
    const ny = (c.point.y / height) * freq;

    // Add higher-frequency "octaves" for fractal noise detail
    const e1 = (noise2D(nx, ny) + 1) / 2;
    const e2 = (noise2D(nx * 2, ny * 2) + 1) / 2;
    const e3 = (noise2D(nx * 4, ny * 4) + 1) / 2;

    // Combine octaves: e.g. 1/1 + 1/2 + 1/4 ...
    let e = 1.0 * e1 + 0.5 * e2 + 0.25 * e3;
    e = e / 1.75; // Normalize max down to 1.0

    // Apply distance mask
    const mask = getMaskValue(c.point.x, c.point.y, width, height, config.islandShape);

    // Multiply mask (raises the center, lowers the edges)
    // Smoothstep mask drop-off a bit
    const flattenedMask = Math.pow(mask, 1.2);

    e = (e * 0.8 + 0.2) * flattenedMask;

    if (config.hasMountainRange) {
      // Calculate distance from point to the central spine line
      // line formula: (x - cx)*mDy - (y - cy)*mDx = 0 (signed distance)
      const distFromLine = (c.point.x - cx) * mDy - (c.point.y - cy) * mDx;

      // Make line wavy using noise
      const wave = mountainNoise((c.point.x / width) * 3, (c.point.y / height) * 3) * 0.15 * width;
      const tDist = Math.abs(distFromLine + wave);

      // Create a ridge using a sharp dropoff constraint
      const rangeWidth = Math.min(width, height) * 0.15; // 15% of map size
      if (tDist < rangeWidth) {
        // scale 1 at center of ridge to 0 at edge
        const ridgeEffect = 1 - tDist / rangeWidth;
        // Square it for a sharper peak
        const raised = ridgeEffect * ridgeEffect * 2.0; // Strong boost
        e = e + raised;
      }
    }

    // Rescale slightly to increase extremes
    c.elevation = Math.max(-1, Math.min(2.0, e * 2 - 1)); // Cap around 2.0 so we can hit > 0.85 for peaks
  }

  // 2. Compute Polygon/Node Elevations as average of its corners
  for (let i = 0; i < newMap.nodes.length; i++) {
    const n = newMap.nodes[i];
    let sumElevation = 0;

    for (const cId of n.corners) {
      sumElevation += newMap.corners[cId].elevation;
    }

    n.elevation = sumElevation / n.corners.length;
  }

  return newMap;
}
