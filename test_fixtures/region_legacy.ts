import { generate } from '../src/lib/regions/regions';
import { rollRegion, rollRegionSnapshot } from '../src/lib/regions/region_roll';

/** Explicit pre-editorial fixture: exercises the retained legacy reading path. */
export function legacyRegionSnapshot(...args: Parameters<typeof rollRegionSnapshot>) {
  const snapshot = rollRegionSnapshot(...args);
  delete snapshot.gazetteer;
  return snapshot;
}

export function legacyRegion(...args: Parameters<typeof rollRegion>) {
  const result = rollRegion(...args);
  delete result.region.gazetteer;
  return result;
}

export function legacyGenerate(...args: Parameters<typeof generate>) {
  const region = generate(...args);
  delete region.gazetteer;
  return region;
}
