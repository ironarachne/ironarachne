import type { Charge } from '../../charge-types.js';
import heronSVG from './heron.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const heron: Charge = {
  name: 'heron',
  pluralName: 'herons',
  SVG: heronSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['bird', 'heron', 'water'],
};
