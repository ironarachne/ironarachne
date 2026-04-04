import type { Charge } from '../../charge-types.js';
import bearSalientSVG from './bear-salient.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const bearSalient: Charge = {
  name: 'bear salient',
  pluralName: 'bears salient',
  SVG: bearSalientSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['bear', 'salient', 'animals'],
};
