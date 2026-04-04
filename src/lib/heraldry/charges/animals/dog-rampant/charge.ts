import type { Charge } from '../../charge-types.js';
import dogRampantSVG from './dog-rampant.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const dogRampant: Charge = {
  name: 'dog rampant',
  pluralName: 'dogs rampant',
  SVG: dogRampantSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['dog', 'rampant', 'animals'],
};
