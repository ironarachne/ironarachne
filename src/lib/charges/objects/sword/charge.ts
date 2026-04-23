import type { ChargeGlyph } from '../../charge-types.js';
import swordSVG from './sword.svg?raw';

export const sword: ChargeGlyph = {
  name: 'sword',
  pluralName: 'swords',
  SVG: swordSVG,
  chargeType: 'regular',
  tags: ['sword', 'objects'],
};
