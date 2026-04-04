import type { Charge } from '../../charge-types.js';
import stagCouchantSVG from './stag-couchant.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const stagCouchant: Charge = {
  name: 'stag couchant',
  pluralName: 'stags couchant',
  SVG: stagCouchantSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['couchant', 'stag', 'animals'],
};
