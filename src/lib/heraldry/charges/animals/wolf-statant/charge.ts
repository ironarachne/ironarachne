import type { Charge } from '../../charge-types.js';
import wolfStatantSVG from './wolf-statant.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const wolfStatant: Charge = {
  name: 'wolf statant',
  pluralName: 'wolves statant',
  SVG: wolfStatantSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['wolf', 'statant', 'animals'],
};
