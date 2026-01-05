import type { Charge } from '../../charge-types.js';
import pegasusPassantSVG from './pegasus-passant.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const pegasusPassant: Charge = {
  name: 'pegasus passant',
  pluralName: 'pegasuses passant',
  SVG: pegasusPassantSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['monsters', 'passant', 'pegasus'],
};
