import type { Charge } from '../../charge-types.js';
import pegasusSalientSVG from './pegasus-salient.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const pegasusSalient: Charge = {
  name: 'pegasus salient',
  pluralName: 'pegasuses salient',
  SVG: pegasusSalientSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['monsters', 'pegasus', 'salient'],
};
