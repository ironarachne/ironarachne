import type { Charge } from '../../charge-types.js';
import heronVolantSVG from './heron-volant.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const heronVolant: Charge = {
  name: 'heron volant',
  pluralName: 'herons volant',
  SVG: heronVolantSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['volant', 'heron', 'animals'],
};
