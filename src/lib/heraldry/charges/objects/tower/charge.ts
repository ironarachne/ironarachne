import type { Charge } from '../../charge-types.js';
import towerSVG from './tower.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const tower: Charge = {
  name: 'tower',
  pluralName: 'towers',
  SVG: towerSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['tower', 'objects'],
};
