import type { Charge } from '../../charge-types.js';
import bearPassantSVG from './bear-passant.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const bearPassant: Charge = {
  name: 'bear passant',
  pluralName: 'bears passant',
  SVG: bearPassantSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['passant', 'bear', 'animals'],
};
