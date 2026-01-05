import type { Charge } from '../../charge-types.js';
import ostrichSVG from './ostrich.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const ostrich: Charge = {
  name: 'ostrich',
  pluralName: 'ostriches',
  SVG: ostrichSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['ostrich', 'animals'],
};
