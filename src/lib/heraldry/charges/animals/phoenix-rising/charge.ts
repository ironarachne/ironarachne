import type { Charge } from '../../charge-types.js';
import phoenixRisingSVG from './phoenix-rising.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const phoenixRising: Charge = {
  name: 'phoenix rising',
  pluralName: 'phoenixes rising',
  SVG: phoenixRisingSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['rising', 'phoenix', 'animals'],
};
