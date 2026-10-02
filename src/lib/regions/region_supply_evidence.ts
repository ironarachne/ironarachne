import type { RegionFacts } from './region_fact_types';
import type { SettlementSupplyFact } from './region_supply_types';
import { processingEvidenceCurrent } from './region_evidence';

/** Missing or stale observations cannot justify an absence assertion. */
export function supplyInventoryCurrent(facts: RegionFacts): boolean {
  return (
    facts.state === 'current' &&
    facts.resources.length > 0 &&
    [...facts.resources, ...facts.resourceDeposits, ...facts.products].every((entry) =>
      processingEvidenceCurrent(entry, facts),
    ) &&
    facts.resources.every((entry) => entry.availability !== 'unknown')
  );
}

/** Inventory membership is evidence too: a new source invalidates an old negative assessment. */
export function supplyEvidenceCurrent(facts: RegionFacts, fact: SettlementSupplyFact): boolean {
  const sameIds = (saved: string[], current: { id: string }[]) =>
    saved.length === current.length && current.every((entry) => saved.includes(entry.id));
  return (
    supplyInventoryCurrent(facts) &&
    processingEvidenceCurrent(fact, facts) &&
    sameIds(fact.resourceIds, facts.resources) &&
    sameIds(fact.productIds, facts.products)
  );
}
