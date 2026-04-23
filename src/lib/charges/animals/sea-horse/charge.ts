import type { ChargeGlyph } from '../../charge-types.js';
import seaHorseSVG from './sea-horse.svg?raw';

export const seaHorse: ChargeGlyph = {
  name: 'sea horse',
  pluralName: 'seas horse',
  SVG: seaHorseSVG,
  chargeType: 'regular',
  tags: ['sea', 'horse', 'animals'],
};
