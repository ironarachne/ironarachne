import {
  generateArchitectureState,
  UNKNOWN_ARCHITECTURAL_SITE,
  type ArchitectureState,
} from '$lib/architecture';
import type { Settlement, SettlementArchitectureConfig } from './settlement_types';

export function generateSettlementArchitecture(
  settlement: Pick<Settlement, 'category' | 'environment'>,
  config?: SettlementArchitectureConfig,
): ArchitectureState {
  const density = ['city', 'metropolis'].includes(settlement.category.name)
    ? 'high'
    : ['town', 'borough'].includes(settlement.category.name)
      ? 'medium'
      : 'low';
  return generateArchitectureState(
    {
      seed: config?.seed ?? 'unknown-origin',
      biome: settlement.environment.biome,
      climate: settlement.environment.climate,
      site: config?.site ?? UNKNOWN_ARCHITECTURAL_SITE,
      resources: config?.resources ?? { knowledge: 'unknown', entries: [] },
      culturalPreferences: config?.culturalPreferences ?? [],
      contexts: [
        {
          id: 'residential',
          construction: 'built',
          exposure: 'exposed',
          purpose: 'residential',
          density,
          exteriorWindowsAllowed: true,
        },
      ],
    },
    12,
  );
}

/** Explicit semantic regeneration preserves all existing words unless replacement is requested. */
export function regenerateSettlementArchitecture(
  settlement: Settlement,
  config: SettlementArchitectureConfig,
  replaceSummary = false,
): Settlement {
  const architecture = generateSettlementArchitecture(settlement, config);
  if (!replaceSummary)
    architecture.summary = settlement.architecture.summary ?? architecture.summary;
  return { ...settlement, architecture };
}
