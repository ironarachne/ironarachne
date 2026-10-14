import type { FoodSuitability } from '$lib/resources';
import type { FactBase } from './region_fact_types';
import type { ProcessingInput, RegionalProductFact } from './region_processing_types';
import type { ResourceSourceFact } from './region_raw_source_types';
import type {
  FoodAssessment,
  FoodAssessmentStatus,
  FoodEvidenceCheck,
  FoodLeafRef,
  RegionFoodGraph,
} from './region_food_types';

const current = (fact: FactBase) => fact.reason?.status !== 'stale';
const positive = (availability: string) =>
  availability === 'available' || availability === 'limited';
const result = (status: FoodAssessmentStatus, issue?: string): FoodAssessment => ({
  status,
  pending: [],
  requirements: [],
  issues: issue ? [issue] : [],
});
const unique = (values: string[]) => [...new Set(values)].sort();

function qualify(food: FoodSuitability | undefined, leaf: FoodLeafRef): FoodAssessment {
  if (!food || food.kind === 'unknown') return result('unknown');
  if (food.kind === 'not-food') return result('not-food');
  if (food.preparation === 'ordinary')
    return result(food.productKeys.length ? 'invalid' : 'eligible');
  if (!food.productKeys.length)
    return result('invalid', 'Restricted food has no preparation permission.');
  return {
    ...result('requires-preparation'),
    pending: [{ leaf, allowedProductKeys: unique(food.productKeys) }],
  };
}

function sourceAssessment(source: ResourceSourceFact, evidence: FoodEvidenceCheck): FoodAssessment {
  if (!positive(source.availability) || !evidence(source))
    return result('invalid', `Unavailable food source: ${source.id}`);
  return {
    ...qualify(source.resource.food, { kind: 'source', sourceId: source.id }),
    requirements: [...source.requirements],
  };
}

/** Raw food still carries acquisition/handling assumptions; eligible never certifies raw safety. */
export function assessRawSourceFood(
  source: ResourceSourceFact,
  evidence: FoodEvidenceCheck = current,
): FoodAssessment {
  return sourceAssessment(source, evidence);
}

/** Pure saved-policy evaluation. No live catalogs, random draws or persisted preparation state. */
export function assessRegionProductFood(
  graph: RegionFoodGraph,
  productId: string,
  evidence: FoodEvidenceCheck = current,
): FoodAssessment {
  const visiting = new Set<string>();
  const memo = new Map<string, FoodAssessment>();

  const localInput = (input: Extract<ProcessingInput, { kind: 'resource' }>): FoodAssessment => {
    const summary = graph.resources.find((fact) => fact.id === input.resourceId);
    if (!summary || !positive(summary.availability))
      return result('invalid', `Unavailable resource: ${input.resourceId}`);
    if (!input.sourceId)
      return evidence(summary)
        ? result('unknown')
        : result('invalid', `Stale resource: ${summary.id}`);
    const source = graph.resourceSources.find((fact) => fact.id === input.sourceId);
    if (!source || !summary.sourceIds?.includes(source.id))
      return result('invalid', `Missing or mismatched source: ${input.sourceId}`);
    return sourceAssessment(source, evidence);
  };

  const inputAssessment = (
    product: RegionalProductFact,
    input: ProcessingInput,
    inputIndex: number,
  ): FoodAssessment => {
    if (input.kind === 'product') return visit(input.productId);
    if (input.kind === 'resource') return localInput(input);
    if (!input.explanation.trim())
      return result('invalid', 'An imported input needs an explanation.');
    const descriptor = input.foodDescriptor;
    const assessed = qualify(descriptor?.food, {
      kind: 'import',
      productId: product.id,
      inputIndex,
    });
    if (descriptor?.use === 'provision' && assessed.status === 'requires-preparation')
      return result('invalid', 'An imported provision cannot have pending preparation.');
    return {
      ...assessed,
      status:
        descriptor?.use === 'ingredient' && assessed.status === 'eligible'
          ? 'ingredient-only'
          : assessed.status,
      requirements: descriptor ? [...descriptor.requirements] : [],
    };
  };

  const processWater = (input: ProcessingInput): boolean => {
    if (input.kind !== 'resource' || input.role !== 'water') return false;
    const summary = graph.resources.find((entry) => entry.id === input.resourceId);
    return summary?.kind === 'freshwater' && positive(summary.availability) && evidence(summary);
  };

  const visit = (id: string): FoodAssessment => {
    const cached = memo.get(id);
    if (cached) return structuredClone(cached);
    if (visiting.has(id)) return result('invalid', `Cyclic food chain: ${id}`);
    const product = graph.products.find((entry) => entry.id === id);
    if (!product || !evidence(product)) return result('invalid', `Missing or stale product: ${id}`);
    if (!product.inputs.length) return result('invalid', `Product has no inputs: ${id}`);
    visiting.add(id);
    const assessed = product.inputs.map((input, index) => inputAssessment(product, input, index));
    const food = product.food;
    const issues = assessed.flatMap((entry) => entry.issues);
    const requirements = unique([
      ...product.requirements,
      ...(food?.kind === 'food' ? food.requirements : []),
      ...assessed.flatMap((entry) => entry.requirements),
    ]);
    let status: FoodAssessmentStatus =
      !food || food.kind === 'unknown'
        ? 'unknown'
        : food.kind === 'not-food'
          ? 'not-food'
          : 'eligible';
    const ingredients: FoodAssessment[] = [];
    for (const [index, input] of product.inputs.entries()) {
      const assessment = assessed[index];
      if (assessment.status === 'invalid') status = 'invalid';
      if (food?.kind !== 'food') continue;
      if (input.foodUse === undefined) {
        ingredients.push(result('unknown'));
      } else if (input.foodUse === 'ingredient' && input.role !== 'fuel') {
        ingredients.push(assessment);
      } else if (input.foodUse === 'process-water' && processWater(input)) {
        requirements.push('Appropriate handling of process water; purity is not established.');
      } else if (input.foodUse !== 'support' || input.role !== 'fuel') {
        status = 'invalid';
        issues.push(`Invalid food input role: ${id}:${index}`);
      }
    }
    let pending = ingredients.flatMap((entry) => entry.pending);
    // Clear only this node's provision permissions. Memoized prepared branches never mutate raw
    // source permissions or a sibling branch that happens to originate at the same source.
    if (food?.kind === 'food' && food.use === 'provision')
      pending = pending.filter(
        (restriction) => !restriction.allowedProductKeys.includes(product.productKey),
      );
    pending = [
      ...new Map(pending.map((restriction) => [JSON.stringify(restriction), restriction])).values(),
    ].sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b), 'en'));
    if (status !== 'invalid' && food?.kind === 'food') {
      status = !ingredients.length
        ? 'invalid'
        : ingredients.some((entry) => entry.status === 'not-food')
          ? 'not-food'
          : ingredients.some((entry) => entry.status === 'unknown')
            ? 'unknown'
            : pending.length
              ? 'requires-preparation'
              : food.use === 'ingredient'
                ? 'ingredient-only'
                : 'eligible';
    }
    visiting.delete(id);
    const output: FoodAssessment = {
      status,
      pending,
      requirements: unique(requirements),
      issues: unique(issues),
    };
    memo.set(id, output);
    return structuredClone(output);
  };
  return visit(productId);
}
