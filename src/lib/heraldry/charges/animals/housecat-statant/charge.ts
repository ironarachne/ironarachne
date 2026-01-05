import type { Charge } from '../../charge-types.js';
import housecatStatantSVG from './housecat-statant.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const housecatStatant: Charge = {
  name: 'housecat statant',
  pluralName: 'housecats statant',
  SVG: housecatStatantSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['housecat', 'statant', 'animals'],
};
