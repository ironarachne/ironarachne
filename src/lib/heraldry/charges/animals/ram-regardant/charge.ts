import type { Charge } from '../../charge-types.js';
import ramRegardantSVG from './ram-regardant.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const ramRegardant: Charge = {
  name: 'ram regardant',
  pluralName: 'rams regardant',
  SVG: ramRegardantSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['regardant', 'ram', 'animals'],
};
