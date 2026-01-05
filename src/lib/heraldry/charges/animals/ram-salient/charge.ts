import type { Charge } from '../../charge-types.js';
import ramSalientSVG from './ram-salient.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const ramSalient: Charge = {
  name: 'ram salient',
  pluralName: 'rams salient',
  SVG: ramSalientSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['ram', 'salient', 'animals'],
};
