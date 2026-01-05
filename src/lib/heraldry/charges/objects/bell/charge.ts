import type { Charge } from '../../charge-types.js';
import bellSVG from './bell.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const bell: Charge = {
  name: 'bell',
  pluralName: 'bells',
  SVG: bellSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['bell', 'objects'],
};
