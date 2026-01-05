import type { Charge } from '../../charge-types.js';
import galleonSVG from './galleon.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const galleon: Charge = {
  name: 'galleon',
  pluralName: 'galleons',
  SVG: galleonSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['galleon', 'objects'],
};
