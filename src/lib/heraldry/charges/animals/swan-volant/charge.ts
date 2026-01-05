import type { Charge } from '../../charge-types.js';
import swanVolantSVG from './swan-volant.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const swanVolant: Charge = {
  name: 'swan volant',
  pluralName: 'swans volant',
  SVG: swanVolantSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['volant', 'swan', 'animals'],
};
