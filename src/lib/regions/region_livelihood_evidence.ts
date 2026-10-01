import type { RegionMap } from '$lib/map';
import type { RegionFacts, SettlementTarget } from './region_fact_types';
import type { DailyLifeInput, SettlementDailyLifeFact } from './region_livelihood_types';
import { processingEvidenceCurrent, reachableProcessingNodes } from './region_evidence';
import { resolveProcessingChain } from './region_processing_chain';

export function sameSettlement(a: SettlementTarget, b: SettlementTarget): boolean {
  return (
    a.kind === b.kind &&
    (a.kind === 'embedded'
      ? b.kind === 'embedded' && a.settlementId === b.settlementId
      : b.kind === 'artifact' && a.targetId === b.targetId)
  );
}

/** Validate saved access without importing live species/recipe catalogs into the artifact registry. */
export function dailyLifeInputCurrent(
  facts: RegionFacts,
  map: RegionMap,
  start: number,
  settlement: SettlementTarget,
  input: DailyLifeInput,
): boolean {
  const reached = reachableProcessingNodes({ map }, start);
  const site = map.nodes.find((node) => node.id === start);
  const rawCurrent = (raw: Extract<DailyLifeInput, { kind: 'resource' }>): boolean => {
    const resource = facts.resources.find((entry) => entry.id === raw.resourceId);
    if (
      !site ||
      site.isWater ||
      site.isOcean ||
      !resource?.anchor ||
      !['available', 'limited'].includes(resource.availability) ||
      !processingEvidenceCurrent(resource, facts)
    )
      return false;
    const accessible = (id: number) =>
      resource.kind === 'fish'
        ? id === start ||
          map.nodes.some(
            (node) =>
              node.id === id &&
              (node.isWater || node.isOcean) &&
              (site.neighbors.includes(id) || node.neighbors.includes(start)),
          )
        : reached.has(id);
    if (
      !raw.anchor.nodeIds.length ||
      !raw.anchor.nodeIds.every((id) => resource.anchor!.nodeIds.includes(id) && accessible(id)) ||
      !raw.anchor.edgeIds.every((id) => resource.anchor!.edgeIds.includes(id)) ||
      !raw.depositIds.every((id) => resource.depositIds.includes(id)) ||
      (resource.depositIds.length > 0 && raw.depositIds.length === 0)
    )
      return false;
    const deposits = raw.depositIds.map((id) =>
      facts.resourceDeposits.find((entry) => entry.id === id),
    );
    return (
      deposits.every(
        (deposit) =>
          deposit !== undefined &&
          deposit.concentration !== 'trace' &&
          deposit.exposure !== 'deep' &&
          deposit.extraction !== 'drilling' &&
          processingEvidenceCurrent(deposit, facts),
      ) &&
      (!deposits.length ||
        raw.anchor.nodeIds.every((id) =>
          deposits.some((deposit) => deposit!.anchor.nodeIds.includes(id)),
        ))
    );
  };
  if (input.kind === 'resource') return rawCurrent(input);
  const chain = resolveProcessingChain(facts, input.productId);
  return (
    chain.issues.length === 0 &&
    chain.imports.length === 0 &&
    chain.products.length > 0 &&
    chain.products.every((product) => sameSettlement(product.settlement, settlement)) &&
    chain.localInputs.every(rawCurrent)
  );
}

/** Inspect saved direct links too: authored facts may have no generated reason graph. */
export function dailyLifeEvidenceCurrent(
  facts: RegionFacts,
  fact: SettlementDailyLifeFact,
): boolean {
  const role = facts.settlementRoles.find((entry) => entry.id === fact.siteRoleId);
  return (
    role !== undefined &&
    processingEvidenceCurrent(role, facts) &&
    processingEvidenceCurrent(fact, facts) &&
    fact.inputs.every((input) => {
      if (input.kind === 'product')
        return resolveProcessingChain(facts, input.productId).issues.length === 0;
      const resource = facts.resources.find((entry) => entry.id === input.resourceId);
      return (
        resource !== undefined &&
        ['available', 'limited'].includes(resource.availability) &&
        processingEvidenceCurrent(resource, facts) &&
        input.depositIds.every((id) => {
          const deposit = facts.resourceDeposits.find((entry) => entry.id === id);
          return deposit !== undefined && processingEvidenceCurrent(deposit, facts);
        })
      );
    })
  );
}
