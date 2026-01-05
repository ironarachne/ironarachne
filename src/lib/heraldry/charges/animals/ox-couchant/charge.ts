import type { Charge } from '../../charge-types.js';
import oxCouchantSVG from './ox-couchant.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const oxCouchant: Charge = {
  name: 'ox couchant',
  pluralName: 'oxes couchant',
  SVG: oxCouchantSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['ox', 'couchant', 'animals'],
};
