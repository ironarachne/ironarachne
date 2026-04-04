import type { Variation } from './variation.js';

import { renderBlazon } from './variation.js';

export type Field = {
  name: string;
  blazon: string;
  variationCount: number;
  pattern: string;
  commonality: number;
  variations: Variation[];
};

export function renderFieldBlazon(field: Field): string {
  let blazon = field.blazon;
  if (field.variations.length > 0) {
    blazon = blazon.replace('variation1', renderBlazon(field.variations[0]));
  }
  if (field.variations.length > 1) {
    blazon = blazon.replace('variation2', renderBlazon(field.variations[1]));
  }
  return blazon;
}
