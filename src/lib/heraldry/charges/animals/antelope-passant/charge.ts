import type { Charge } from '../../charge-types.js';
import antelopePassantSVG from './antelope-passant.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const antelopePassant: Charge = {
  name: 'antelope passant',
  pluralName: 'antelopes passant',
  SVG: antelopePassantSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['passant', 'antelope', 'animals'],
};
