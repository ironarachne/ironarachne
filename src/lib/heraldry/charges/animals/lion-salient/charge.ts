import type { Charge } from '../../charge-types.js';
import lionSalientSVG from './lion-salient.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const lionSalient: Charge = {
  name: 'lion salient',
  pluralName: 'lions salient',
  SVG: lionSalientSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['lion', 'salient', 'animals'],
};
