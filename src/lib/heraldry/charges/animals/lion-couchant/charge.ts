import type { Charge } from '../../charge-types.js';
import lionCouchantSVG from './lion-couchant.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const lionCouchant: Charge = {
  name: 'lion couchant',
  pluralName: 'lions couchant',
  SVG: lionCouchantSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['lion', 'couchant', 'animals'],
};
