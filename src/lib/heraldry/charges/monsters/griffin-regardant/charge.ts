import type { Charge } from '../../charge-types.js';
import griffinRegardantSVG from './griffin-regardant.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const griffinRegardant: Charge = {
  name: 'griffin regardant',
  pluralName: 'griffins regardant',
  SVG: griffinRegardantSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['monsters', 'griffin', 'regardant'],
};
