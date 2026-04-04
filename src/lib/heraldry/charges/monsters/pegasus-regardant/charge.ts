import type { Charge } from '../../charge-types.js';
import pegasusRegardantSVG from './pegasus-regardant.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const pegasusRegardant: Charge = {
  name: 'pegasus regardant',
  pluralName: 'pegasuses regardant',
  SVG: pegasusRegardantSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['monsters', 'pegasus', 'regardant'],
};
