import type { Charge } from '../../charge-types.js';
import hareRampantSVG from './hare-rampant.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const hareRampant: Charge = {
  name: 'hare rampant',
  pluralName: 'hares rampant',
  SVG: hareRampantSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['hare', 'rampant', 'animals'],
};
