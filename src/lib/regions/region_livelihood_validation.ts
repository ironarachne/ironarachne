import type { RegionMap } from '$lib/map';
import type { RegionFacts, RegionSettlement } from './region_fact_types';
import type { SettlementDailyLifeFact } from './region_livelihood_types';
import { sameSettlement, dailyLifeInputCurrent } from './region_livelihood_evidence';
import { processingEvidenceCurrent } from './region_evidence';

const object = (value: unknown): Record<string, unknown> | null =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
const text = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;
const strings = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(text) && new Set(value).size === value.length;

/** Validate saved structure and access; the fantasy activity catalog is generation policy. */
export function dailyLifeFactsError(
  value: Record<string, unknown>,
  map: RegionMap,
  settlements: RegionSettlement[],
  settlementValid: (value: unknown) => boolean,
): string | null {
  const facts = value as unknown as RegionFacts;
  const anchorValid = (value: unknown): boolean => {
    const anchor = object(value);
    return (
      anchor !== null &&
      Array.isArray(anchor.nodeIds) &&
      anchor.nodeIds.length > 0 &&
      new Set(anchor.nodeIds).size === anchor.nodeIds.length &&
      anchor.nodeIds.every((id) => map.nodes.some((node) => node.id === id)) &&
      Array.isArray(anchor.edgeIds) &&
      new Set(anchor.edgeIds).size === anchor.edgeIds.length &&
      anchor.edgeIds.every((id) => map.edges.some((edge) => edge.id === id))
    );
  };
  for (const raw of value.dailyLife as Record<string, unknown>[]) {
    if (
      !['livelihood', 'staple', 'building-material', 'fuel', 'craft'].includes(
        String(raw.category),
      ) ||
      !text(raw.activityKey) ||
      !text(raw.siteRoleId) ||
      !settlementValid(raw.settlement) ||
      !strings(raw.areaIds) ||
      !raw.areaIds.length ||
      !anchorValid(raw.anchor)
    )
      return 'daily-life fact has invalid category, identity or location';
    const fact = raw as unknown as SettlementDailyLifeFact;
    const role = facts.settlementRoles.find((entry) => entry.id === fact.siteRoleId);
    if (!role || !sameSettlement(role.settlement, fact.settlement))
      return 'daily-life fact cites an unknown site role or different settlement';
    const areas = facts.areas.filter((entry) => fact.areaIds.includes(entry.id));
    if (
      areas.length !== fact.areaIds.length ||
      !fact.anchor.nodeIds.every(
        (id) =>
          role.anchor.nodeIds.includes(id) && areas.some((area) => area.mapNodeIds.includes(id)),
      ) ||
      !fact.anchor.edgeIds.every((id) => role.anchor.edgeIds.includes(id))
    )
      return 'daily-life fact lies outside its site or areas';
    const start = fact.anchor.nodeIds[0];
    if (fact.settlement.kind === 'embedded') {
      const target = fact.settlement.settlementId;
      const settlement = settlements.find((entry) => entry.id === target)!;
      if (settlement.snapshot.mapNodeId !== start)
        return 'daily-life fact does not match its settlement site';
    }
    if (!Array.isArray(raw.inputs) || !raw.inputs.length) return 'daily-life fact has no inputs';
    for (const inputValue of raw.inputs) {
      const input = object(inputValue);
      if (!input) return 'daily-life fact has an invalid input';
      if (input.kind === 'product') {
        const product = facts.products.find((entry) => entry.id === input.productId);
        if (!product || !sameSettlement(product.settlement, fact.settlement))
          return 'daily-life fact cites an unknown product or different settlement';
      } else if (input.kind === 'resource') {
        if (!text(input.resourceId) || !strings(input.depositIds) || !anchorValid(input.anchor))
          return 'daily-life fact has an invalid resource input';
        const resource = facts.resources.find((entry) => entry.id === input.resourceId);
        if (!resource?.anchor) return 'daily-life fact cites an unknown or unlocated resource';
        const anchor = input.anchor as { nodeIds: number[]; edgeIds: number[] };
        if (
          !anchor.nodeIds.every((id) => resource.anchor!.nodeIds.includes(id)) ||
          !anchor.edgeIds.every((id) => resource.anchor!.edgeIds.includes(id))
        )
          return 'daily-life input lies outside its source';
        if (
          !input.depositIds.every((id) => resource.depositIds.includes(id)) ||
          (resource.depositIds.length > 0 && input.depositIds.length === 0)
        )
          return 'daily-life input has an invalid deposit subset';
        const depositIds = input.depositIds;
        const deposits = facts.resourceDeposits.filter((entry) => depositIds.includes(entry.id));
        if (
          deposits.length > 0 &&
          !anchor.nodeIds.every((id) => deposits.some((entry) => entry.anchor.nodeIds.includes(id)))
        )
          return 'daily-life input cites unrelated deposit evidence';
      } else return 'daily-life fact has an unknown input kind';
    }
    if (
      fact.origin === 'generated' &&
      fact.reason?.status !== 'stale' &&
      (!processingEvidenceCurrent(fact, facts) ||
        !processingEvidenceCurrent(role, facts) ||
        !fact.inputs.every((input) =>
          dailyLifeInputCurrent(facts, map, start, fact.settlement, input),
        ))
    )
      return 'current daily-life fact uses unavailable, stale or inaccessible inputs';
  }
  return null;
}
