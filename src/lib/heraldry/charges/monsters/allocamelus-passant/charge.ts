import type { Charge } from '../../charge-types.js';
import allocamelusPassantSVG from './allocamelus-passant.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const allocamelusPassant: Charge = {
  name: 'allocamelus passant',
  pluralName: 'allocameluses passant',
  SVG: allocamelusPassantSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['monsters', 'passant', 'allocamelus'],
};
