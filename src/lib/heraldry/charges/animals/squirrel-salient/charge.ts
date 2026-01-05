import type { Charge } from '../../charge-types.js';
import squirrelSalientSVG from './squirrel-salient.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const squirrelSalient: Charge = {
  name: 'squirrel salient',
  pluralName: 'squirrels salient',
  SVG: squirrelSalientSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['salient', 'squirrel', 'animals'],
};
