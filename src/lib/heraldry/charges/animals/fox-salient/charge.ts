import type { Charge } from '../../charge-types.js';
import foxSalientSVG from './fox-salient.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const foxSalient: Charge = {
  name: 'fox salient',
  pluralName: 'foxes salient',
  SVG: foxSalientSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['salient', 'fox', 'animals'],
};
