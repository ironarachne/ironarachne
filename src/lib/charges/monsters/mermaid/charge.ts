import type { ChargeGlyph } from '../../charge-types.js';
import mermaidSVG from './mermaid.svg?raw';

export const mermaid: ChargeGlyph = {
  name: 'mermaid',
  pluralName: 'mermaids',
  SVG: mermaidSVG,
  chargeType: 'regular',
  tags: ['monsters', 'mermaid'],
};
