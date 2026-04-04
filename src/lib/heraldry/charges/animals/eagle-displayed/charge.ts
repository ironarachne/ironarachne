import type { Charge } from '../../charge-types.js';
import eagleDisplayedSVG from './eagle-displayed.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const eagleDisplayed: Charge = {
  name: 'eagle displayed',
  pluralName: 'eagles displayed',
  SVG: eagleDisplayedSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['eagle', 'displayed', 'animals'],
};
