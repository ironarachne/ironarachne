import type { Charge } from '../../charge-types.js';
import wolfSalientSVG from './wolf-salient.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const wolfSalient: Charge = {
  name: 'wolf salient',
  pluralName: 'wolves salient',
  SVG: wolfSalientSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['wolf', 'salient', 'animals'],
};
