import type { Charge } from '../../charge-types.js';
import foxPassantSVG from './fox-passant.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const foxPassant: Charge = {
  name: 'fox passant',
  pluralName: 'foxes passant',
  SVG: foxPassantSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['passant', 'fox', 'animals'],
};
