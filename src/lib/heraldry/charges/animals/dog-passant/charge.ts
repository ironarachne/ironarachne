import type { Charge } from '../../charge-types.js';
import dogPassantSVG from './dog-passant.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const dogPassant: Charge = {
  name: 'dog passant',
  pluralName: 'dogs passant',
  SVG: dogPassantSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['passant', 'dog', 'animals'],
};
