import type { Charge } from '../../charge-types.js';
import griffinPassantSVG from './griffin-passant.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const griffinPassant: Charge = {
  name: 'griffin passant',
  pluralName: 'griffins passant',
  SVG: griffinPassantSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['monsters', 'passant', 'griffin'],
};
