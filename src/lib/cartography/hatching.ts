import { CARTOGRAPHY } from './cartography';
import type { Hatching, InkedPath } from './cartography_types';
import { sampleWaterDistance } from './water_distance';
import { traceDistanceContours } from './distance_contours';
import { createInkedPath } from './inked_paths';

/** Parallel inset bands of water, becoming sparser and lighter away from shore. */
export function createHatching(
  config: Omit<Hatching, 'toPaths'>,
  width: number,
  height: number,
): Hatching {
  const { shoreline, spacing, falloff, maxBands } = config;
  if (
    ![width, height, spacing, falloff, maxBands].every(Number.isFinite) ||
    width <= 0 ||
    height <= 0 ||
    spacing <= 0 ||
    falloff < 1 ||
    maxBands < 0 ||
    maxBands > 8 ||
    !Number.isInteger(maxBands)
  )
    throw new RangeError('Hatching needs positive dimensions/spacing, falloff >= 1, and 0–8 bands');
  return {
    ...config,
    toPaths: () => {
      if (shoreline.length < 3 || maxBands === 0) return [];
      const levels: number[] = [];
      let distance = 0;
      for (let band = 0; band < maxBands; band++) {
        distance += spacing * Math.pow(falloff, band);
        levels.push(distance);
      }
      const step = Math.min(width, height) / 175;
      const field = sampleWaterDistance(shoreline, width, height, step, levels[levels.length - 1]);
      const paths: InkedPath[] = [];
      for (let band = 0; band < levels.length; band++) {
        const ink = {
          color: CARTOGRAPHY.palette.secondary.color,
          opacity: 0.72 * Math.pow(0.72, band),
        };
        for (const contour of traceDistanceContours(field, levels[band]))
          paths.push(createInkedPath(contour.points, ink, 'hairline', contour.closed));
      }
      return paths;
    },
  };
}
