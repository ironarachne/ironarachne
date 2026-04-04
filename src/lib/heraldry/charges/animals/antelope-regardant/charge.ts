import type { Charge } from '../../charge-types.js';
import antelopeRegardantSVG from './antelope-regardant.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const antelopeRegardant: Charge = {
  name: 'antelope regardant',
  pluralName: 'antelopes regardant',
  SVG: antelopeRegardantSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['regardant', 'antelope', 'animals'],
};
