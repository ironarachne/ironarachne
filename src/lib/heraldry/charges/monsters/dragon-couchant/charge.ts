import type { Charge } from '../../charge-types.js';
import dragonCouchantSVG from './dragon-couchant.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const dragonCouchant: Charge = {
  name: 'dragon couchant',
  pluralName: 'dragons couchant',
  SVG: dragonCouchantSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['monsters', 'couchant', 'dragon'],
};
