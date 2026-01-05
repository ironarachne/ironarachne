import type { Charge } from '../../charge-types.js';
import treeEradicatedSVG from './tree-eradicated.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const treeEradicated: Charge = {
  name: 'tree eradicated',
  pluralName: 'trees eradicated',
  SVG: treeEradicatedSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['tree', 'plants', 'eradicated'],
};
