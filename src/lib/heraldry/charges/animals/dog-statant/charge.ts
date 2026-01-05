import type { Charge } from '../../charge-types.js';
import dogStatantSVG from './dog-statant.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const dogStatant: Charge = {
  name: 'dog statant',
  pluralName: 'dogs statant',
  SVG: dogStatantSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['dog', 'statant', 'animals'],
};
