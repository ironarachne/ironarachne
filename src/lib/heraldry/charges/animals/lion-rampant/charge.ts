import type { Charge } from '../../charge-types.js';
import lionRampantSVG from './lion-rampant.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const lionRampant: Charge = {
  name: 'lion rampant',
  pluralName: 'lions rampant',
  SVG: lionRampantSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['lion', 'rampant', 'animals'],
};
