import type { Charge } from '../../charge-types.js';
import mermanSVG from './merman.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const merman: Charge = {
  name: 'merman',
  pluralName: 'mermans',
  SVG: mermanSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['monsters', 'merman'],
};
