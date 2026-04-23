import type { ChargeGlyph } from '../../charge-types.js';
import wyvernPassantSVG from './wyvern-passant.svg?raw';

export const wyvernPassant: ChargeGlyph = {
  name: 'wyvern passant',
  pluralName: 'wyverns passant',
  SVG: wyvernPassantSVG,
  chargeType: 'regular',
  tags: ['monsters', 'passant', 'wyvern'],
};
