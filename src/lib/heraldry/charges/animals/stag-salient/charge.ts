import type { Charge } from '../../charge-types.js';
import stagSalientSVG from './stag-salient.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const stagSalient: Charge = {
  name: 'stag salient',
  pluralName: 'stags salient',
  SVG: stagSalientSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['stag', 'salient', 'animals'],
};
