import type { Charge } from '../../charge-types.js';
import battleaxeSVG from './battleaxe.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const battleaxe: Charge = {
  name: 'battleaxe',
  pluralName: 'battleaxes',
  SVG: battleaxeSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['weapon', 'axe', 'battle'],
};
