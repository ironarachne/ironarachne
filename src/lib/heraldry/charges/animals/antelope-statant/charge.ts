import type { Charge } from '../../charge-types.js';
import antelopeStatantSVG from './antelope-statant.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const antelopeStatant: Charge = {
  name: 'antelope statant',
  pluralName: 'antelopes statant',
  SVG: antelopeStatantSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['antelope', 'statant', 'animals'],
};
