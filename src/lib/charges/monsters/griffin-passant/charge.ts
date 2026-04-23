import type { ChargeGlyph } from '../../charge-types.js';
import griffinPassantSVG from './griffin-passant.svg?raw';

export const griffinPassant: ChargeGlyph = {
  name: 'griffin passant',
  pluralName: 'griffins passant',
  SVG: griffinPassantSVG,
  chargeType: 'regular',
  tags: ['monsters', 'passant', 'griffin'],
};
