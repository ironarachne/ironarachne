import type { Charge } from '../../charge-types.js';
import skullSVG from './skull.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const skull: Charge = {
  name: 'skull',
  pluralName: 'skulls',
  SVG: skullSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['skull', 'symbols'],
};
