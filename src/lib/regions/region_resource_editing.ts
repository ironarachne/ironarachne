import type { FactBase, RegionFacts } from './region_fact_types';
import type { RegionSnapshot } from './region_snapshot';
import type { RegionResourceFactList, RegionSemanticFact } from './region_resource_types';
export const regionSemanticFactLists = [
  'supply',
  'dailyLife',
  'products',
  'areas',
  'habitats',
  'settlementRoles',
  'notables',
  'resources',
  'routes',
  'claims',
  'ecologyInhabitants',
  'ecologyRelationships',
  'geology',
  'resourceDeposits',
] as const;
const lists = regionSemanticFactLists;

export function regionFactTargets(fact: RegionSemanticFact): string[] {
  const direct: string[] = [];
  if ('areaIds' in fact) direct.push(...fact.areaIds);
  if ('habitatIds' in fact) direct.push(...fact.habitatIds);
  if ('endpoints' in fact)
    for (const endpoint of fact.endpoints)
      if (endpoint.kind === 'notable') direct.push(endpoint.notableId);
  if ('relation' in fact && 'targetId' in fact.relation) direct.push(fact.relation.targetId);
  if ('siteRoleId' in fact) direct.push(fact.siteRoleId, ...fact.areaIds);
  if ('inputs' in fact)
    for (const input of fact.inputs) {
      if (input.kind === 'resource') direct.push(input.resourceId, ...input.depositIds);
      if (input.kind === 'product') direct.push(input.productId);
    }
  if ('resourceIds' in fact) direct.push(...fact.resourceIds, ...fact.productIds);
  if ('geologyId' in fact) direct.push(fact.geologyId);
  if ('depositIds' in fact) direct.push(...fact.depositIds);
  if ('subjectId' in fact) direct.push(fact.subjectId);
  if ('relatedIds' in fact) direct.push(...fact.relatedIds);
  return direct;
}
export function staleRegionFactDependents(facts: RegionFacts, changed: Set<string>): RegionFacts {
  // Negative assessments depend on inventory membership, including newly added sources.
  const inventoryChanged = [...changed].some((id) => !id.startsWith('supply:'));
  if (inventoryChanged) for (const fact of facts.supply) changed.add(fact.id);
  const all = lists.flatMap<RegionSemanticFact>((list) => facts[list]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const fact of all) {
      if (
        !changed.has(fact.id) &&
        (regionFactTargets(fact).some((id) => changed.has(id)) ||
          fact.reason?.sources.some(
            (source) => source.kind === 'fact' && changed.has(source.factId),
          ))
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
  return staleRegionFactDependents(
    {
      ...facts,
      ...Object.fromEntries(
        lists.map((key) => [key, facts[key].filter((fact) => !removed.has(fact.id))]),
      ),
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
  return { ...snapshot, facts: staleRegionFactDependents(facts, new Set([id])) };
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
      const linked = regionFactTargets(fact).some((target) => removed.has(target));
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
  return { ...snapshot, facts: removeRegionFactIds(snapshot.facts, removed) };
}
