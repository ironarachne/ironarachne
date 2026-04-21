import type { Calendar } from '$lib/calendar';
import type { OrbitalSeasonParams, SimulationInstant } from '$lib/simulation_time';
import { seasonPhase01 } from '$lib/simulation_time';

/** Phenomenon id for weighted weather rolls (domain-specific strings allowed). */
export type WeatherPhenomenonId = string;

export type PhenomenonWeight = {
  phenomenonId: WeatherPhenomenonId;
  weight: number;
};

/**
 * Weather-sampling profile: season phase is binned; each bin holds relative weights.
 * Used by generators with RNG — this module does not roll dice itself.
 */
export type ClimateWeatherProfile = {
  id: string;
  /** Number of equal-width bins over `[0, 1)` season phase; must be >= 1. */
  seasonPhaseBinCount: number;
  /** `weightsPerBin[binIndex]` lists phenomena and non-negative weights. */
  weightsPerBin: PhenomenonWeight[][];
  /** Orbital parameters for resolving {@link seasonPhase01}. */
  orbitalParams: OrbitalSeasonParams;
};

export function validateClimateWeatherProfile(profile: ClimateWeatherProfile): string[] {
  const errors: string[] = [];
  if (!profile.id.trim()) errors.push('id must be non-empty.');
  if (!Number.isInteger(profile.seasonPhaseBinCount) || profile.seasonPhaseBinCount < 1) {
    errors.push('seasonPhaseBinCount must be a positive integer.');
  }
  if (profile.weightsPerBin.length !== profile.seasonPhaseBinCount) {
    errors.push('weightsPerBin length must equal seasonPhaseBinCount.');
  }
  profile.weightsPerBin.forEach((weights, i) => {
    weights.forEach((w, j) => {
      if (!Number.isFinite(w.weight) || w.weight < 0) {
        errors.push(`weightsPerBin[${i}][${j}].weight invalid.`);
      }
      if (!w.phenomenonId.trim()) {
        errors.push(`weightsPerBin[${i}][${j}].phenomenonId empty.`);
      }
    });
  });
  return errors;
}

export function assertValidClimateWeatherProfile(profile: ClimateWeatherProfile): void {
  const errors = validateClimateWeatherProfile(profile);
  if (errors.length > 0) throw new Error(errors.join(' '));
}

/**
 * Map continuous season phase to a bin index `[0, binCount)`.
 */
export function seasonPhaseBinIndex(profile: ClimateWeatherProfile, phase01: number): number {
  if (phase01 < 0 || phase01 >= 1) {
    throw new Error(`phase01 must be in [0, 1), got ${phase01}`);
  }
  const n = profile.seasonPhaseBinCount;
  const idx = Math.min(n - 1, Math.floor(phase01 * n));
  return idx;
}

/**
 * Resolve bin index from calendar + instant + profile orbital params.
 */
export function seasonPhaseBinIndexForInstant(
  calendar: Calendar,
  profile: ClimateWeatherProfile,
  instant: SimulationInstant,
): number {
  const phase = seasonPhase01(calendar, instant, profile.orbitalParams);
  return seasonPhaseBinIndex(profile, phase);
}

/**
 * Weights for the phenomena applicable at this instant (copy of bin entry).
 */
export function phenomenonWeightsAtInstant(
  calendar: Calendar,
  profile: ClimateWeatherProfile,
  instant: SimulationInstant,
): PhenomenonWeight[] {
  const bin = seasonPhaseBinIndexForInstant(calendar, profile, instant);
  return [...profile.weightsPerBin[bin]];
}
