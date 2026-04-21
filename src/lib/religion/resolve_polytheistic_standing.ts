import { RNG } from '@ironarachne/rng';
import type { ReligionCategory } from './religion_types';
import type {
  PolytheisticStandingMode,
  ResolvedPolytheisticStanding,
} from './religion_complexity_types';

export function isPolytheisticCategory(category: ReligionCategory): boolean {
  return category.hasDeities && category.maxDeities > 1;
}

export function resolvePolytheisticStanding(
  mode: PolytheisticStandingMode | undefined,
  category: ReligionCategory,
  rng: RNG,
): ResolvedPolytheisticStanding | null {
  if (!isPolytheisticCategory(category)) {
    return null;
  }
  const m = mode ?? 'random';
  if (m === 'random') {
    return rng.item<ResolvedPolytheisticStanding>(['egalitarian', 'hierarchical', 'balanced']);
  }
  return m;
}
