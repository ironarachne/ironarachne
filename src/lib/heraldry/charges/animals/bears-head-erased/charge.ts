import type { Charge } from '../../charge-types.js';
import bearsHeadErasedSVG from './bears-head-erased.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const bearsHeadErased: Charge = {
  name: 'bears head erased',
  pluralName: 'bearses head erased',
  SVG: bearsHeadErasedSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['bears', 'erased', 'head', 'animals'],
};
