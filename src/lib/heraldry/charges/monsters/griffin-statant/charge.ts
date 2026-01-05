import type { Charge } from '../../charge-types.js';
import griffinStatantSVG from './griffin-statant.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const griffinStatant: Charge = {
  name: 'griffin statant',
  pluralName: 'griffins statant',
  SVG: griffinStatantSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['monsters', 'griffin', 'statant'],
};
