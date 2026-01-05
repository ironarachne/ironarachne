import type { Charge } from '../../charge-types.js';
import escallopSVG from './escallop.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const escallop: Charge = {
  name: 'escallop',
  pluralName: 'escallops',
  SVG: escallopSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['escallop', 'symbols'],
};
