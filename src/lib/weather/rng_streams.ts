import { RNG } from '@ironarachne/rng';

const PREFIX = 'ia-wx';

/**
 * Deterministic derived RNG for a nested scope (world, region, day batch, etc.).
 * Same `(baseSeed, …segments)` yields the same sequence; different paths diverge.
 */
export function weatherRngFromPath(
  baseSeed: string,
  ...pathSegments: (string | number | bigint)[]
): RNG {
  const key = [PREFIX, baseSeed, ...pathSegments.map((s) => String(s))].join('\x1e');
  return new RNG(key);
}
