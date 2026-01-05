import type { Charge } from '../../charge-types.js';
import lionsHeadErasedSVG from './lions-head-erased.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const lionsHeadErased: Charge = {
  name: 'lions head erased',
  pluralName: 'lions heads erased',
  SVG: lionsHeadErasedSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['animal', 'lion', 'heraldry'],
};
