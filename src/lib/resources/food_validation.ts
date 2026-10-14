import type {
  FoodSuitability,
  ProductFoodPolicy,
  ImportedFoodDescriptor,
  RawResourceSnapshot,
} from './raw_source_types';

const object = (value: unknown): Record<string, unknown> | null =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
const text = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;
const strings = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(text) && new Set(value).size === value.length;

/** Saved structure only: never consult today's recipe/source catalogs during validation. */
export function isFoodSuitability(value: unknown): value is FoodSuitability {
  const food = object(value);
  if (!food) return false;
  if (food.kind === 'not-food' || food.kind === 'unknown') return true;
  return (
    food.kind === 'food' &&
    strings(food.productKeys) &&
    (food.preparation === 'ordinary'
      ? food.productKeys.length === 0
      : food.preparation === 'recipe-required' && food.productKeys.length > 0)
  );
}
export function isProductFoodPolicy(value: unknown): value is ProductFoodPolicy {
  const food = object(value);
  return (
    food !== null &&
    (food.kind === 'not-food' ||
      food.kind === 'unknown' ||
      (food.kind === 'food' &&
        ['ingredient', 'provision'].includes(String(food.use)) &&
        text(food.reviewRuleId) &&
        strings(food.requirements)))
  );
}
export function isImportedFoodDescriptor(value: unknown): value is ImportedFoodDescriptor {
  const entry = object(value);
  if (
    !entry ||
    !['raw', 'product'].includes(String(entry.kind)) ||
    !text(entry.catalogKey) ||
    !text(entry.name) ||
    !text(entry.reviewRuleId) ||
    !strings(entry.requirements) ||
    !isFoodSuitability(entry.food) ||
    !['ingredient', 'provision'].includes(String(entry.use))
  )
    return false;
  if (entry.kind === 'raw' && entry.use !== 'ingredient') return false;
  return (
    entry.use !== 'provision' ||
    (entry.food.kind === 'food' && entry.food.preparation === 'ordinary')
  );
}
export function isRawResourceSnapshot(value: unknown): value is RawResourceSnapshot {
  const entry = object(value);
  if (
    !entry ||
    !text(entry.id) ||
    !text(entry.name) ||
    !text(entry.majorType) ||
    !text(entry.minorType) ||
    !strings(entry.uses) ||
    !isFoodSuitability(entry.food)
  )
    return false;
  const uses = [
    'food',
    'textile',
    'construction',
    'fuel',
    'dye',
    'pigment',
    'tanning',
    'medicinal',
    'industrial',
    'ornament',
  ];
  return (
    entry.uses.every((use) => uses.includes(use)) &&
    entry.uses.includes('food') === (entry.food.kind === 'food')
  );
}
