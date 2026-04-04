import type { Charge } from '../../charge-types.js';
import horseStatantSVG from './horse-statant.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const horseStatant: Charge = {
  name: 'horse statant',
  pluralName: 'horses statant',
  SVG: horseStatantSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['horse', 'statant', 'animals'],
};
