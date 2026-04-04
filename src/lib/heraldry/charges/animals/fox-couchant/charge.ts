import type { Charge } from '../../charge-types.js';
import foxCouchantSVG from './fox-couchant.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const foxCouchant: Charge = {
  name: 'fox couchant',
  pluralName: 'foxes couchant',
  SVG: foxCouchantSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['couchant', 'fox', 'animals'],
};
