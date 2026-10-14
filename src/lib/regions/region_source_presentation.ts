import type { RegionSnapshot } from './region_snapshot';
import type { RegionSemanticFact } from './region_resource_types';
import { assessRawSourceFood, assessRegionProductFood } from './region_food';
import { createRegionEvidenceChecker } from './region_context_evidence';

/** Read saved qualification and ownership; never infer them from editable names or live catalogs. */
export function regionSourceQualifications(
  snapshot: RegionSnapshot,
  fact: RegionSemanticFact,
): string[] {
  const current = createRegionEvidenceChecker(snapshot);
  const statements: string[] = [];
  if ('producer' in fact) {
    const owner =
      fact.settlement.kind === 'embedded'
        ? snapshot.settlements.find(
            (entry) =>
              fact.settlement.kind === 'embedded' && entry.id === fact.settlement.settlementId,
          )?.snapshot.name
        : undefined;
    statements.push(
      `Managed ${fact.mode} owned by ${owner || 'the referenced settlement'}. No yield or processing capability is established.`,
    );
  }
  if ('resource' in fact && 'source' in fact) {
    const origin = fact.source;
    const parent =
      origin.kind === 'wild'
        ? snapshot.facts.ecologyInhabitants.find((entry) => entry.id === origin.inhabitantId)
        : origin.kind === 'managed'
          ? snapshot.facts.managedProduction.find((entry) => entry.id === origin.productionId)
          : snapshot.facts.resourceDeposits.find((entry) => entry.id === origin.depositId);
    statements.push(
      `Potential ${fact.resource.name} from ${parent?.name || 'a missing source'} by ${fact.method}; ${fact.availability} supply.`,
    );
    if (fact.requirements.length)
      statements.push(`Acquisition requires ${fact.requirements.join(', ')}.`);
    const summary = snapshot.facts.resources.find((entry) => entry.sourceIds?.includes(fact.id));
    const food = assessRawSourceFood(
      fact,
      (entry) =>
        !!summary && ['available', 'limited'].includes(summary.availability) && current(entry),
    );
    statements.push(foodText(food.status));
    if (food.pending.length)
      statements.push(
        `Preparation requires a reviewed provision: ${[...new Set(food.pending.flatMap((entry) => entry.allowedProductKeys))].join(', ')}.`,
      );
  } else if ('productKey' in fact) {
    const food = assessRegionProductFood(snapshot.facts, fact.id, current);
    statements.push(foodText(food.status));
    if (food.pending.length)
      statements.push('Required preparation remains unresolved in this chain.');
    if (food.requirements.length)
      statements.push(`Processing and handling assumptions: ${food.requirements.join(', ')}.`);
    if (fact.inputs.some((entry) => entry.kind === 'import'))
      statements.push('This chain includes imports; it does not establish entirely local supply.');
    statements.push(...food.issues);
  }
  if (('producer' in fact || 'resource' in fact || 'productKey' in fact) && !current(fact))
    statements.push('Supporting evidence needs review.');
  return statements;
}
function foodText(status: string): string {
  const descriptions: Record<string, string> = {
    eligible:
      'Reviewed food opportunity; acquisition, handling and preparation assumptions still apply.',
    'ingredient-only': 'Reviewed food ingredient; this is not a standalone provision.',
    'requires-preparation': 'Food requires further reviewed preparation.',
    'not-food': 'No food use is established for this part or product.',
    unknown: 'Food qualification is unknown.',
    invalid: 'Current evidence does not support a food claim.',
  };
  return descriptions[status];
}
