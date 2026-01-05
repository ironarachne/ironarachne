import type { Charge } from '../../charge-types.js';
import allocamelusRampantSVG from './allocamelus-rampant.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const allocamelusRampant: Charge = {
  name: 'allocamelus rampant',
  pluralName: 'allocameluses rampant',
  SVG: allocamelusRampantSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['monsters', 'rampant', 'allocamelus'],
};
