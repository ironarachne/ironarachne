import type { Charge } from '../../charge-types.js';
import unicornRampantSVG from './unicorn-rampant.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const unicornRampant: Charge = {
  name: 'unicorn rampant',
  pluralName: 'unicorns rampant',
  SVG: unicornRampantSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['monsters', 'rampant', 'unicorn'],
};
