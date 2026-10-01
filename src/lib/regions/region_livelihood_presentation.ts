import type { RegionFacts, SettlementTarget } from './region_fact_types';
import type { DailyLifeCategory, SettlementDailyLifeContext } from './region_livelihood_types';
import { sameSettlement, dailyLifeEvidenceCurrent } from './region_livelihood_evidence';

/** Return saved assertions with their inputs and reasons intact, including stale authored work. */
export function settlementDailyLifeContext(
  facts: RegionFacts,
  settlement: SettlementTarget,
): SettlementDailyLifeContext {
  const context: SettlementDailyLifeContext = {
    livelihood: [],
    staple: [],
    'building-material': [],
    fuel: [],
    craft: [],
  };
  for (const fact of [...facts.dailyLife].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)))
    if (sameSettlement(fact.settlement, settlement)) context[fact.category].push(fact);
  return context;
}

/** Compose saved descriptions for settlement/gazetteer consumers without replaying generation. */
export function describeSettlementDailyLife(
  facts: RegionFacts,
  settlement: SettlementTarget,
): string {
  const context = settlementDailyLifeContext(facts, settlement);
  return (Object.keys(context) as DailyLifeCategory[])
    .flatMap((category) =>
      context[category].map((fact) =>
        dailyLifeEvidenceCurrent(facts, fact)
          ? fact.description
          : `${fact.name || 'Daily-life assertion'} needs review because its supporting explanation is stale.`,
      ),
    )
    .filter((text) => text.trim().length > 0)
    .join(' ');
}
