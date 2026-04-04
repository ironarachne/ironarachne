import type { Charge } from '../../charge-types.js';
import squirrelPassantSVG from './squirrel-passant.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const squirrelPassant: Charge = {
  name: 'squirrel passant',
  pluralName: 'squirrels passant',
  SVG: squirrelPassantSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['passant', 'squirrel', 'animals'],
};
