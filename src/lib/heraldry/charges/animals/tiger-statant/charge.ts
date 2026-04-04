import type { Charge } from '../../charge-types.js';
import tigerStatantSVG from './tiger-statant.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const tigerStatant: Charge = {
  name: 'tiger statant',
  pluralName: 'tigers statant',
  SVG: tigerStatantSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['tiger', 'statant', 'animals'],
};
