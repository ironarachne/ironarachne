import type { Charge } from '../../charge-types.js';
import ramPassantSVG from './ram-passant.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const ramPassant: Charge = {
  name: 'ram passant',
  pluralName: 'rams passant',
  SVG: ramPassantSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['passant', 'ram', 'animals'],
};
