import type { Charge } from '../../charge-types.js';
import griffinSalientSVG from './griffin-salient.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const griffinSalient: Charge = {
  name: 'griffin salient',
  pluralName: 'griffins salient',
  SVG: griffinSalientSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['monsters', 'griffin', 'salient'],
};
