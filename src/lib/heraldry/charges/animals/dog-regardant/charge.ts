import type { Charge } from '../../charge-types.js';
import dogRegardantSVG from './dog-regardant.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const dogRegardant: Charge = {
  name: 'dog regardant',
  pluralName: 'dogs regardant',
  SVG: dogRegardantSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['regardant', 'dog', 'animals'],
};
