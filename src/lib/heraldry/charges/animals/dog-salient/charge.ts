import type { Charge } from '../../charge-types.js';
import dogSalientSVG from './dog-salient.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const dogSalient: Charge = {
  name: 'dog salient',
  pluralName: 'dogs salient',
  SVG: dogSalientSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['dog', 'salient', 'animals'],
};
