import type { Charge } from '../../charge-types.js';
import eagleVolantSVG from './eagle-volant.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const eagleVolant: Charge = {
  name: 'eagle volant',
  pluralName: 'eagles volant',
  SVG: eagleVolantSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['volant', 'eagle', 'animals'],
};
