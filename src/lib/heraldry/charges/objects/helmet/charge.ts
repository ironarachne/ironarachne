import type { Charge } from '../../charge-types.js';
import helmetSVG from './helmet.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const helmet: Charge = {
  name: 'helmet',
  pluralName: 'helmets',
  SVG: helmetSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['helmet', 'objects'],
};
