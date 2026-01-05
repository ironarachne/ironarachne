import type { Charge } from '../../charge-types.js';
import bearHeadCoupedSVG from './bear-head-couped.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const bearHeadCouped: Charge = {
  name: 'bear head couped',
  pluralName: 'bear heads couped',
  SVG: bearHeadCoupedSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['animal', 'bear', 'heraldry'],
};
