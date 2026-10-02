import type Region from './region';
import type { RegionFacts, SettlementTarget } from './region_fact_types';
import { sameSettlement } from './region_livelihood_evidence';
import { supplyEvidenceCurrent } from './region_supply_evidence';
import { assessSettlementSupply } from './region_supply';

/** Return the saved assertions and suggestions intact, including authored and stale work. */
export function settlementSupplyContext(facts: RegionFacts, settlement: SettlementTarget) {
  return facts.supply
    .filter((fact) => sameSettlement(fact.settlement, settlement))
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

/** Recheck current support without replaying random selection or replacing stored edited text. */
export function describeSettlementSupply(
  region: Pick<Region, 'facts' | 'map'>,
  settlement: SettlementTarget,
): string {
  if (!region.facts) return '';
  const facts = region.facts;
  const assessments = new Map(
    facts.settlementRoles
      .filter((role) => sameSettlement(role.settlement, settlement))
      .flatMap((role) => assessSettlementSupply(region, role))
      .map((entry) => [entry.id, entry]),
  );
  return settlementSupplyContext(facts, settlement)
    .map((fact) => {
      const current = assessments.get(fact.id);
      return supplyEvidenceCurrent(facts, fact) &&
        current?.needKey === fact.needKey &&
        current.status === fact.status &&
        JSON.stringify(current.missingInputKeys) === JSON.stringify(fact.missingInputKeys)
        ? fact.description
        : `${fact.name || 'Supply assertion'} needs review because its supporting assessment is stale.`;
    })
    .filter((text) => text.trim().length > 0)
    .join(' ');
}
