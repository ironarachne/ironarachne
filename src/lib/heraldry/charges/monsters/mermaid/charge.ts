import type { Charge } from '../../charge-types.js';
import mermaidSVG from './mermaid.svg?raw';
import * as Tinctures from '../../../tinctures.js';

export const mermaid: Charge = {
  name: 'mermaid',
  pluralName: 'mermaids',
  SVG: mermaidSVG,
  chargeType: 'regular',
  tincture: Tinctures.byName('sable'),
  tags: ['monsters', 'mermaid'],
};
