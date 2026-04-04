import type { Charge } from '../../charge-types.js';
import goatRampantSVG from './goat-rampant.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const goatRampant: Charge = {
  name: 'goat rampant',
  pluralName: 'goats rampant',
  SVG: goatRampantSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['rampant', 'goat', 'animals'],
};
