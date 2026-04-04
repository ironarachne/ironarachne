import type { Charge } from '../../charge-types.js';
import boarRegardantSVG from './boar-regardant.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const boarRegardant: Charge = {
  name: 'boar regardant',
  pluralName: 'boars regardant',
  SVG: boarRegardantSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['regardant', 'boar', 'animals'],
};
