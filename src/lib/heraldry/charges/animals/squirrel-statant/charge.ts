import type { Charge } from '../../charge-types.js';
import squirrelStatantSVG from './squirrel-statant.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const squirrelStatant: Charge = {
  name: 'squirrel statant',
  pluralName: 'squirrels statant',
  SVG: squirrelStatantSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['statant', 'squirrel', 'animals'],
};
