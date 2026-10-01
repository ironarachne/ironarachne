import type { RegionFacts } from './region_fact_types';
import type { ResolvedProcessingChain } from './region_processing_types';
import { processingEvidenceCurrent } from './region_processing_resources';

/** Resolve saved data only; never replace stale/unknown products with a fresh recipe. */
export function resolveProcessingChain(
  facts: RegionFacts,
  productId: string,
): ResolvedProcessingChain {
  const result: ResolvedProcessingChain = {
    products: [],
    localInputs: [],
    imports: [],
    issues: [],
  };
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (id: string) => {
    if (visiting.has(id)) {
      result.issues.push(`Cyclic product chain: ${id}`);
      return;
    }
    if (visited.has(id)) return;
    const product = facts.products.find((entry) => entry.id === id);
    if (!product) {
      result.issues.push(`Missing product: ${id}`);
      return;
    }
    visiting.add(id);
    if (!processingEvidenceCurrent(product, facts))
      result.issues.push(`Stale or missing product evidence: ${id}`);
    for (const input of product.inputs) {
      if (input.kind === 'product') visit(input.productId);
      else if (input.kind === 'import') result.imports.push(input);
      else {
        result.localInputs.push(input);
        const resource = facts.resources.find((entry) => entry.id === input.resourceId);
        if (
          !resource ||
          !['available', 'limited'].includes(resource.availability) ||
          !processingEvidenceCurrent(resource, facts)
        )
          result.issues.push(`Unavailable local input: ${input.resourceId}`);
      }
    }
    visiting.delete(id);
    visited.add(id);
    result.products.push(product);
  };
  visit(productId);
  return result;
}
