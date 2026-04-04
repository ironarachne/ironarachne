import type { Charge } from '../../charge-types.js';
import wolfSejantErectSVG from './wolf-sejant-erect.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const wolfSejantErect: Charge = {
  name: 'wolf sejant erect',
  pluralName: 'wolves sejant erect',
  SVG: wolfSejantErectSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['sejant', 'wolf', 'erect', 'animals'],
};
