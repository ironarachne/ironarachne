import type { Charge } from '../../charge-types.js';
import roseSVG from './rose.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const rose: Charge = {
  name: 'rose',
  pluralName: 'roses',
  SVG: roseSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['plant', 'rose', 'beauty'],
};
