import type { Charge } from '../../charge-types.js';
import barrelSVG from './barrel.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const barrel: Charge = {
  name: 'barrel',
  pluralName: 'barrels',
  SVG: barrelSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['barrel', 'objects'],
};
