import type { Charge } from '../../charge-types.js';
import unicornSalientSVG from './unicorn-salient.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const unicornSalient: Charge = {
  name: 'unicorn salient',
  pluralName: 'unicorns salient',
  SVG: unicornSalientSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['monsters', 'unicorn', 'salient'],
};
