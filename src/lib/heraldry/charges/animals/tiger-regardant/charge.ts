import type { Charge } from '../../charge-types.js';
import tigerRegardantSVG from './tiger-regardant.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const tigerRegardant: Charge = {
  name: 'tiger regardant',
  pluralName: 'tigers regardant',
  SVG: tigerRegardantSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['regardant', 'tiger', 'animals'],
};
