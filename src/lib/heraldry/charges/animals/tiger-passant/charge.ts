import type { Charge } from '../../charge-types.js';
import tigerPassantSVG from './tiger-passant.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const tigerPassant: Charge = {
  name: 'tiger passant',
  pluralName: 'tigers passant',
  SVG: tigerPassantSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['passant', 'tiger', 'animals'],
};
