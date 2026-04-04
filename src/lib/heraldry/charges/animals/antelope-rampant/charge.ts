import type { Charge } from '../../charge-types.js';
import antelopeRampantSVG from './antelope-rampant.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const antelopeRampant: Charge = {
  name: 'antelope rampant',
  pluralName: 'antelopes rampant',
  SVG: antelopeRampantSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['antelope', 'rampant', 'animals'],
};
