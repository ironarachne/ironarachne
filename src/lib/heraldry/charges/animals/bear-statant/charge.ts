import type { Charge } from '../../charge-types.js';
import bearStatantSVG from './bear-statant.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const bearStatant: Charge = {
  name: 'bear statant',
  pluralName: 'bears statant',
  SVG: bearStatantSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['bear', 'statant', 'animals'],
};
