import type { Charge } from '../../charge-types.js';
import wolfPassantSVG from './wolf-passant.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const wolfPassant: Charge = {
  name: 'wolf passant',
  pluralName: 'wolves passant',
  SVG: wolfPassantSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['passant', 'wolf', 'animals'],
};
