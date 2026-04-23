import type { ChargeGlyph } from '../../charge-types.js';
import batDisplayedSVG from './bat-displayed.svg?raw';

export const batDisplayed: ChargeGlyph = {
  name: 'bat displayed',
  pluralName: 'bats displayed',
  SVG: batDisplayedSVG,
  chargeType: 'regular',
  tags: ['bat', 'displayed', 'animals'],
};
