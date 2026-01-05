import type { Charge } from '../../charge-types.js';
import castleSVG from './castle.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const castle: Charge = {
  name: 'castle',
  pluralName: 'castles',
  SVG: castleSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['castle', 'objects'],
};
