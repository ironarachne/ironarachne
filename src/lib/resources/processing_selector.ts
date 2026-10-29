import type { RecipeInputSelector } from './processing_types';

const text = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;
const strings = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(text) && new Set(value).size === value.length;

/** Imports carry an explicit material specification; display names never establish identity. */
export function isRecipeInputSelector(value: unknown): value is RecipeInputSelector {
  if (typeof value !== 'object' || value === null) return false;
  const selector = value as Record<string, unknown>;
  if (selector.kind === 'raw')
    return (
      text(selector.majorType) && strings(selector.minorTypes) && strings(selector.resourceNames)
    );
  if (selector.kind === 'raw-resource')
    return strings(selector.rawResourceIds) && selector.rawResourceIds.length > 0;
  if (selector.kind === 'product') return text(selector.productKey);
  return selector.kind === 'settlement-water';
}

/** The declared specification must be no broader than the required recipe slot. */
export function processingSelectorSatisfies(
  actual: RecipeInputSelector,
  expected: RecipeInputSelector,
): boolean {
  if (actual.kind !== expected.kind) return false;
  const subset = (values: string[], allowed: string[]) =>
    !allowed.length || (values.length > 0 && values.every((value) => allowed.includes(value)));
  if (actual.kind === 'raw' && expected.kind === 'raw')
    return (
      actual.majorType === expected.majorType &&
      subset(actual.minorTypes, expected.minorTypes) &&
      subset(actual.resourceNames, expected.resourceNames)
    );
  if (actual.kind === 'raw-resource' && expected.kind === 'raw-resource')
    return subset(actual.rawResourceIds, expected.rawResourceIds);
  if (actual.kind === 'product' && expected.kind === 'product')
    return actual.productKey === expected.productKey;
  return actual.kind === 'settlement-water';
}
