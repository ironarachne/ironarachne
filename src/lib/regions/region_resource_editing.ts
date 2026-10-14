import { sourceSpecificSummaryIds } from './region_evidence';
import { regionContextEvidenceCurrent } from './region_context_evidence';
import type { FactBase, RegionFacts } from './region_fact_types';
import type { RegionSnapshot } from './region_snapshot';
import type { RegionResourceFactList, RegionSemanticFact } from './region_resource_types';
import { regionSemanticFactLists } from './region_fact_lists';
export { regionSemanticFactLists } from './region_fact_lists';
const lists = regionSemanticFactLists;

export function regionFactTargets(fact: RegionSemanticFact): string[] {
  const direct: string[] = (fact.assessments ?? []).flatMap((entry) =>
    entry.sources.flatMap((source) => (source.kind === 'fact' ? [source.factId] : [])),
  );
  if ('areaIds' in fact) direct.push(...fact.areaIds);
  if ('habitatIds' in fact) direct.push(...fact.habitatIds);
  if ('endpoints' in fact)
    for (const endpoint of fact.endpoints)
      if (endpoint.kind === 'notable') direct.push(endpoint.notableId);
  if ('relation' in fact && 'targetId' in fact.relation) direct.push(fact.relation.targetId);
  if ('siteRoleId' in fact) direct.push(fact.siteRoleId, ...fact.areaIds);
  if ('inputs' in fact)
    for (const input of fact.inputs) {
      if (input.kind === 'resource')
        direct.push(
          input.resourceId,
          ...('sourceId' in input && input.sourceId ? [input.sourceId] : []),
          ...input.depositIds,
        );
      if (input.kind === 'product') direct.push(input.productId);
    }
  if ('resourceIds' in fact) direct.push(...fact.resourceIds, ...fact.productIds);
  if ('geologyId' in fact) direct.push(fact.geologyId);
  if ('depositIds' in fact) direct.push(...fact.depositIds);
  if ('sourceIds' in fact) direct.push(...(fact.sourceIds ?? []));
  if ('supportingResourceIds' in fact)
    direct.push(...fact.supportingResourceIds, ...fact.supportingInhabitantIds);
  if ('source' in fact && 'resource' in fact) {
    const origin = fact.source;
    direct.push(
      origin.kind === 'wild'
        ? origin.inhabitantId
        : origin.kind === 'managed'
          ? origin.productionId
          : origin.depositId,
    );
  }
  if ('subjectId' in fact) direct.push(fact.subjectId);
  if ('relatedIds' in fact) direct.push(...fact.relatedIds);
  return direct;
}
export function staleRegionFactDependents(facts: RegionFacts, changed: Set<string>): RegionFacts {
  // Negative assessments depend on inventory membership, including newly added sources.
  const inventoryChanged = [...changed].some((id) => !id.startsWith('supply:'));
  if (inventoryChanged) for (const fact of facts.supply) changed.add(fact.id);
  const explicit = new Set(changed);
  const all = lists.flatMap<RegionSemanticFact>((list) => facts[list]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const fact of all) {
      const aggregate = sourceSpecificSummaryIds(fact);
      const affected = (id: string) => changed.has(id) && (!aggregate.has(id) || explicit.has(id));
      if (
        !changed.has(fact.id) &&
        (regionFactTargets(fact).some(affected) ||
          fact.reason?.sources.some((source) => source.kind === 'fact' && affected(source.factId)))
      ) {
        changed.add(fact.id);
        grew = true;
      }
    }
  }
  return {
    ...facts,
    ...Object.fromEntries(
      lists.map((list) => [
        list,
        facts[list].map((fact: FactBase) =>
          changed.has(fact.id) && fact.reason
            ? { ...fact, reason: { ...fact.reason, status: 'stale' } }
            : fact,
        ),
      ]),
    ),
  } as RegionFacts;
}

/** Apply an already checked removal closure and stale all transitive reason dependents. */
export function removeRegionFactIds(facts: RegionFacts, removed: Set<string>): RegionFacts {
  const retainedSources = facts.resourceSources.filter((entry) => !removed.has(entry.id));
  return staleRegionFactDependents(
    {
      ...facts,
      ...Object.fromEntries(
        lists.map((key) => [key, facts[key].filter((fact) => !removed.has(fact.id))]),
      ),
      resources: facts.resources
        .filter((entry) => !removed.has(entry.id))
        .map((entry) => {
          if (!entry.sourceIds) return entry;
          const sourceIds = entry.sourceIds.filter((sourceId) => !removed.has(sourceId));
          const sources = retainedSources.filter((source) => sourceIds.includes(source.id));
          return {
            ...entry,
            sourceIds,
            depositIds: [
              ...new Set(
                sources.flatMap((source) =>
                  source.source.kind === 'deposit' ? [source.source.depositId] : [],
                ),
              ),
            ].sort(),
            areaIds: [...new Set(sources.flatMap((source) => source.areaIds))].sort(),
            habitatIds: [...new Set(sources.flatMap((source) => source.habitatIds))].sort(),
            anchor: {
              nodeIds: [...new Set(sources.flatMap((source) => source.anchor.nodeIds))].sort(
                (a, b) => a - b,
              ),
              edgeIds: [...new Set(sources.flatMap((source) => source.anchor.edgeIds))].sort(
                (a, b) => a - b,
              ),
            },
            reason: entry.reason
              ? {
                  ...entry.reason,
                  sources: entry.reason.sources.filter(
                    (source) => source.kind !== 'fact' || !removed.has(source.factId),
                  ),
                }
              : undefined,
          };
        }),
    } as RegionFacts,
    removed,
  );
}

/** Text edits preserve semantic links and conservatively stale dependent explanations. */
export function setRegionResourceFactText(
  snapshot: RegionSnapshot,
  list: RegionResourceFactList,
  id: string,
  field: 'name' | 'description',
  value: string,
): RegionSnapshot {
  if (!snapshot.facts[list].some((fact) => fact.id === id)) return snapshot;
  const facts = {
    ...snapshot.facts,
    [list]: snapshot.facts[list].map((fact) =>
      fact.id === id ? { ...fact, [field]: value, origin: 'authored' } : fact,
    ),
  } as RegionFacts;
  return withRegionOverviewEvidence({
    ...snapshot,
    facts: staleRegionFactDependents(facts, new Set([id])),
  });
}

/** Direct generated links are removed; reason-only dependents remain with stale explanations. */
export function removeRegionResourceFact(
  snapshot: RegionSnapshot,
  list: RegionResourceFactList,
  id: string,
): RegionSnapshot {
  if (!snapshot.facts[list].some((fact) => fact.id === id)) return snapshot;
  const removed = new Set([id]);
  const all = lists.flatMap<RegionSemanticFact>((key) => snapshot.facts[key]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const fact of all) {
      const aggregate = sourceSpecificSummaryIds(fact);
      const partialSummary =
        fact.origin === 'generated' &&
        'sourceIds' in fact &&
        fact.sourceIds?.some((sourceId) => !removed.has(sourceId));
      const linked = regionFactTargets(fact).some(
        (target) =>
          removed.has(target) &&
          (!partialSummary || !fact.sourceIds?.includes(target)) &&
          (!aggregate.has(target) || target === id),
      );
      const reasonLinked = fact.reason?.sources.some(
        (source) => source.kind === 'fact' && removed.has(source.factId),
      );
      if (fact.id !== id && (linked || reasonLinked) && fact.origin === 'authored') return snapshot;
      if (!removed.has(fact.id) && linked) {
        removed.add(fact.id);
        grew = true;
      }
    }
  }
  return withRegionOverviewEvidence({
    ...snapshot,
    facts: removeRegionFactIds(snapshot.facts, removed),
  });
}

export function withRegionOverviewEvidence(snapshot: RegionSnapshot): RegionSnapshot {
  const reason = snapshot.overviewReason;
  if (
    !reason ||
    regionContextEvidenceCurrent(snapshot, {
      id: 'overview',
      name: '',
      description: '',
      origin: 'generated',
      reason,
    })
  )
    return snapshot;
  return { ...snapshot, overviewReason: { ...reason, status: 'stale' } };
}
