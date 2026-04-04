import type { Charge } from '../../charge-types.js';
import stagRegardantSVG from './stag-regardant.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const stagRegardant: Charge = {
  name: 'stag regardant',
  pluralName: 'stags regardant',
  SVG: stagRegardantSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['regardant', 'stag', 'animals'],
};
