import type { Charge } from '../../charge-types.js';
import thistleSVG from './thistle.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const thistle: Charge = {
  name: 'thistle',
  pluralName: 'thistles',
  SVG: thistleSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['thistle', 'plants'],
};
