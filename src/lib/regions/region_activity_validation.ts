import type { RegionMap } from '$lib/map';
import type { RegionFacts, RegionSettlement } from './region_fact_types';
import type { SettlementActivityFact } from './region_activity_types';
import { dailyLifeFactsError } from './region_livelihood_validation';
import { activityEvidenceCurrent, resolveActivitySupport } from './region_activity_support';
import { regionFactTargets, regionSemanticFactLists } from './region_resource_editing';
import type { RegionSemanticFact } from './region_resource_types';
import { sameSettlement } from './region_livelihood_evidence';

const object = (value: unknown): Record<string, unknown> | null =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
const text = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;
const strings = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(text) && new Set(value).size === value.length;

/** Validate structural evidence even for authored and stale declarations, without rewriting them. */
export function activityFactsError(
  value: Record<string, unknown>,
  map: RegionMap,
  settlements: RegionSettlement[],
  settlementValid: (value: unknown) => boolean,
): string | null {
  const facts = value as unknown as RegionFacts;
  const entries = new Map(
    regionSemanticFactLists
      .flatMap<RegionSemanticFact>((key) => facts[key])
      .map((entry) => [entry.id, entry]),
  );
  const checked = new Set<string>();
  const acyclic = (id: string, path: Set<string>): boolean => {
    if (path.has(id)) return false;
    if (checked.has(id)) return true;
    const entry = entries.get(id);
    if (!entry) return true; // Missing links are checked by the structural validators.
    const next = new Set(path).add(id);
    const links = [
      ...regionFactTargets(entry),
      ...(entry.reason?.sources ?? []).flatMap((source) =>
        source.kind === 'fact' ? [source.factId] : [],
      ),
    ];
    if (!links.every((link) => acyclic(link, next))) return false;
    checked.add(id);
    return true;
  };
  for (const raw of value.activities as Record<string, unknown>[]) {
    const support = object(raw.support);
    if (!support || !['local', 'external', 'mixed', 'unknown'].includes(String(support.kind)))
      return 'activity has invalid material support';
    const unknown = support.kind === 'unknown';
    if (
      unknown &&
      (!strings(support.unresolvedRequirementKeys) ||
        !support.unresolvedRequirementKeys.length ||
        !text(support.explanation))
    )
      return 'unknown activity support needs requirements and an explanation';
    if (
      !unknown &&
      (!Array.isArray(support.inputs) ||
        !strings(support.productionIds) ||
        (!support.inputs.length && !support.productionIds.length))
    )
      return 'supported activity needs material inputs or production';
    // Reuse the established location, input-union, source and same-settlement invariants.
    // An unknown or production-only declaration still needs a valid settlement/site location.
    const probe = {
      ...raw,
      category: 'craft',
      origin: 'authored',
      inputs: unknown ? [] : support.inputs,
    };
    const structural = dailyLifeFactsError(
      { ...facts, dailyLife: [probe] },
      map,
      settlements,
      settlementValid,
    );
    if (structural && structural !== 'daily-life fact has no inputs') return structural;
    const activity = raw as unknown as SettlementActivityFact;
    if (!unknown) {
      for (const id of support.productionIds as string[]) {
        const production = facts.managedProduction.find((entry) => entry.id === id);
        if (!production || !sameSettlement(production.settlement, activity.settlement))
          return 'activity cites an unknown production or different settlement';
      }
    }
    if (activity.support.kind !== 'unknown' && activity.reason?.status !== 'stale') {
      const resolved = resolveActivitySupport(
        facts,
        map,
        activity.anchor.nodeIds[0],
        activity.settlement,
        activity.support.inputs,
        activity.support.productionIds,
      );
      if (resolved !== null && resolved !== activity.support.kind)
        return 'activity material mode disagrees with its inputs';
    }
    if (!acyclic(activity.id, new Set())) return 'activity evidence is cyclic';
    if (
      activity.origin === 'generated' &&
      activity.reason?.status !== 'stale' &&
      (!activity.reason || !activityEvidenceCurrent(facts, map, activity))
    )
      return 'current generated activity requires complete current material support';
  }
  return null;
}
