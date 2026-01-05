import type { Charge } from '../../charge-types.js';
import wyvernCouchantSVG from './wyvern-couchant.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const wyvernCouchant: Charge = {
  name: 'wyvern couchant',
  pluralName: 'wyverns couchant',
  SVG: wyvernCouchantSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['monsters', 'wyvern', 'couchant'],
};
