import type { Charge } from '../../charge-types.js';
import dogCouchantSVG from './dog-couchant.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const dogCouchant: Charge = {
  name: 'dog couchant',
  pluralName: 'dogs couchant',
  SVG: dogCouchantSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['couchant', 'dog', 'animals'],
};
