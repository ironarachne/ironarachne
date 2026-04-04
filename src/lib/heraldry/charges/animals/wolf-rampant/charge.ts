import type { Charge } from '../../charge-types.js';
import wolfRampantSVG from './wolf-rampant.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const wolfRampant: Charge = {
  name: 'wolf rampant',
  pluralName: 'wolves rampant',
  SVG: wolfRampantSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['wolf', 'rampant', 'animals'],
};
