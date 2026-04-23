import type { ChargeGlyph } from '../../charge-types.js';
import walrusSVG from './walrus.svg?raw';

export const walrus: ChargeGlyph = {
  name: 'walrus',
  pluralName: 'walruses',
  SVG: walrusSVG,
  chargeType: 'regular',
  tags: ['walrus', 'animals'],
};
