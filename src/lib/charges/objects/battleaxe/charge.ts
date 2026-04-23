import type { ChargeGlyph } from '../../charge-types.js';
import battleaxeSVG from './battleaxe.svg?raw';

export const battleaxe: ChargeGlyph = {
  name: 'battleaxe',
  pluralName: 'battleaxes',
  SVG: battleaxeSVG,
  chargeType: 'regular',
  tags: ['weapon', 'axe', 'battle'],
};
