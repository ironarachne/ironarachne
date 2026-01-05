import type { Charge } from '../../charge-types.js';
import griffinCouchantSVG from './griffin-couchant.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const griffinCouchant: Charge = {
  name: 'griffin couchant',
  pluralName: 'griffins couchant',
  SVG: griffinCouchantSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['monsters', 'couchant', 'griffin'],
};
