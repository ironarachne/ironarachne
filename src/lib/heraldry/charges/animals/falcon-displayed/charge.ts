import type { Charge } from '../../charge-types.js';
import falconDisplayedSVG from './falcon-displayed.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const falconDisplayed: Charge = {
  name: 'falcon displayed',
  pluralName: 'falcons displayed',
  SVG: falconDisplayedSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['falcon', 'displayed', 'animals'],
};
