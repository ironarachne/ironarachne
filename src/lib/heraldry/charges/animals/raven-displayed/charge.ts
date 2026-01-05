import type { Charge } from '../../charge-types.js';
import ravenDisplayedSVG from './raven-displayed.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const ravenDisplayed: Charge = {
  name: 'raven displayed',
  pluralName: 'ravens displayed',
  SVG: ravenDisplayedSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['raven', 'displayed', 'animals'],
};
