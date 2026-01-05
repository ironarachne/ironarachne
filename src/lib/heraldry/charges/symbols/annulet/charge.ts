import type { Charge } from '../../charge-types.js';
import annuletSVG from './annulet.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const annulet: Charge = {
  name: 'annulet',
  pluralName: 'annulets',
  SVG: annuletSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['annulet', 'symbols'],
};
