import type { Charge } from '../../charge-types.js';
import unicornPassantSVG from './unicorn-passant.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const unicornPassant: Charge = {
  name: 'unicorn passant',
  pluralName: 'unicorns passant',
  SVG: unicornPassantSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['monsters', 'passant', 'unicorn'],
};
