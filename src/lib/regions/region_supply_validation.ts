import type { RegionMap } from '$lib/map';
import type { RegionFacts, RegionSettlement } from './region_fact_types';
import type { SettlementSupplyFact } from './region_supply_types';
import { sameSettlement } from './region_livelihood_evidence';
import { supplyEvidenceCurrent } from './region_supply_evidence';

const object = (value: unknown): Record<string, unknown> | null =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
const text = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;
const strings = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(text) && new Set(value).size === value.length;

/** Structural validation stays independent of live recipe/species catalogs. */
export function supplyFactsError(
  value: Record<string, unknown>,
  map: RegionMap,
  settlements: RegionSettlement[],
  settlementValid: (value: unknown) => boolean,
): string | null {
  const facts = value as unknown as RegionFacts;
  for (const raw of value.supply as Record<string, unknown>[]) {
    const anchor = object(raw.anchor);
    if (
      !text(raw.needKey) ||
      !['limited-local', 'local-not-supported'].includes(String(raw.status)) ||
      !text(raw.siteRoleId) ||
      !settlementValid(raw.settlement) ||
      !strings(raw.areaIds) ||
      !raw.areaIds.length ||
      !strings(raw.resourceIds) ||
      !strings(raw.productIds) ||
      !strings(raw.missingInputKeys) ||
      !anchor ||
      !Array.isArray(anchor.nodeIds) ||
      anchor.nodeIds.length !== 1 ||
      !anchor.nodeIds.every((id) => map.nodes.some((node) => node.id === id)) ||
      !Array.isArray(anchor.edgeIds) ||
      new Set(anchor.edgeIds).size !== anchor.edgeIds.length ||
      !anchor.edgeIds.every((id) => map.edges.some((edge) => edge.id === id))
    )
      return 'supply fact has invalid identity, status or location';
    const fact = raw as unknown as SettlementSupplyFact;
    const role = facts.settlementRoles.find((entry) => entry.id === fact.siteRoleId);
    if (!role || !sameSettlement(role.settlement, fact.settlement))
      return 'supply fact cites an unknown site role or different settlement';
    const areas = facts.areas.filter((entry) => fact.areaIds.includes(entry.id));
    if (
      areas.length !== fact.areaIds.length ||
      !fact.anchor.nodeIds.every(
        (id) =>
          role.anchor.nodeIds.includes(id) && areas.some((area) => area.mapNodeIds.includes(id)),
      ) ||
      !fact.anchor.edgeIds.every((id) => role.anchor.edgeIds.includes(id))
    )
      return 'supply fact lies outside its site or areas';
    if (fact.settlement.kind === 'embedded') {
      const target = fact.settlement.settlementId;
      if (
        settlements.find((entry) => entry.id === target)!.snapshot.mapNodeId !==
        fact.anchor.nodeIds[0]
      )
        return 'supply fact does not match its settlement site';
    }
    if (
      !fact.resourceIds.every((id) => facts.resources.some((entry) => entry.id === id)) ||
      !fact.productIds.every((id) => facts.products.some((entry) => entry.id === id))
    )
      return 'supply fact cites unknown inventory evidence';
    if (raw.importSuggestion !== undefined) {
      const suggestion = object(raw.importSuggestion);
      if (!suggestion || !text(suggestion.goodName) || !text(suggestion.explanation))
        return 'supply fact has an invalid import suggestion';
    }
    if (fact.status === 'limited-local' && fact.missingInputKeys.length)
      return 'limited local supply cannot have missing required inputs';
    if (
      fact.origin === 'generated' &&
      fact.reason?.status !== 'stale' &&
      !supplyEvidenceCurrent(facts, fact)
    )
      return 'current supply fact uses an incomplete or stale inventory assessment';
  }
  return null;
}
