import type { Charge } from '../../charge-types.js';
import leopardStatantSVG from './leopard-statant.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const leopardStatant: Charge = {
  name: 'leopard statant',
  pluralName: 'leopards statant',
  SVG: leopardStatantSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['statant', 'leopard', 'animals'],
};
