import type { Charge } from '../../charge-types.js';
import hareCouchantSVG from './hare-couchant.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const hareCouchant: Charge = {
  name: 'hare couchant',
  pluralName: 'hares couchant',
  SVG: hareCouchantSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['hare', 'couchant', 'animals'],
};
