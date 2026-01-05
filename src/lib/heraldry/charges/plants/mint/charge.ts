import type { Charge } from '../../charge-types.js';
import mintSVG from './mint.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const mint: Charge = {
  name: 'mint',
  pluralName: 'mints',
  SVG: mintSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['plants', 'mint'],
};
