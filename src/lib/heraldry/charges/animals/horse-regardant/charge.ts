import type { Charge } from '../../charge-types.js';
import horseRegardantSVG from './horse-regardant.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const horseRegardant: Charge = {
  name: 'horse regardant',
  pluralName: 'horses regardant',
  SVG: horseRegardantSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['regardant', 'horse', 'animals'],
};
