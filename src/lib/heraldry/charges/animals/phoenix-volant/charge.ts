import type { Charge } from '../../charge-types.js';
import phoenixVolantSVG from './phoenix-volant.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const phoenixVolant: Charge = {
  name: 'phoenix volant',
  pluralName: 'phoenixes volant',
  SVG: phoenixVolantSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['volant', 'phoenix', 'animals'],
};
