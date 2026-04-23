import type { ChargeGlyph } from '../../charge-types.js';
import heronVolantSVG from './heron-volant.svg?raw';

export const heronVolant: ChargeGlyph = {
  name: 'heron volant',
  pluralName: 'herons volant',
  SVG: heronVolantSVG,
  chargeType: 'regular',
  tags: ['volant', 'heron', 'animals'],
};
