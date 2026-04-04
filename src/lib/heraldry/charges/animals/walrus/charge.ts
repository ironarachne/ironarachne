import type { Charge } from '../../charge-types.js';
import walrusSVG from './walrus.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const walrus: Charge = {
  name: 'walrus',
  pluralName: 'walruses',
  SVG: walrusSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['walrus', 'animals'],
};
