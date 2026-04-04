import type { Charge } from '../../charge-types.js';
import oxStatantSVG from './ox-statant.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const oxStatant: Charge = {
  name: 'ox statant',
  pluralName: 'oxes statant',
  SVG: oxStatantSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['ox', 'statant', 'animals'],
};
