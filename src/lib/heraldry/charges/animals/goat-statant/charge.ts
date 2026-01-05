import type { Charge } from '../../charge-types.js';
import goatStatantSVG from './goat-statant.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const goatStatant: Charge = {
  name: 'goat statant',
  pluralName: 'goats statant',
  SVG: goatStatantSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['statant', 'goat', 'animals'],
};
