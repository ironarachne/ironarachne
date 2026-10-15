import type { ProductContext, ProcessingProductUse } from './processing_types';
import type { ProductFoodPolicy } from './raw_source_types';

export const PROCESSING_PRODUCT_USES: readonly ProcessingProductUse[] = [
  'cloth',
  'thread',
  'cordage',
  'leather',
  'wood-construction',
  'masonry',
  'roofing',
  'container',
  'furniture',
  'fuel',
  'hand-tool',
  'weapon-component',
  'armor-component',
  'cookware',
  'writing-material',
  'lighting',
  'cleaning',
  'pigment',
  'dye',
  'ornament',
  'preserved-food',
  'prepared-food',
  'beverage',
  'food-ingredient',
];
/** Frozen compatibility meanings, not a lookup in today's recipe catalog. */
const historical: Record<string, ProductContext> = {
  'sawn-timber': { uses: ['wood-construction'], craftLabel: null },
  'construction-components': { uses: ['wood-construction'], craftLabel: 'Woodworking' },
  'woven-mats': { uses: [], craftLabel: 'Mat weaving' },
  linen: { uses: ['cloth'], craftLabel: 'Linen weaving' },
  'dressed-stone': { uses: ['masonry'], craftLabel: 'Stone dressing' },
  'iron-tools': { uses: ['hand-tool'], craftLabel: 'Basic iron toolmaking' },
  charcoal: { uses: ['fuel'], craftLabel: null },
  'smoked-provisions': { uses: ['preserved-food'], craftLabel: 'Food smoking' },
  'dried-provisions': { uses: ['preserved-food'], craftLabel: 'Food drying' },
};
export function productContext(product: {
  productKey: string;
  context?: ProductContext;
}): ProductContext {
  return (
    product.context ??
    structuredClone(
      Object.hasOwn(historical, product.productKey)
        ? historical[product.productKey]
        : { uses: [], craftLabel: null },
    )
  );
}
export function isProductContext(
  value: unknown,
  food?: ProductFoodPolicy,
): value is ProductContext {
  if (!value || typeof value !== 'object') return false;
  const context = value as Record<string, unknown>;
  if (
    !Array.isArray(context.uses) ||
    new Set(context.uses).size !== context.uses.length ||
    !context.uses.every((use) => PROCESSING_PRODUCT_USES.includes(use)) ||
    !(
      context.craftLabel === null ||
      (typeof context.craftLabel === 'string' && context.craftLabel.trim())
    )
  )
    return false;
  return context.uses.every(
    (use) =>
      !['preserved-food', 'prepared-food', 'beverage', 'food-ingredient'].includes(use) ||
      (food?.kind === 'food' && (use === 'food-ingredient' || food.use === 'provision')),
  );
}
