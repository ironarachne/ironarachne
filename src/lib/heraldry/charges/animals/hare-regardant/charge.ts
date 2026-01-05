import type { Charge } from '../../charge-types.js';
import hareRegardantSVG from './hare-regardant.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const hareRegardant: Charge = {
  name: 'hare regardant',
  pluralName: 'hares regardant',
  SVG: hareRegardantSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['regardant', 'hare', 'animals'],
};
