import type { Tincture } from './tinctures.js';

export type Variation = {
  name: string;
  tinctureCount: number;
  blazon: string;
  pattern: string;
  supportsFurs: boolean;
  commonality: number;
  tinctures: Tincture[];
};

export function renderBlazon(variation: Variation): string {
  let blazon = variation.blazon;
  if (variation.tinctures[0]) {
    blazon = blazon.replaceAll('tincture1', variation.tinctures[0].name);
  }
  if (variation.tinctures.length > 1 && variation.tinctures[1]) {
    blazon = blazon.replaceAll('tincture2', variation.tinctures[1].name);
  }
  return blazon;
}

export function renderSVGPattern(variation: Variation): string {
  let svg = variation.pattern;
  if (variation.tinctures[0]) {
    svg = svg.replaceAll('tincture1', `url(#${variation.tinctures[0].name})`);
  }
  if (variation.tinctureCount > 1 && variation.tinctures[1]) {
    svg = svg.replaceAll('tincture2', `url(#${variation.tinctures[1].name})`);
  }
  return svg;
}
