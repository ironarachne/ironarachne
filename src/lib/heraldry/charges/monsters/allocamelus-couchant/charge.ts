import type { Charge } from '../../charge-types.js';
import allocamelusCouchantSVG from './allocamelus-couchant.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const allocamelusCouchant: Charge = {
  name: 'allocamelus couchant',
  pluralName: 'allocameluses couchant',
  SVG: allocamelusCouchantSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['monsters', 'couchant', 'allocamelus'],
};
