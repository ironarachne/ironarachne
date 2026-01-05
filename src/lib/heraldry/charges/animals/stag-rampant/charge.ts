import type { Charge } from '../../charge-types.js';
import stagRampantSVG from './stag-rampant.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const stagRampant: Charge = {
  name: 'stag rampant',
  pluralName: 'stags rampant',
  SVG: stagRampantSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['stag', 'rampant', 'animals'],
};
