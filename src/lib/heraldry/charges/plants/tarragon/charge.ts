import type { Charge } from '../../charge-types.js';
import tarragonSVG from './tarragon.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const tarragon: Charge = {
  name: 'tarragon',
  pluralName: 'tarragons',
  SVG: tarragonSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['tarragon', 'plants'],
};
