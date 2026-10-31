import { editorialSentenceChecker, settlementPortraitCurrent } from './region_editorial_evidence';
import { activityEvidenceCurrent } from './region_activity_support';
import type { RegionSemanticFact } from './region_resource_types';
import type { FactBase, FactReason } from './region_fact_types';
import type { RegionSnapshot } from './region_snapshot';
import {
  createRegionEvidenceChecker,
  regionContextEvidenceCurrent,
} from './region_context_evidence';
import { regionSemanticFactLists } from './region_fact_lists';

type Context = Pick<RegionSnapshot, 'facts' | 'map' | 'environment'>;
/** Legacy and authored words remain verbatim; current generated words require their evidence. */
export function regionFactReadable(context: Context, fact: FactBase): boolean {
  if (fact.origin === 'authored') return true;
  if (
    'support' in fact &&
    !activityEvidenceCurrent(
      context.facts,
      context.map,
      fact as import('./region_activity_types').SettlementActivityFact,
    )
  )
    return false;
  if (
    fact.assessments === undefined &&
    !context.facts.resources.some((entry) => entry.assessments !== undefined)
  )
    return true;
  if (fact.assessments === undefined) return regionContextEvidenceCurrent(context, fact);
  return (
    fact.assessments.some((entry) => entry.status !== 'unknown') &&
    regionContextEvidenceCurrent(context, fact)
  );
}
export function regionOverviewCurrent(context: Context, reason?: FactReason): boolean {
  return (
    reason === undefined ||
    regionContextEvidenceCurrent(context, {
      id: 'overview',
      name: '',
      description: '',
      origin: 'generated',
      reason,
    })
  );
}
export function regionInspectionFacts(snapshot: RegionSnapshot): RegionSemanticFact[] {
  return regionSemanticFactLists.flatMap<RegionSemanticFact>((key) => snapshot.facts[key]);
}

/** One memoized evidence traversal per reading pass; never cache mutable snapshots globally. */
export function regionReadingSnapshot(snapshot: RegionSnapshot): RegionSnapshot {
  const current = createRegionEvidenceChecker(snapshot);
  const modern =
    snapshot.facts.activities.length > 0 ||
    snapshot.overviewReason !== undefined ||
    snapshot.settlements.some((entry) => entry.descriptionReason !== undefined) ||
    snapshot.facts.resources.some((fact) => fact.assessments !== undefined);
  const readable = (fact: FactBase) =>
    fact.origin === 'authored' ||
    !modern ||
    ((fact.assessments === undefined ||
      fact.assessments.some((entry) => entry.status !== 'unknown')) &&
      current(fact));
  const editorialCurrent = editorialSentenceChecker(snapshot);
  return {
    ...snapshot,
    settlements: snapshot.settlements.map((entry) =>
      !entry.descriptionReason ||
      (current({
        id: `description:${entry.id}`,
        name: '',
        description: '',
        origin: 'generated',
        reason: entry.descriptionReason,
      }) &&
        settlementPortraitCurrent(snapshot, entry.id, editorialCurrent))
        ? entry
        : { ...entry, snapshot: { ...entry.snapshot, description: '' } },
    ),
    facts: {
      ...snapshot.facts,
      ...Object.fromEntries(
        regionSemanticFactLists.map((key) => [
          key,
          [
            'resources',
            'resourceDeposits',
            'geology',
            'products',
            'ecologyInhabitants',
            'ecologyRelationships',
          ].includes(key)
            ? snapshot.facts[key]
            : snapshot.facts[key].filter(readable),
        ]),
      ),
    } as RegionSnapshot['facts'],
  };
}
