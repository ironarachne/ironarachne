import type { Charge } from '../../charge-types.js';
import dragonSalientSVG from './dragon-salient.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const dragonSalient: Charge = {
  name: 'dragon salient',
  pluralName: 'dragons salient',
  SVG: dragonSalientSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['monsters', 'salient', 'dragon'],
};
