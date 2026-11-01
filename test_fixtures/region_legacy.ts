import { emptyRegionHistory } from '../src/lib/regions/region_realm_identity';
import { generate } from '../src/lib/regions/regions';
import { rollRegion, rollRegionSnapshot } from '../src/lib/regions/region_roll';

/** Explicit pre-editorial, pre-history fixture: exercises the retained legacy reading path. */
export function legacyRegionSnapshot(...args: Parameters<typeof rollRegionSnapshot>) {
  const snapshot = rollRegionSnapshot(...args);
  delete snapshot.gazetteer;
  snapshot.history = emptyRegionHistory();
  return snapshot;
}

export function legacyRegion(...args: Parameters<typeof rollRegion>) {
  const result = rollRegion(...args);
  delete result.region.gazetteer;
  result.region.history = emptyRegionHistory();
  return result;
}

export function legacyGenerate(...args: Parameters<typeof generate>) {
  const region = generate(...args);
  delete region.gazetteer;
  region.history = emptyRegionHistory();
  return region;
}
